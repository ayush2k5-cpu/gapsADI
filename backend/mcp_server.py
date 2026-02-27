"""Scriptoria MCP Server — exposes core pipeline as MCP tools via FastMCP.

Tools exposed:
    generate_screenplay  — story idea → formatted screenplay + characters
    analyze_script       — screenplay → AD Intelligence analysis
    generate_moodboard   — story idea + tone → 3 moodboard image URLs

Run:
    python mcp_server.py
    OR (for Claude Desktop / MCP clients):
    fastmcp run mcp_server.py
"""

import json
import logging
import os
import sys
import uuid
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Path setup — allow importing sibling modules (ai_client, db, etc.)
# ---------------------------------------------------------------------------
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(Path(__file__).parent / ".env")

import ai_client  # noqa: E402
import db as db_module  # noqa: E402
import moodboard as moodboard_module  # noqa: E402
from ad_intelligence import build_analysis_prompt  # noqa: E402

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(name)s:%(message)s")
logger: logging.Logger = logging.getLogger("mcp_server")

# ---------------------------------------------------------------------------
# FastMCP app
# ---------------------------------------------------------------------------
from fastmcp import FastMCP  # noqa: E402

mcp: FastMCP = FastMCP(
    name="Scriptoria",
    instructions=(
        "Scriptoria is an AI-powered film pre-production system. "
        "Use generate_screenplay to create a formatted screenplay from a story idea. "
        "Then use analyze_script with the returned project_id to get full AD Intelligence analysis. "
        "Use generate_moodboard to get cinematic visual references for the story."
    ),
)

# ---------------------------------------------------------------------------
# Helper — safe default analysis (matches main.py logic)
# ---------------------------------------------------------------------------

def _build_safe_default(scene_count: int, characters: list) -> dict:
    """Return a minimal valid analysis dict when Groq fails."""
    return {
        "health_score": 50,
        "pacing_score": 50,
        "balance_score": 50,
        "tension_score": 50,
        "production_complexity": "Medium",
        "budget_tier": "Mid-range",
        "shooting_order": list(range(1, scene_count + 1)),
        "flags": [],
        "scene_breakdown": [
            {"scene": i + 1, "location": "TBD", "time": "DAY", "cast": []}
            for i in range(scene_count)
        ],
        "tension_curve": [
            {"scene": i + 1, "tension": 40 + i * 5}
            for i in range(scene_count)
        ],
        "character_heatmap": [
            {"character": c.get("name", f"CHAR_{i}"), "scenes": list(range(1, scene_count + 1))}
            for i, c in enumerate(characters[:6])
        ],
        "pacing_blocks": [
            {"scene": i + 1, "label": "NORMAL", "duration_est": "2 min"}
            for i in range(scene_count)
        ],
    }


# ---------------------------------------------------------------------------
# Tool 1 — generate_screenplay
# ---------------------------------------------------------------------------

@mcp.tool()
def generate_screenplay(
    story_idea: str,
    genre: str,
    language: str = "English",
    tone: int = 50,
) -> dict[str, Any]:
    """Generate a formatted 5-scene screenplay from a story idea.

    Args:
        story_idea: Brief story concept (10–400 characters).
        genre:      Film genre, e.g. "Thriller", "Romance", "Drama", "Comedy", "Horror".
        language:   Screenplay language, e.g. "English", "Hindi". Defaults to "English".
        tone:       Tone slider 0–100. 0 = mass commercial, 100 = arthouse. Defaults to 50.

    Returns:
        dict with keys:
            project_id  (str)  — UUID for use with analyze_script
            screenplay  (str)  — Full formatted screenplay text
            scene_count (int)  — Number of scenes detected
            characters  (list) — List of {name, role, arc} dicts
    """
    if not (10 <= len(story_idea) <= 400):
        return {
            "error": True,
            "code": "VALIDATION_ERROR",
            "message": "story_idea must be between 10 and 400 characters",
        }

    tone = max(0, min(100, int(tone)))

    # RAG context
    rag_context: str = ""
    try:
        from rag.retriever import retrieve_context  # type: ignore[import]
        rag_context = retrieve_context(story_idea, genre)
        logger.info("generate_screenplay: RAG context retrieved (%d chars)", len(rag_context))
    except Exception as rag_exc:
        logger.info("generate_screenplay: RAG unavailable — %s", rag_exc)

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
        db_module.save_project(project_id, story_idea, genre, language, tone, screenplay, characters)
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
def analyze_script(project_id: str) -> dict[str, Any]:
    """Run full AD Intelligence analysis on a generated screenplay.

    Requires a project_id returned by generate_screenplay.
    Returns cached result instantly on repeat calls (no extra API usage).

    Args:
        project_id: UUID returned by generate_screenplay.

    Returns:
        dict with keys:
            health_score        (int 0-100) — Overall script health
            pacing_score        (int 0-100) — Scene pacing quality
            balance_score       (int 0-100) — Dialogue/action balance
            tension_score       (int 0-100) — Dramatic tension quality
            production_complexity (str)    — Low / Medium / High
            budget_tier         (str)      — Budget estimate tier
            shooting_order      (list)     — Recommended shoot sequence
            scene_breakdown     (list)     — Per-scene AD notes
            tension_curve       (list)     — {scene, tension} for charting
            character_heatmap   (list)     — {character, scenes} presence map
            pacing_blocks       (list)     — {scene, label, duration_est}
            flags               (list)     — Risk/warning flags
    """
    project: dict | None = db_module.get_project(project_id)
    if project is None:
        return {
            "error": True,
            "code": "NOT_FOUND",
            "message": f"No project found with id '{project_id}'. Run generate_screenplay first.",
        }

    # Return cached analysis if available
    cached: dict | None = project.get("analysis")
    if cached and isinstance(cached, dict) and cached.get("health_score"):
        logger.info("analyze_script: returning cached analysis for %s", project_id)
        return cached

    screenplay: str = project.get("screenplay", "") or ""
    characters: list = project.get("characters") or []
    scene_count: int = screenplay.count("INT.") + screenplay.count("EXT.") or 1
    safe_default: dict = _build_safe_default(scene_count, characters)

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

    # Compute composite health_score
    pacing: int = int(result.get("pacing_score", 50))
    balance: int = int(result.get("balance_score", 50))
    tension: int = int(result.get("tension_score", 50))
    result["health_score"] = max(0, min(100, round(pacing * 0.35 + balance * 0.35 + tension * 0.30)))

    # Fill missing fields
    for key in ("tension_curve", "character_heatmap", "pacing_blocks"):
        if not result.get(key):
            result[key] = safe_default[key]
    result.setdefault("flags", [])

    try:
        db_module.update_analysis(project_id, result)
    except Exception as db_exc:
        logger.error("analyze_script: DB persist failed: %s", db_exc)

    logger.info("analyze_script: project_id=%s health_score=%d", project_id, result["health_score"])
    return result


# ---------------------------------------------------------------------------
# Tool 3 — generate_moodboard
# ---------------------------------------------------------------------------

@mcp.tool()
def generate_moodboard(project_id: str) -> dict[str, Any]:
    """Generate 3 cinematic moodboard image URLs for a screenplay's three acts.

    Uses Pollinations.ai (free, no API key). Images are 1024×576, cinema-grade prompts.

    Args:
        project_id: UUID returned by generate_screenplay.

    Returns:
        dict with key:
            images (list) — 3 items, each {act (int), image_url (str), caption (str)}
    """
    _ACT_LABELS: dict[int, str] = {1: "ESTABLISH", 2: "ESCALATE", 3: "RESOLVE"}

    project: dict | None = None
    try:
        project = db_module.get_project(project_id)
    except Exception as exc:
        logger.error("generate_moodboard: DB lookup failed: %s", exc)

    if project:
        scene_description: str = str(project.get("story_idea", ""))[:100]
        tone: int = int(project.get("tone", 50))
    else:
        scene_description = "cinematic dark film"
        tone = 50

    images: list[dict] = []
    for act in (1, 2, 3):
        try:
            image_url: str = moodboard_module.build_moodboard_url(scene_description, tone, act)
        except Exception as exc:
            logger.error("generate_moodboard: act %d URL failed: %s", act, exc)
            image_url = (
                "https://image.pollinations.ai/prompt/cinematic+dark+film+still"
                "?width=1024&height=576&nologo=true"
            )
        images.append({
            "act": act,
            "image_url": image_url,
            "caption": f"ACT {act} — {_ACT_LABELS[act]}",
        })

    logger.info("generate_moodboard: project_id=%s — 3 URLs built", project_id)
    return {"images": images}


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    mcp.run()
