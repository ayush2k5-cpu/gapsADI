"""
main.py — FastAPI application for Scriptoria.
All 5 endpoints: /api/generate, /api/analyze, /api/moodboard, /api/translate, /api/export
Never return a raw 500 to the frontend. Always catch and return structured error JSON.
"""
import io
import json
import logging
import os
import uuid

import db
import ai_client
import mock_data
import moodboard as moodboard_module
from ad_intelligence import build_analysis_prompt
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger: logging.Logger = logging.getLogger(__name__)

app = FastAPI(title="Scriptoria API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    """Initialise the database on application startup."""
    try:
        db.init_db()
    except Exception as exc:
        logger.error("Failed to init DB: %s", exc)


# ---------------------------------------------------------------------------
# Pydantic request models
# ---------------------------------------------------------------------------


class GenerateRequest(BaseModel):
    story_idea: str
    genre: str
    language: str
    tone: int


class AnalyzeRequest(BaseModel):
    project_id: str


class MoodboardRequest(BaseModel):
    project_id: str
    act: int


class TranslateRequest(BaseModel):
    project_id: str
    target_language: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_LANG_CODES: dict[str, str] = {
    "Hindi": "hi-IN",
    "Tamil": "ta-IN",
    "Telugu": "te-IN",
    "Bengali": "bn-IN",
    "English": "en-IN",
}


def _build_safe_default(scene_count: int, characters: list) -> dict:
    """Build the safe default analysis response for when Gemini analysis fails.

    Args:
        scene_count: Number of scenes in the screenplay.
        characters: List of character dicts.

    Returns:
        A fully-populated analysis dict using score=50 for all fields.
    """
    return {
        "health_score": 50,
        "pacing_score": 50,
        "balance_score": 50,
        "tension_score": 50,
        "tension_curve": [{"scene": i + 1, "score": 50} for i in range(scene_count)],
        "character_heatmap": {
            c["name"]: {"act1": 50, "act2": 50, "act3": 50}
            for c in characters
            if isinstance(c, dict) and c.get("name")
        },
        "pacing_blocks": [{"scene": i + 1, "speed": "medium"} for i in range(scene_count)],
        "flags": [],
    }


# ---------------------------------------------------------------------------
# POST /api/generate
# ---------------------------------------------------------------------------


@app.post("/api/generate")
async def generate_pipeline(request: GenerateRequest) -> JSONResponse:
    """Core generation pipeline: story idea → screenplay + character profiles.

    Args:
        request: GenerateRequest with story_idea, genre, language, tone.

    Returns:
        JSONResponse with project_id, screenplay, scene_count, characters.
    """
    # Validate story_idea length
    if not (10 <= len(request.story_idea) <= 1000):
        return JSONResponse(
            status_code=400,
            content={
                "error": True,
                "code": "VALIDATION_ERROR",
                "message": "story_idea must be between 10 and 1000 characters",
            },
        )

    # RAG context — optional; skip gracefully if RAG not set up
    rag_context: str = ""
    try:
        from rag.retriever import retrieve_context  # type: ignore[import]
        rag_context = retrieve_context(request.story_idea, request.genre)
        logger.info("generate_pipeline: RAG context retrieved (%d chars)", len(rag_context))
    except Exception as rag_exc:
        logger.info("generate_pipeline: RAG unavailable — proceeding without context: %s", rag_exc)

    # Build Gemini prompt
    system_instruction = (
        "You are a professional screenplay writer. Write in standard industry screenplay format."
    )
    rag_section = ""
    if rag_context:
        rag_section = (
            f"\nReference these real screenplay scene patterns for structural guidance. "
            f"Do not copy them — use for structure and pacing:\n{rag_context}\n"
        )

    main_instruction = (
        f"Write a {request.genre} screenplay ({request.language}) with exactly 20 scenes. "
        f"Tone: {request.tone}/100 (0=mass commercial, 100=arthouse). "
        f"Story: {request.story_idea}\n\n"
        f"Format:\nINT./EXT. LOCATION - TIME\n\nAction line.\n\n"
        f"                    CHARACTER\n          Dialogue.\n\n"
        f"Return ONLY the screenplay text."
    )

    prompt: str = f"{system_instruction}\n{rag_section}\n{main_instruction}"

    try:
        screenplay: str = ai_client.generate(prompt)
    except RuntimeError as exc:
        if "RATE_LIMIT" in str(exc):
            return JSONResponse(
                status_code=429,
                content={
                    "error": True,
                    "code": "GEMINI_RATE_LIMIT",
                    "message": str(exc),
                },
            )
        return JSONResponse(
            status_code=503,
            content={
                "error": True,
                "code": "UNKNOWN",
                "message": str(exc),
            },
        )
    except Exception as exc:
        logger.error("generate_pipeline: unexpected error: %s", exc)
        return JSONResponse(
            status_code=503,
            content={
                "error": True,
                "code": "UNKNOWN",
                "message": str(exc),
            },
        )

    # Extract characters via Ollama/Groq
    characters: list = ai_client.generate_characters(screenplay)

    # Count scenes
    scene_count: int = screenplay.count("INT.") + screenplay.count("EXT.")

    # Persist to DB
    project_id: str = str(uuid.uuid4())
    try:
        db.save_project(
            project_id,
            request.story_idea,
            request.genre,
            request.language,
            request.tone,
            screenplay,
            characters,
        )
    except Exception as db_exc:
        logger.error("generate_pipeline: DB save failed: %s", db_exc)
        # Still return the result — user can use it even if persistence failed

    logger.info(
        "generate_pipeline: project_id=%s scenes=%d characters=%d",
        project_id,
        scene_count,
        len(characters),
    )
    return JSONResponse(
        content={
            "project_id": project_id,
            "screenplay": screenplay,
            "scene_count": scene_count,
            "characters": characters,
        }
    )


# ---------------------------------------------------------------------------
# POST /api/analyze
# ---------------------------------------------------------------------------


@app.post("/api/analyze")
async def analyze_pipeline(request: AnalyzeRequest) -> JSONResponse:
    """Run AD Intelligence analysis on a previously generated screenplay.

    Args:
        request: AnalyzeRequest with project_id.

    Returns:
        JSONResponse with full analysis including health_score.
        NEVER returns a 500 — falls back to safe default on any failure.
    """
    project: dict | None = db.get_project(request.project_id)
    if project is None:
        return JSONResponse(
            status_code=400,
            content={
                "error": True,
                "code": "VALIDATION_ERROR",
                "message": "Project not found",
            },
        )

    screenplay: str = project.get("screenplay", "") or ""
    characters: list = project.get("characters") or []

    scene_count: int = screenplay.count("INT.") + screenplay.count("EXT.")
    if scene_count == 0:
        scene_count = 1

    safe_default: dict = _build_safe_default(scene_count, characters)

    prompt: str = build_analysis_prompt(screenplay, characters)

    result: dict = safe_default

    # Attempt Gemini analysis with one retry
    for attempt in range(2):
        try:
            raw: str = ai_client.generate(prompt, json_mode=True)
            parsed: dict = json.loads(raw)
            if isinstance(parsed, dict):
                result = parsed
                break
        except Exception as exc:
            logger.error("analyze_pipeline: attempt %d failed: %s", attempt + 1, exc)

    # Compute health_score from the three component scores
    pacing: int = int(result.get("pacing_score", 50))
    balance: int = int(result.get("balance_score", 50))
    tension: int = int(result.get("tension_score", 50))
    health_score: int = max(0, min(100, round((pacing * 0.35) + (balance * 0.35) + (tension * 0.30))))
    result["health_score"] = health_score

    # Ensure tension_curve and character_heatmap are populated
    if not result.get("tension_curve"):
        result["tension_curve"] = safe_default["tension_curve"]
    if not result.get("character_heatmap"):
        result["character_heatmap"] = safe_default["character_heatmap"]
    if not result.get("pacing_blocks"):
        result["pacing_blocks"] = safe_default["pacing_blocks"]
    if "flags" not in result:
        result["flags"] = []

    # Persist analysis
    try:
        db.update_analysis(request.project_id, result)
    except Exception as db_exc:
        logger.error("analyze_pipeline: failed to persist analysis: %s", db_exc)

    logger.info(
        "analyze_pipeline: project_id=%s health_score=%d",
        request.project_id,
        health_score,
    )
    return JSONResponse(content=result)


# ---------------------------------------------------------------------------
# POST /api/moodboard
# ---------------------------------------------------------------------------


@app.post("/api/moodboard")
async def moodboard_pipeline(request: MoodboardRequest) -> JSONResponse:
    """Return a Pollinations.ai image URL and caption for the requested act.

    Args:
        request: MoodboardRequest with project_id and act (1, 2, or 3).

    Returns:
        JSONResponse with image_url and caption. Never blocks — always returns something.
    """
    _ACT_LABELS: dict[int, str] = {1: "ESTABLISH", 2: "ESCALATE", 3: "RESOLVE"}

    project: dict | None = None
    try:
        project = db.get_project(request.project_id)
    except Exception as exc:
        logger.error("moodboard_pipeline: DB lookup failed: %s", exc)

    scene_description: str
    tone: int

    if project:
        scene_description = str(project.get("story_idea", ""))[:100]
        tone = int(project.get("tone", 50))
    else:
        logger.info("moodboard_pipeline: project not found — using generic fallback")
        scene_description = "cinematic dark film"
        tone = 50

    try:
        image_url: str = moodboard_module.build_moodboard_url(scene_description, tone, request.act)
    except Exception as exc:
        logger.error("moodboard_pipeline: URL build failed: %s", exc)
        image_url = (
            "https://image.pollinations.ai/prompt/cinematic+dark+film+still"
            "?width=1024&height=576&nologo=true"
        )

    caption: str = f"ACT {request.act} — {_ACT_LABELS.get(request.act, 'VISUAL DIRECTION')}"

    return JSONResponse(content={"image_url": image_url, "caption": caption})


# ---------------------------------------------------------------------------
# POST /api/translate
# ---------------------------------------------------------------------------


@app.post("/api/translate")
async def translate_pipeline(request: TranslateRequest) -> JSONResponse:
    """Regenerate screenplay dialogue in target language using Sarvam AI.

    Falls back to the original English screenplay if Sarvam is unavailable.
    Action lines and scene headings ALWAYS remain in English.

    Args:
        request: TranslateRequest with project_id and target_language.

    Returns:
        JSONResponse with translated_screenplay, language, note, and optional fallback flag.
    """
    screenplay: str | None = db.get_screenplay(request.project_id)
    if screenplay is None:
        return JSONResponse(
            status_code=400,
            content={
                "error": True,
                "code": "VALIDATION_ERROR",
                "message": "Project not found",
            },
        )

    lang_code: str = _LANG_CODES.get(request.target_language, "hi-IN")

    sarvam_prompt: str = (
        f"Given this screenplay, regenerate ONLY the dialogue lines in {request.target_language}.\n"
        f"Rules:\n"
        f"- Scene headings (INT./EXT. lines): keep in English, unchanged\n"
        f"- Action/description lines: keep in English, unchanged\n"
        f"- Character name lines (centered ALL CAPS): keep in English, unchanged\n"
        f"- Dialogue lines only: regenerate in {request.target_language} capturing the same "
        f"emotional intent, character voice, and cultural register — do not translate "
        f"word-for-word, write how a native speaker of that language would actually say it\n"
        f"Return the complete screenplay with these replacements applied.\n\n"
        f"SCREENPLAY:\n{screenplay}"
    )

    # Attempt Sarvam AI
    try:
        from sarvamai import SarvamAI  # type: ignore[import]
        client = SarvamAI(api_subscription_key=os.getenv("SARVAM_API_KEY", ""))
        translated = client.text.translate(
            input=screenplay,
            source_language_code="en-IN",
            target_language_code=lang_code,
        )
        translated_text: str = translated.translated_text
        logger.info(
            "translate_pipeline: Sarvam translated to %s (%d chars)",
            request.target_language,
            len(translated_text),
        )
        return JSONResponse(
            content={
                "translated_screenplay": translated_text,
                "language": request.target_language,
                "note": "Culturally Generated — Not Translated",
            }
        )
    except Exception as sarvam_err:
        logger.error("translate_pipeline: Sarvam failed: %s", sarvam_err)

    # Fallback: return original English screenplay
    logger.info("translate_pipeline: returning original English screenplay as fallback")
    return JSONResponse(
        content={
            "translated_screenplay": screenplay,
            "language": request.target_language,
            "note": "Culturally Generated — Not Translated",
            "fallback": True,
            "error_message": "Sarvam AI unavailable — showing original screenplay",
        }
    )


# ---------------------------------------------------------------------------
# POST /api/export
# ---------------------------------------------------------------------------

# Import exporter module for PDF / DOCX / TXT generation
import exporter


@app.post("/api/export", response_model=None)
async def export_pipeline(
    project_id: str = Form(...),
    format: str = Form(...),
):
    """Export the screenplay for project_id as PDF, DOCX, or TXT.

    Args:
        project_id: UUID of the project to export.
        format: One of 'pdf', 'docx', or 'txt'.

    Returns:
        StreamingResponse binary file, or JSONResponse error on failure.
    """
    _VALID_FORMATS: frozenset[str] = frozenset({"pdf", "docx", "txt"})
    if format not in _VALID_FORMATS:
        return JSONResponse(
            status_code=400,
            content={
                "error": True,
                "code": "EXPORT_FAILURE",
                "message": "format must be pdf, docx, or txt",
            },
        )

    screenplay: str | None = db.get_screenplay(project_id)
    if screenplay is None:
        return JSONResponse(
            status_code=400,
            content={
                "error": True,
                "code": "EXPORT_FAILURE",
                "message": "Project not found",
            },
        )

    _MEDIA_TYPES: dict[str, str] = {
        "pdf": "application/pdf",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "txt": "text/plain; charset=utf-8",
    }

    try:
        file_bytes: bytes
        if format == "pdf":
            file_bytes = exporter.export_pdf(screenplay, project_id)
        elif format == "docx":
            file_bytes = exporter.export_docx(screenplay, project_id)
        else:
            file_bytes = exporter.export_txt(screenplay)
    except Exception as exc:
        logger.error(
            "export_pipeline: export failed format=%s project_id=%s: %s",
            format,
            project_id,
            exc,
        )
        return JSONResponse(
            status_code=500,
            content={
                "error": True,
                "code": "EXPORT_FAILURE",
                "message": f"Failed to generate {format} — try again",
            },
        )

    short_id: str = project_id[:8]
    filename: str = f"Scriptoria_{short_id}.{format}"
    logger.info(
        "export_pipeline: returning %s for project_id=%s (%d bytes)",
        format,
        project_id,
        len(file_bytes),
    )
    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type=_MEDIA_TYPES[format],
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
