"""
moodboard.py — URL helpers for Scriptoria moodboard generation.
Constructs Pollinations.ai image URLs based on scene, tone, and act.
No HTTP requests are made here; URL construction only.
"""

import urllib.parse
import logging

logger: logging.Logger = logging.getLogger(__name__)


def build_moodboard_url(scene_description: str, tone: int, act: int) -> str:
    """Constructs a Pollinations.ai URL for cinematic image generation.

    Args:
        scene_description: Short textual description of the scene.
        tone: Integer 0–100 representing tonal style (0 = vibrant Bollywood,
              100 = cold minimal Nolan-style).
        act: Script act number (1, 2, or 3).

    Returns:
        A fully-encoded Pollinations.ai image URL string.
    """
    act_moods: dict[int, str] = {
        1: "establish opening introduce golden hour",
        2: "escalate tension conflict dramatic",
        3: "resolve climax conclusion powerful",
    }

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

    prompt: str = (
        f"{scene_description}, {act_moods.get(act, 'cinematic')}, "
        f"{style}, film still, 4K, high quality"
    )
    encoded: str = urllib.parse.quote(prompt)
    url: str = f"https://image.pollinations.ai/prompt/{encoded}?width=1024&height=576&nologo=true"
    logger.debug("Built moodboard URL for act=%d tone=%d", act, tone)
    return url


def build_caption(act: int) -> str:
    """Returns the display caption string for a given act number.

    Args:
        act: Act number (1, 2, or 3).

    Returns:
        Human-readable act caption string.
    """
    captions: dict[int, str] = {
        1: "ACT I — ESTABLISH / OPENING",
        2: "ACT II — ESCALATE / CONFLICT",
        3: "ACT III — RESOLVE / CLIMAX",
    }
    return captions.get(act, f"ACT {act}")
