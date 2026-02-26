from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import io
import mock_data
import db
import exporter
import logging
from moodboard import build_moodboard_url, build_caption

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


@app.post("/api/generate")
async def generate_pipeline() -> dict:
    return mock_data.MOCK_GENERATE


@app.post("/api/analyze")
async def analyze_pipeline() -> dict:
    return mock_data.MOCK_ANALYZE


class MoodboardRequest(BaseModel):
    project_id: str
    act: str


@app.post("/api/moodboard")
async def moodboard_pipeline(body: MoodboardRequest) -> dict:
    """Return a Pollinations.ai image URL and caption for the requested act.

    Fetches the project from the database to derive scene description and tone.
    Never raises — always returns a dict.
    """
    try:
        project: dict | None = db.get_project(body.project_id)
        if project is None:
            return {
                "error": True,
                "code": "VALIDATION_ERROR",
                "message": "Project not found",
            }

        scene_description: str = str(project.get("story_idea", ""))[:100]
        tone: int = int(project.get("tone", 50))
        act_int: int = int(body.act)

        return {
            "image_url": build_moodboard_url(scene_description, tone, act_int),
            "caption": build_caption(act_int),
        }
    except Exception as exc:
        logger.error("moodboard_pipeline error: %s", exc)
        return {
            "image_url": (
                "https://image.pollinations.ai/prompt/"
                "cinematic+dark+film+still+dramatic"
                "?width=1024&height=576&nologo=true"
            ),
            "caption": f"ACT {body.act} — VISUAL DIRECTION",
        }


@app.post("/api/translate")
async def translate_pipeline() -> dict:
    return mock_data.MOCK_TRANSLATE


@app.post("/api/export")
async def export_pipeline(
    project_id: str = Form(...),
    format: str = Form(...),
) -> StreamingResponse | dict:
    """Export the screenplay for *project_id* as PDF, DOCX, or TXT.

    Args:
        project_id: The project to export.
        format: One of ``pdf``, ``docx``, or ``txt``.

    Returns:
        A StreamingResponse with the file bytes, or an error dict.
    """
    _VALID_FORMATS: frozenset[str] = frozenset({"pdf", "docx", "txt"})
    if format not in _VALID_FORMATS:
        return {
            "error": True,
            "code": "VALIDATION_ERROR",
            "message": "format must be pdf, docx, or txt",
        }

    screenplay: str | None = db.get_screenplay(project_id)
    if screenplay is None:
        return {
            "error": True,
            "code": "VALIDATION_ERROR",
            "message": "Project not found",
        }

    _MEDIA_TYPES: dict[str, str] = {
        "pdf": "application/pdf",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "txt": "text/plain; charset=utf-8",
    }

    try:
        if format == "pdf":
            file_bytes: bytes = exporter.export_pdf(screenplay, project_id)
        elif format == "docx":
            file_bytes = exporter.export_docx(screenplay, project_id)
        else:
            file_bytes = exporter.export_txt(screenplay)
    except Exception as exc:
        logger.error("export_pipeline: export failed format=%s project_id=%s: %s", format, project_id, exc)
        return {
            "error": True,
            "code": "EXPORT_FAILURE",
            "message": f"Failed to generate {format} — try again",
        }

    short_id: str = project_id[:8]
    filename: str = f"Scriptoria_{short_id}.{format}"
    logger.info("export_pipeline: returning %s for project_id=%s (%d bytes)", format, project_id, len(file_bytes))
    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type=_MEDIA_TYPES[format],
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
