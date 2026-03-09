"""
moodboard.py — Pollinations.ai URL builder for Scriptoria visual moodboards.
No API key required — Pollinations is free and keyless.
"""
import urllib.parse
import logging

logger: logging.Logger = logging.getLogger(__name__)

_ACT_MOODS: dict[int, str] = {
    1: "establish, opening, introduce, golden hour",
    2: "escalate, tension, conflict, dramatic",
    3: "resolve, climax, conclusion, powerful",
}

_ACT_LABELS: dict[int, str] = {
    1: "ACT I — ESTABLISH / OPENING",
    2: "ACT II — ESCALATE / CONFLICT",
    3: "ACT III — RESOLVE / CLIMAX",
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
        style: str = (
            "vibrant Bollywood colors, high contrast, golden hour, "
            "dramatic Indian cinema, rich saturation"
        )
    elif tone <= 70:
        style = (
            "cinematic warm tones, dramatic lighting, atmospheric Indian film, "
            "professional cinematography"
        )
    else:
        style = (
            "desaturated IMAX minimal, cold blue tones, Nolan style psychological, "
            "shallow depth of field"
        )

    prompt: str = f"{scene_description}, {act_mood}, {style}, film still, 4K, cinematic"
    encoded: str = urllib.parse.quote(prompt)
    url: str = f"https://pollinations.ai/p/{encoded}?width=1024&height=576&nologo=true"

    logger.info("build_moodboard_url: act=%d tone=%d", act, tone)
    return url


def build_caption(act: int) -> str:
    """Build a human-readable caption for a moodboard act card.

    Args:
        act: Integer 1, 2, or 3.

    Returns:
        Caption string, e.g. 'ACT I — ESTABLISH / OPENING'.
    """
    return _ACT_LABELS.get(act, f"ACT {act} — VISUAL DIRECTION")
