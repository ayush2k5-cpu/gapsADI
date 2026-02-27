"""
mcp_server.py — Scriptoria MCP server (FastMCP).
Exposes three tools: generate_screenplay, analyze_script, generate_moodboard.
Run directly: python mcp_server.py
"""
import json
import logging
import os
import sys

# Add backend directory to path so local modules resolve correctly
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from mcp.server.fastmcp import FastMCP

logging.basicConfig(level=logging.INFO)
logger: logging.Logger = logging.getLogger(__name__)

mcp = FastMCP("Scriptoria")


# ---------------------------------------------------------------------------
# Tool 1 — generate_screenplay
# ---------------------------------------------------------------------------


@mcp.tool()
def generate_screenplay(
    story_idea: str,
    genre: str,
    language: str = "English",
    tone: int = 50,
) -> dict:
    """Generate a formatted 5-scene screenplay and character profiles from a story idea.

    Args:
        story_idea: Short story concept (10–400 characters).
        genre: Film genre, e.g. "Drama", "Thriller", "Romance".
        language: Target screenplay language. Defaults to "English".
        tone: 0 = mass commercial Bollywood, 100 = arthouse minimal. Defaults to 50.

    Returns:
        dict with keys: project_id, screenplay, scene_count, characters.
        On error: dict with keys: error (True), code, message.
    """
    import uuid
    import ai_client
    import db

    if not (10 <= len(story_idea) <= 400):
        return {
            "error": True,
            "code": "VALIDATION_ERROR",
            "message": "story_idea must be between 10 and 400 characters",
        }

    # RAG context — optional
    rag_context: str = ""
    try:
        from rag.retriever import retrieve_context  # type: ignore[import]
        rag_context = retrieve_context(story_idea, genre)
    except Exception as rag_exc:
        logger.info("generate_screenplay: RAG unavailable: %s", rag_exc)

    rag_section: str = ""
    if rag_context:
        rag_section = (
            f"\nReference these real screenplay scene patterns for structural guidance. "
            f"Do not copy them — use for structure and pacing:\n{rag_context[:800]}\n"
        )

    system_instruction: str = (
        "You are a professional screenplay writer. Write in standard industry screenplay format."
    )
    main_instruction: str = (
        f"Write a {genre} screenplay ({language}) with exactly 5 scenes. "
        f"Tone: {tone}/100 (0=mass commercial, 100=arthouse). "
        f"Story: {story_idea}\n\n"
        f"Format each scene exactly as:\nINT./EXT. LOCATION - TIME\n\nAction line.\n\n"
        f"                    CHARACTER\n          Dialogue.\n\n"
        f"Include all 5 scene headings starting with INT. or EXT. "
        f"Keep each scene concise — 1 action line, 2-3 dialogue exchanges. "
        f"Return ONLY the screenplay text, no explanations."
    )
    prompt: str = f"{system_instruction}\n{rag_section}\n{main_instruction}"

    try:
        screenplay: str = ai_client.generate(prompt)
    except RuntimeError as exc:
        code: str = "GROQ_RATE_LIMIT" if "RATE_LIMIT" in str(exc) else "GENERATION_ERROR"
        return {"error": True, "code": code, "message": str(exc)}
    except Exception as exc:
        logger.error("generate_screenplay: unexpected error: %s", exc)
        return {"error": True, "code": "UNKNOWN", "message": str(exc)}

    characters: list = ai_client.generate_characters(screenplay)
    scene_count: int = screenplay.count("INT.") + screenplay.count("EXT.")
    project_id: str = str(uuid.uuid4())

    try:
        db.init_db()
        db.save_project(project_id, story_idea, genre, language, tone, screenplay, characters)
    except Exception as db_exc:
        logger.error("generate_screenplay: DB save failed: %s", db_exc)

    logger.info(
        "generate_screenplay: project_id=%s scenes=%d characters=%d",
        project_id, scene_count, len(characters),
    )
    return {
        "project_id": project_id,
        "screenplay": screenplay,
        "scene_count": scene_count,
        "characters": characters,
    }


# ---------------------------------------------------------------------------
# Tool 2 — analyze_script
# ---------------------------------------------------------------------------


@mcp.tool()
def analyze_script(project_id: str) -> dict:
    """Run AD Intelligence analysis on a previously generated screenplay.

    Args:
        project_id: UUID returned by generate_screenplay.

    Returns:
        dict with keys: health_score, pacing_score, balance_score, tension_score,
        tension_curve, character_heatmap, pacing_blocks, flags.
        On error: dict with keys: error (True), code, message.
    """
    import ai_client
    import db
    from ad_intelligence import build_analysis_prompt

    try:
        db.init_db()
        project: dict | None = db.get_project(project_id)
    except Exception as exc:
        return {"error": True, "code": "DB_ERROR", "message": str(exc)}

    if project is None:
        return {"error": True, "code": "NOT_FOUND", "message": "Project not found"}

    screenplay: str = project.get("screenplay", "") or ""
    characters: list = project.get("characters") or []

    # Return cached analysis if available
    cached: dict | None = project.get("analysis")
    if cached and isinstance(cached, dict) and cached.get("health_score"):
        logger.info("analyze_script: returning cached analysis for %s", project_id)
        return cached

    scene_count: int = max(1, screenplay.count("INT.") + screenplay.count("EXT."))

    # Safe default fallback
    safe_default: dict = {
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

    prompt: str = build_analysis_prompt(screenplay, characters)
    result: dict = safe_default

    for attempt in range(2):
        try:
            raw: str = ai_client.generate(prompt, json_mode=True)
            parsed: dict = json.loads(raw)
            if isinstance(parsed, dict):
                result = parsed
                break
        except Exception as exc:
            logger.error("analyze_script: attempt %d failed: %s", attempt + 1, exc)

    pacing: int = int(result.get("pacing_score", 50))
    balance: int = int(result.get("balance_score", 50))
    tension: int = int(result.get("tension_score", 50))
    result["health_score"] = max(0, min(100, round((pacing * 0.35) + (balance * 0.35) + (tension * 0.30))))

    for key, default_val in [
        ("tension_curve", safe_default["tension_curve"]),
        ("character_heatmap", safe_default["character_heatmap"]),
        ("pacing_blocks", safe_default["pacing_blocks"]),
    ]:
        if not result.get(key):
            result[key] = default_val
    if "flags" not in result:
        result["flags"] = []

    try:
        db.update_analysis(project_id, result)
    except Exception as db_exc:
        logger.error("analyze_script: failed to persist analysis: %s", db_exc)

    logger.info("analyze_script: project_id=%s health_score=%d", project_id, result["health_score"])
    return result


# ---------------------------------------------------------------------------
# Tool 3 — generate_moodboard
# ---------------------------------------------------------------------------


@mcp.tool()
def generate_moodboard(project_id: str, act: int) -> dict:
    """Generate a Pollinations.ai moodboard image URL for a specific act.

    Args:
        project_id: UUID returned by generate_screenplay.
        act: Story act — 1 (Establish), 2 (Escalate), or 3 (Resolve).

    Returns:
        dict with keys: image_url, caption.
        On error: falls back gracefully — always returns a usable URL.
    """
    import db
    import moodboard as moodboard_module

    scene_description: str = "cinematic dark film"
    tone: int = 50

    try:
        db.init_db()
        project: dict | None = db.get_project(project_id)
        if project:
            scene_description = str(project.get("story_idea", ""))[:100]
            tone = int(project.get("tone", 50))
        else:
            logger.info("generate_moodboard: project %s not found — using fallback", project_id)
    except Exception as exc:
        logger.error("generate_moodboard: DB lookup failed: %s", exc)

    try:
        image_url: str = moodboard_module.build_moodboard_url(scene_description, tone, act)
    except Exception as exc:
        logger.error("generate_moodboard: URL build failed: %s", exc)
        image_url = (
            "https://image.pollinations.ai/prompt/cinematic+dark+film+still"
            "?width=1024&height=576&nologo=true"
        )

    caption: str = moodboard_module.build_caption(act)
    return {"image_url": image_url, "caption": caption}


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    mcp.run()
