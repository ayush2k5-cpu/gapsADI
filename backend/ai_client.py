"""
ai_client.py — AI wrapper for Scriptoria.
All AI calls go through this module. Never call APIs directly from route handlers.

Provider split:
  Sarvam-M  (2-key rotation) — translation only (free, Indian-language optimised)
  Groq      (1+ keys)        — screenplay generation, AD analysis, character extraction
                               + translation fallback if both Sarvam keys are exhausted
"""
import itertools
import json
import logging
import os
import re
import time

import requests
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger: logging.Logger = logging.getLogger(__name__)

_GROQ_URL: str = "https://api.groq.com/openai/v1/chat/completions"
_GROQ_MODEL: str = "llama-3.3-70b-versatile"

# ---------------------------------------------------------------------------
# Key pool
# ---------------------------------------------------------------------------

def _get_groq_keys() -> list[str]:
    """Collect all GROQ_API_KEY / GROQ_API_KEY_N vars from the environment."""
    keys: list[str] = []
    base: str = os.getenv("GROQ_API_KEY", "").strip()
    if base:
        keys.append(base)
    for i in range(1, 10):
        key: str = os.getenv(f"GROQ_API_KEY_{i}", "").strip()
        if key:
            keys.append(key)
    # Deduplicate while preserving order
    seen: set[str] = set()
    unique: list[str] = []
    for k in keys:
        if k not in seen:
            seen.add(k)
            unique.append(k)
    return unique


GROQ_KEYS: list[str] = _get_groq_keys()
_groq_key_iterator = itertools.cycle(GROQ_KEYS) if GROQ_KEYS else None


def _get_sarvam_keys() -> list[str]:
    """Collect all SARVAM_API_KEY / SARVAM_API_KEY_N vars from the environment."""
    keys: list[str] = []
    base: str = os.getenv("SARVAM_API_KEY", "").strip()
    if base:
        keys.append(base)
    for i in range(1, 10):
        key: str = os.getenv(f"SARVAM_API_KEY_{i}", "").strip()
        if key:
            keys.append(key)
    seen: set[str] = set()
    unique: list[str] = []
    for k in keys:
        if k not in seen:
            seen.add(k)
            unique.append(k)
    return unique


SARVAM_KEYS: list[str] = _get_sarvam_keys()
_sarvam_key_iterator = itertools.cycle(SARVAM_KEYS) if SARVAM_KEYS else None

logger.info("ai_client: loaded %d Groq key(s), %d Sarvam key(s)", len(GROQ_KEYS), len(SARVAM_KEYS))


# ---------------------------------------------------------------------------
# Core request function
# ---------------------------------------------------------------------------

def _groq_request(
    messages: list[dict],
    json_mode: bool = False,
    max_tokens: int = 2500,
) -> str:
    """Send a chat request to Groq with key rotation on 429.

    Args:
        messages: OpenAI-style message list.
        json_mode: If True, forces JSON output via response_format.
        max_tokens: Hard cap on output length to save quota.

    Returns:
        The assistant's reply as a string.

    Raises:
        RuntimeError: GROQ_RATE_LIMIT — all keys exhausted.
        RuntimeError: GROQ_ERROR — non-rate-limit failure.
    """
    if not GROQ_KEYS:
        raise RuntimeError("GROQ_ERROR: No API keys configured — set GROQ_API_KEY_1 in .env")

    payload: dict = {
        "model": _GROQ_MODEL,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": max_tokens,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    # One pass through all keys, then one backoff retry
    for retry_loop in range(2):
        for idx in range(len(GROQ_KEYS)):
            current_key: str = next(_groq_key_iterator)
            censored: str = f"...{current_key[-4:]}"
            try:
                logger.info(
                    "_groq_request: key %s attempt %d/%d",
                    censored, idx + 1, len(GROQ_KEYS),
                )
                resp = requests.post(
                    _GROQ_URL,
                    headers={
                        "Authorization": f"Bearer {current_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                    timeout=60,
                )

                if resp.status_code == 429:
                    logger.warning("_groq_request: rate limit on key %s", censored)
                    time.sleep(3)
                    continue

                if resp.status_code == 401:
                    logger.error("_groq_request: invalid key %s — skipping", censored)
                    continue

                resp.raise_for_status()
                text: str = resp.json()["choices"][0]["message"]["content"]
                logger.info("_groq_request: success with key %s", censored)
                return text

            except requests.exceptions.Timeout:
                logger.warning("_groq_request: timeout on key %s", censored)
                continue
            except RuntimeError:
                raise
            except Exception as exc:
                logger.error("_groq_request: unexpected error key %s: %s", censored, exc)
                raise RuntimeError(f"GROQ_ERROR: {exc}")

        backoff: int = (retry_loop + 1) * 15
        logger.warning(
            "_groq_request: all keys rate-limited, backing off %ds", backoff
        )
        time.sleep(backoff)

    raise RuntimeError("GROQ_RATE_LIMIT: all keys exhausted after retries")


# ---------------------------------------------------------------------------
# Public API — same signatures as before so main.py needs minimal changes
# ---------------------------------------------------------------------------

def generate(prompt: str, json_mode: bool = False) -> str:
    """Generate text via Groq. Drop-in replacement for the old Gemini generate().

    Args:
        prompt: Full prompt string.
        json_mode: If True, forces JSON output.

    Returns:
        Generated text.

    Raises:
        RuntimeError: On rate limit or API error.
    """
    messages: list[dict] = [{"role": "user", "content": prompt}]
    tokens: int = 1500 if json_mode else 2500
    return _groq_request(messages, json_mode=json_mode, max_tokens=tokens)


# ---------------------------------------------------------------------------
# Translation — Sarvam mayura:v1 SDK (primary) → Groq (fallback)
# ---------------------------------------------------------------------------

# Maps human-readable language names to Sarvam BCP-47 codes
_SARVAM_LANG_CODES: dict[str, str] = {
    "hindi": "hi-IN",
    "tamil": "ta-IN",
    "telugu": "te-IN",
    "kannada": "kn-IN",
    "malayalam": "ml-IN",
    "bengali": "bn-IN",
    "marathi": "mr-IN",
    "gujarati": "gu-IN",
    "punjabi": "pa-IN",
    "odia": "od-IN",
    "urdu": "ur-IN",
}

_TRANSLATE_USER_TEMPLATE: str = (
    "Regenerate ONLY THE DIALOGUE of the following screenplay into {lang}.\n\n"
    "Rules:\n"
    "1. Scene headings (INT./EXT.) — keep in English, unchanged.\n"
    "2. Action lines — keep in English, unchanged.\n"
    "3. Character name headers (ALL CAPS) — keep in English, unchanged.\n"
    "4. DIALOGUE only — rewrite in {lang} as a native professional screenwriter would. "
    "Capture emotional intent, subtext, and character voice. Do NOT translate literally.\n\n"
    "Return the COMPLETE screenplay with only the dialogue replaced.\n\n"
    "SCREENPLAY:\n{screenplay}"
)


def _resolve_sarvam_lang_code(target_language: str) -> str:
    """Map a language name to a Sarvam BCP-47 code.

    Args:
        target_language: Language name, e.g. "Hindi", "Tamil".

    Returns:
        Sarvam language code string, e.g. "hi-IN".

    Raises:
        ValueError: If the language is not supported by Sarvam.
    """
    code: str | None = _SARVAM_LANG_CODES.get(target_language.lower().strip())
    if not code:
        supported: str = ", ".join(sorted(_SARVAM_LANG_CODES.keys()))
        raise ValueError(
            f"SARVAM_UNSUPPORTED_LANG: '{target_language}' not in supported list: {supported}"
        )
    return code


def _extract_dialogue_lines(screenplay: str) -> list[tuple[int, str]]:
    """Return (line_index, dialogue_text) for every dialogue line in the screenplay.

    Dialogue lines are identified as lines indented 5–14 spaces that are NOT
    all-caps scene headings or character name headers.

    Args:
        screenplay: Full formatted screenplay text.

    Returns:
        List of (original_line_index, stripped_dialogue_text) tuples.
    """
    lines: list[str] = screenplay.split("\n")
    dialogue: list[tuple[int, str]] = []
    for i, line in enumerate(lines):
        stripped: str = line.strip()
        if not stripped:
            continue
        # Dialogue: indented 5-14 spaces, not all-caps (which would be char name)
        if re.match(r"^ {5,14}\S", line) and stripped != stripped.upper():
            dialogue.append((i, stripped))
    return dialogue


def translate_screenplay_sarvam(screenplay: str, target_language: str) -> str:
    """Translate screenplay dialogue using the Sarvam mayura:v1 SDK.

    Extracts all dialogue lines, batch-translates them via Sarvam's dedicated
    text.translate endpoint, then reassembles the screenplay with translated
    dialogue replacing the originals.  Rotates through SARVAM_KEYS on failure.

    Args:
        screenplay: Full screenplay text.
        target_language: Target language name, e.g. "Hindi", "Tamil".

    Returns:
        Screenplay with dialogue lines replaced by target-language equivalents.

    Raises:
        RuntimeError: SARVAM_RATE_LIMIT — all keys exhausted.
        RuntimeError: SARVAM_ERROR — no keys configured, unsupported language,
                      or non-recoverable API failure.
    """
    try:
        from sarvamai import SarvamAI  # lazy import — not available on all envs
    except ImportError as exc:
        raise RuntimeError("SARVAM_ERROR: sarvamai package not installed — run pip install sarvamai") from exc

    if not SARVAM_KEYS:
        raise RuntimeError("SARVAM_ERROR: No Sarvam keys configured — set SARVAM_API_KEY_1 in .env")

    lang_code: str = _resolve_sarvam_lang_code(target_language)

    # Extract dialogue lines to translate
    dialogue_pairs: list[tuple[int, str]] = _extract_dialogue_lines(screenplay)
    if not dialogue_pairs:
        logger.warning("translate_screenplay_sarvam: no dialogue lines found, returning as-is")
        return screenplay

    # Join all dialogue with a delimiter so we make ONE API call
    _DELIM: str = " ||| "
    combined_input: str = _DELIM.join(text for _, text in dialogue_pairs)
    # Cap input to Sarvam's practical limit (~5000 chars)
    if len(combined_input) > 5000:
        combined_input = combined_input[:5000]
        logger.warning("translate_screenplay_sarvam: input truncated to 5000 chars")

    last_exc: Exception | None = None

    for idx in range(len(SARVAM_KEYS)):
        current_key: str = next(_sarvam_key_iterator)
        censored: str = f"...{current_key[-4:]}"
        try:
            logger.info(
                "translate_screenplay_sarvam: key %s (%d/%d) → %s",
                censored, idx + 1, len(SARVAM_KEYS), lang_code,
            )
            client = SarvamAI(api_subscription_key=current_key)
            response = client.text.translate(
                input=combined_input,
                source_language_code="en-IN",
                target_language_code=lang_code,
                speaker_gender="Male",
                mode="modern-colloquial",
                model="mayura:v1",
            )
            translated_combined: str = response.translated_text
            translated_parts: list[str] = translated_combined.split(_DELIM)

            # Reassemble screenplay with translated dialogue
            lines: list[str] = screenplay.split("\n")
            for part_idx, (line_idx, _) in enumerate(dialogue_pairs):
                if part_idx < len(translated_parts):
                    # Preserve original indentation
                    original_line: str = lines[line_idx]
                    indent: str = original_line[: len(original_line) - len(original_line.lstrip())]
                    lines[line_idx] = indent + translated_parts[part_idx].strip()

            result: str = "\n".join(lines)
            logger.info(
                "translate_screenplay_sarvam: success key %s → %s (%d dialogue lines translated)",
                censored, target_language, len(dialogue_pairs),
            )
            return result

        except Exception as exc:
            last_exc = exc
            err_str: str = str(exc)
            if "429" in err_str or "rate" in err_str.lower():
                logger.warning("translate_screenplay_sarvam: rate limit on key %s — rotating", censored)
                time.sleep(2)
                continue
            if "401" in err_str or "unauthorized" in err_str.lower():
                logger.error("translate_screenplay_sarvam: invalid key %s — skipping", censored)
                continue
            # Non-recoverable error
            logger.error("translate_screenplay_sarvam: unexpected error key %s: %s", censored, exc)
            raise RuntimeError(f"SARVAM_ERROR: {exc}") from exc

    raise RuntimeError(f"SARVAM_RATE_LIMIT: all Sarvam keys exhausted. Last error: {last_exc}")


def translate_screenplay_groq(screenplay: str, target_language: str) -> str:
    """Regenerate screenplay dialogue via Groq (fallback if Sarvam unavailable).

    Args:
        screenplay: Full screenplay text.
        target_language: Target language name.

    Returns:
        Screenplay with only dialogue replaced.
    """
    truncated: str = screenplay[:3000]
    messages: list[dict] = [
        {"role": "system", "content": _TRANSLATE_SYSTEM},
        {
            "role": "user",
            "content": _TRANSLATE_USER_TEMPLATE.format(
                lang=target_language, screenplay=truncated
            ),
        },
    ]
    return _groq_request(messages, max_tokens=2500)


def generate_characters(screenplay: str) -> list:
    """Extract character profiles from a screenplay.

    Uses Groq with JSON mode. Falls back to regex on any failure.
    Input is truncated to 2500 chars (sufficient for 5 scenes).

    Args:
        screenplay: Full formatted screenplay text.

    Returns:
        List of character dicts: name, role, bio, arc.
        Always returns a list — never raises.
    """
    truncated: str = screenplay[:2500]

    messages: list[dict] = [
        {
            "role": "user",
            "content": (
                "Extract character profiles from the following screenplay.\n\n"
                "Return ONLY a valid JSON array where each element has:\n"
                '{"name": "<ALL CAPS name>", "role": "<PROTAGONIST|ANTAGONIST|SUPPORTING|MINOR>", '
                '"bio": "<2 sentences>", "arc": "<arc label>"}\n\n'
                "Rules:\n"
                "- Include all named characters who speak\n"
                "- Maximum 6 characters\n"
                "- Return ONLY the JSON array, no markdown, no commentary.\n\n"
                f"SCREENPLAY:\n{truncated}"
            ),
        }
    ]

    try:
        raw: str = _groq_request(messages, json_mode=True, max_tokens=800)
        parsed: list = json.loads(raw)
        if isinstance(parsed, list) and parsed:
            logger.info("generate_characters: extracted %d characters", len(parsed))
            return parsed
    except Exception as exc:
        logger.warning("generate_characters: Groq failed (%s) — using regex fallback", exc)

    return _extract_characters_regex(screenplay)


# ---------------------------------------------------------------------------
# Regex fallback — zero API calls, always works
# ---------------------------------------------------------------------------

def _extract_characters_regex(screenplay: str) -> list:
    """Extract character names from ALL CAPS screenplay convention.

    Args:
        screenplay: Full formatted screenplay text.

    Returns:
        List of minimal character dicts. Never raises.
    """
    lines: list[str] = screenplay.split("\n")
    seen: set[str] = set()
    names: list[str] = []

    for i, line in enumerate(lines):
        stripped: str = line.strip()
        if not stripped:
            continue
        if (
            stripped == stripped.upper()
            and not stripped.startswith("INT.")
            and not stripped.startswith("EXT.")
            and 2 <= len(stripped) <= 40
            and not stripped.isdigit()
            and re.match(r"^[A-Z][A-Z\s\.\-\']+$", stripped)
        ):
            prev: str = lines[i - 1].strip() if i > 0 else ""
            if not prev and stripped not in seen:
                seen.add(stripped)
                names.append(stripped)

    names = names[:6]
    if not names:
        return []

    _ROLES: list[str] = ["PROTAGONIST", "ANTAGONIST", "SUPPORTING", "SUPPORTING", "MINOR", "MINOR"]
    characters: list[dict] = [
        {
            "name": name,
            "role": _ROLES[idx] if idx < len(_ROLES) else "MINOR",
            "bio": f"{name} is a key character in this screenplay.",
            "arc": "CHARACTER ARC",
        }
        for idx, name in enumerate(names)
    ]
    logger.info("_extract_characters_regex: extracted %d characters", len(characters))
    return characters
