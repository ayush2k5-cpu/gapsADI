"""
moodboard.py — Pollinations.ai URL builder for Scriptoria visual moodboards.
No API key required — Pollinations is free and keyless.
"""
import urllib.parse
import logging

logger: logging.Logger = logging.getLogger(__name__)

_ACT_MOODS: dict[int, str] = {
    1: "establish, opening, introduce",
    2: "escalate, tension, conflict",
    3: "resolve, climax, conclusion",
}

_ACT_LABELS: dict[int, str] = {
    1: "ESTABLISH",
    2: "ESCALATE",
    3: "RESOLVE",
}


def build_moodboard_url(scene_description: str, tone: int, act: int) -> str:
    """Build a Pollinations.ai image URL based on act and tone.

    Args:
        scene_description: Short description of the scene or story idea (first 100 chars used).
        tone: Integer 0–100. 0 = mass commercial Bollywood, 100 = arthouse minimal.
        act: Integer 1, 2, or 3 representing the story act.

    Returns:
        Full Pollinations.ai image URL ready for <img> src.
    """
    act_mood: str = _ACT_MOODS.get(act, "cinematic")

    if tone <= 30:
        style: str = "vibrant Bollywood colors, high contrast, golden hour, dramatic, Indian cinema"
    elif tone <= 70:
        style = "cinematic warm tones, dramatic lighting, atmospheric, Indian film"
    else:
        style = "desaturated IMAX, minimal, cold tones, Nolan style, psychological"

    prompt: str = f"{scene_description}, {act_mood}, {style}, film still, 4K, cinematic"
    encoded: str = urllib.parse.quote(prompt)
    url: str = f"https://image.pollinations.ai/prompt/{encoded}?width=1024&height=576&nologo=true"

    logger.info("build_moodboard_url: act=%d tone=%d", act, tone)
    return url


def build_caption(act: int) -> str:
    """Build a human-readable caption for a moodboard act card.

    Args:
        act: Integer 1, 2, or 3.

    Returns:
        Caption string, e.g. 'ACT 1 — ESTABLISH'.
    """
    label: str = _ACT_LABELS.get(act, "VISUAL DIRECTION")
    return f"ACT {act} — {label}"
