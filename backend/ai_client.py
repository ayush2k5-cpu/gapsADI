"""
ai_client.py — Gemini + Ollama/Groq wrappers for Scriptoria.
All AI calls go through this module. Never call AI APIs directly from route handlers.
"""
import json
import logging
import os

import requests
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted

# Configure logging early
logging.basicConfig(level=logging.INFO)

logger: logging.Logger = logging.getLogger(__name__)

genai.configure(api_key=os.getenv("GEMINI_API_KEY", "dummy"))
model = genai.GenerativeModel("gemini-2.0-flash")


def get_character_client() -> str:
    """Try Ollama first; fall back to Groq if Ollama is unavailable.

    Returns:
        'ollama' if Ollama is running locally, 'groq' otherwise.
    """
    try:
        import ollama  # type: ignore[import]
        ollama.list()  # ping — raises if Ollama not running
        logger.info("get_character_client: Ollama available — using local inference")
        return "ollama"
    except Exception:
        logger.info("get_character_client: Ollama unavailable — falling back to Groq")
        return "groq"


# Cached once at module import time — no per-request overhead
CHARACTER_CLIENT: str = get_character_client()


def generate(prompt: str, json_mode: bool = False) -> str:
    """Call Gemini 2.0 Flash. Returns text. Raises RuntimeError on rate limit.

    Args:
        prompt: The prompt to send to Gemini.
        json_mode: If True, request JSON response MIME type.

    Returns:
        The text content of the Gemini response.

    Raises:
        RuntimeError: On rate limit (GEMINI_RATE_LIMIT) or other Gemini errors.
    """
    config = {"response_mime_type": "application/json"} if json_mode else {}
    try:
        response = model.generate_content(prompt, generation_config=config)
        return response.text
    except ResourceExhausted:
        logger.error("Gemini rate limit hit")
        raise RuntimeError("GEMINI_RATE_LIMIT")
    except Exception as exc:
        logger.error("Gemini error: %s", exc)
        raise RuntimeError(f"GEMINI_ERROR: {exc}")


def generate_characters(screenplay: str) -> list:
    """Call Ollama or Groq to extract character profiles from a screenplay.

    Sends a structured prompt requesting a JSON array of characters.
    Gracefully returns an empty list on any failure so callers never break.

    Args:
        screenplay: Full formatted screenplay text.

    Returns:
        List of character dicts, each with keys:
        name (ALL CAPS), role, bio, arc.
        Returns [] on any failure.
    """
    prompt: str = f"""Extract character profiles from the following screenplay.

Return ONLY a valid JSON array (no markdown, no explanation) where each element has:
{{
  "name": "<CHARACTER NAME IN ALL CAPS as it appears in the screenplay>",
  "role": "<PROTAGONIST | ANTAGONIST | SUPPORTING | MINOR>",
  "bio":  "<2-3 sentences: background and motivation>",
  "arc":  "<e.g. REDEMPTION ARC | FALL FROM GRACE | COMING OF AGE | SURVIVAL ARC>"
}}

Rules:
- Include ALL named characters who speak or are described with named action
- Minimum 2 characters, maximum 8 characters
- name must match exactly how it appears in the screenplay (ALL CAPS)
- Return ONLY the JSON array. No markdown fences, no commentary.

SCREENPLAY:
{screenplay[:6000]}
"""

    if CHARACTER_CLIENT == "ollama":
        return _generate_characters_ollama(prompt)
    return _generate_characters_groq(prompt)


def _generate_characters_ollama(prompt: str) -> list:
    """Call Ollama llama3.2 to extract characters.

    Args:
        prompt: Structured character extraction prompt.

    Returns:
        Parsed list of character dicts, or [] on failure.
    """
    try:
        import ollama  # type: ignore[import]
        response: dict = ollama.generate(model="llama3.2", prompt=prompt)
        raw: str = response.get("response", "[]")
        characters: list = json.loads(raw)
        logger.info("_generate_characters_ollama: extracted %d characters", len(characters))
        return characters if isinstance(characters, list) else []
    except Exception as exc:
        logger.error("_generate_characters_ollama failed: %s", exc)
        return []


def _generate_characters_groq(prompt: str) -> list:
    """Call Groq llama-3.3-70b-versatile to extract characters.

    Args:
        prompt: Structured character extraction prompt.

    Returns:
        Parsed list of character dicts, or [] on failure.
    """
    try:
        groq_api_key: str = os.getenv("GROQ_API_KEY", "")
        if not groq_api_key:
            logger.error("_generate_characters_groq: GROQ_API_KEY not set")
            return []

        resp = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data: dict = resp.json()
        raw: str = data["choices"][0]["message"]["content"]
        characters: list = json.loads(raw)
        logger.info("_generate_characters_groq: extracted %d characters", len(characters))
        return characters if isinstance(characters, list) else []
    except Exception as exc:
        logger.error("_generate_characters_groq failed: %s", exc)
        return []
