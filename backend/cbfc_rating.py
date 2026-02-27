"""
cbfc_rating.py — Estimated CBFC (Central Board of Film Certification) rating.

Pure rule-based keyword analysis. Zero API calls. Deterministic and explainable.
Based on CBFC certification guidelines (Government of India).

Ratings:
    U   — Universal, suitable for all ages
    UA  — Parental guidance for children under 12
    A   — Adults only (18+)
    S   — Restricted to specialised audiences (not used here — rare in fiction)
"""
import re
import logging
from typing import Optional

logger: logging.Logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Keyword dictionaries — three severity tiers per category
# Weights: heavy=4pts, moderate=2pts, mild=1pt (per unique keyword occurrence, capped at 5)
# ---------------------------------------------------------------------------

_VIOLENCE: dict[str, list[str]] = {
    "heavy": [
        "murder", "murdered", "massacre", "slaughter", "decapitate", "decapitated",
        "torture", "tortured", "execution", "executed", "assassinate", "assassinated",
        "strangled", "strangles", "beheaded", "gore", "mutilate", "mutilated",
        "brutal killing", "cold blood",
    ],
    "moderate": [
        "shoot", "shot", "stab", "stabbed", "stabbing", "blood", "bleeding",
        "wound", "wounded", "bullet", "gunshot", "explosion", "explodes", "bomb",
        "grenade", "fight", "beaten", "attack", "attacked", "corpse", "dead body",
        "violence", "violent", "knife", "armed", "weapon",
    ],
    "mild": [
        "punch", "punched", "hit", "slap", "slapped", "gun", "pistol", "rifle",
        "threaten", "threatened", "hostage", "struggle",
    ],
}

_SEXUAL: dict[str, list[str]] = {
    "heavy": [
        "nude", "naked", "explicit", "vulgar", "sexual", "intercourse", "pornographic",
    ],
    "moderate": [
        "intimate", "intimacy", "undress", "undressed", "seduction", "seduce",
        "seduced", "lust", "lustful", "affair", "adultery",
    ],
    "mild": [
        "kiss", "kissed", "kissing", "embrace", "embracing", "romantic", "romance",
        "flirt", "flirting", "desire", "passion",
    ],
}

_LANGUAGE: dict[str, list[str]] = {
    "heavy": [
        "fuck", "fucking", "motherfucker", "bastard", "bitch", "chutiya",
        "madarchod", "bhenchod", "randi",
    ],
    "moderate": [
        "shit", "damn", "hell", "ass", "crap", "harami", "kamina", "kutte",
    ],
    "mild": [
        "idiot", "fool", "bloody", "stupid", "moron", "sala", "saale", "ullu",
    ],
}

_DRUGS: dict[str, list[str]] = {
    "heavy": [
        "heroin", "cocaine", "marijuana", "ganja", "charas", "afeem", "opium",
        "narcotics", "drug dealer", "overdose", "trafficking",
    ],
    "moderate": [
        "drugs", "drug", "addiction", "addicted", "intoxicated", "high",
        "smuggling", "smack",
    ],
    "mild": [
        "alcohol", "drunk", "drunken", "whiskey", "wine", "beer", "liquor",
        "cigarette", "smoking", "smokes", "toddy",
    ],
}

_THEMES: dict[str, list[str]] = {
    "heavy": [
        "jihad", "terrorism", "terrorist", "riot", "communal violence",
        "sedition", "insurgency", "ethnic cleansing",
    ],
    "moderate": [
        "caste", "untouchable", "dalit discrimination", "partition", "war",
        "revolution", "protest", "communal", "religious tension",
    ],
    "mild": [
        "religion", "politics", "corruption", "inequality", "injustice",
        "discrimination", "oppression",
    ],
}

_HORROR: dict[str, list[str]] = {
    "heavy": [
        "demon", "possessed", "possession", "devil", "evil spirit",
        "witchcraft", "satanic", "occult",
    ],
    "moderate": [
        "ghost", "haunt", "haunted", "supernatural", "apparition",
        "curse", "cursed", "poltergeist",
    ],
    "mild": [
        "horror", "terrify", "terrified", "spirit", "witch", "paranormal",
        "eerie", "sinister",
    ],
}

_CATEGORY_WEIGHTS: dict[str, int] = {
    "heavy": 4,
    "moderate": 2,
    "mild": 1,
}

_CAP_PER_KEYWORD: int = 5  # max times a single keyword contributes to score


# ---------------------------------------------------------------------------
# Core algorithm
# ---------------------------------------------------------------------------

def _score_category(text_lower: str, keyword_dict: dict[str, list[str]]) -> tuple[int, list[str]]:
    """Compute weighted score for one content category.

    Args:
        text_lower: Lowercase screenplay text.
        keyword_dict: Dict with keys 'heavy', 'moderate', 'mild' each mapping to keyword list.

    Returns:
        Tuple of (raw_score, list_of_matched_keywords).
    """
    score: int = 0
    matched: list[str] = []

    for severity, keywords in keyword_dict.items():
        weight: int = _CATEGORY_WEIGHTS[severity]
        for kw in keywords:
            pattern: str = r"\b" + re.escape(kw) + r"\b"
            count: int = len(re.findall(pattern, text_lower))
            if count > 0:
                score += min(count, _CAP_PER_KEYWORD) * weight
                matched.append(kw)

    return score, matched


def estimate_cbfc_rating(
    screenplay: str,
    genre: str = "",
    tone: int = 50,
) -> dict:
    """Estimate CBFC rating for a screenplay using rule-based keyword analysis.

    No API calls. Fully deterministic. Scores 6 content categories, normalises
    by scene count, and maps to U / UA / A with a human-readable breakdown.

    Args:
        screenplay: Full formatted screenplay text.
        genre: Genre string — used for horror genre adjustment.
        tone: Tone 0–100. Not used for rating, included in response for context.

    Returns:
        Dict with keys:
            rating (str): "U", "UA", or "A"
            confidence (str): "high", "medium", or "low"
            total_score (int): Aggregate normalised score
            breakdown (dict): Per-category normalised scores
            reasons (list[str]): Human-readable explanation list
            cbfc_criteria (str): Official one-line description of the assigned rating
            scene_count (int): Number of scenes detected
    """
    text_lower: str = screenplay.lower()
    scene_count: int = max(1, screenplay.count("INT.") + screenplay.count("EXT."))

    # Raw scores per category
    v_raw, v_matched = _score_category(text_lower, _VIOLENCE)
    s_raw, s_matched = _score_category(text_lower, _SEXUAL)
    l_raw, l_matched = _score_category(text_lower, _LANGUAGE)
    d_raw, d_matched = _score_category(text_lower, _DRUGS)
    t_raw, t_matched = _score_category(text_lower, _THEMES)
    h_raw, h_matched = _score_category(text_lower, _HORROR)

    # Normalise by scene count — prevents a 40-scene screenplay scoring 2x a 20-scene one
    # Baseline is 20 scenes (target screenplay length)
    baseline: float = max(scene_count, 10) / 20.0

    def norm(raw: int) -> int:
        return round(raw / baseline)

    v_n = norm(v_raw)
    s_n = norm(s_raw)
    l_n = norm(l_raw)
    d_n = norm(d_raw)
    t_n = norm(t_raw)
    h_n = norm(h_raw)

    # Genre-based floor — horror genre always gets at least some horror score
    if genre.lower() == "horror":
        h_n = max(h_n, 6)

    total: int = v_n + s_n + l_n + d_n + t_n + h_n

    # ---------------------------------------------------------------------------
    # Rating decision — hard triggers first, then total score
    # ---------------------------------------------------------------------------
    rating: str

    # Hard triggers → immediate A rating regardless of total
    if s_raw >= 8:
        rating = "A"   # significant sexual content
    elif v_raw >= 20:
        rating = "A"   # significant violence
    elif l_raw >= 12:
        rating = "A"   # pervasive strong language
    elif total >= 28:
        rating = "A"
    elif total >= 10:
        rating = "UA"
    else:
        rating = "U"

    # ---------------------------------------------------------------------------
    # Build human-readable reasons
    # ---------------------------------------------------------------------------
    reasons: list[str] = []

    if v_n >= 6:
        reasons.append(f"Strong violence ({len(v_matched)} indicators detected)")
    elif v_n >= 3:
        reasons.append(f"Moderate violence ({len(v_matched)} indicators)")
    elif v_n >= 1:
        reasons.append("Mild violence")

    if s_n >= 4:
        reasons.append(f"Sexual content ({len(s_matched)} indicators)")
    elif s_n >= 1:
        reasons.append("Mild romantic or intimate content")

    if l_n >= 4:
        reasons.append(f"Strong language ({len(l_matched)} instances)")
    elif l_n >= 1:
        reasons.append("Mild language")

    if d_n >= 3:
        reasons.append(f"Significant drug/substance references ({len(d_matched)} indicators)")
    elif d_n >= 1:
        reasons.append("Mild substance references")

    if t_n >= 3:
        reasons.append(f"Sensitive political or social themes ({len(t_matched)} indicators)")
    elif t_n >= 1:
        reasons.append("Mild thematic content")

    if h_n >= 3:
        reasons.append(f"Horror/supernatural elements ({len(h_matched)} indicators)")
    elif h_n >= 1:
        reasons.append("Mild horror or supernatural elements")

    if not reasons:
        reasons = ["Clean content — no significant objectionable material detected"]

    # Confidence: higher when score is clearly in a band, lower when borderline
    confidence: str
    if total >= 35 or total <= 5:
        confidence = "high"
    elif 15 <= total <= 25:
        confidence = "medium"
    else:
        confidence = "low"  # borderline — real CBFC board could go either way

    # Official CBFC criteria text
    _CRITERIA: dict[str, str] = {
        "U":  "Suitable for unrestricted public exhibition — content is clean and family-appropriate",
        "UA": "Parental guidance advisable — may contain content unsuitable for children under 12",
        "A":  "Restricted to adult audiences (18+) — contains content not suitable for minors",
    }

    logger.info(
        "estimate_cbfc_rating: rating=%s confidence=%s total=%d scenes=%d",
        rating, confidence, total, scene_count,
    )

    return {
        "rating": rating,
        "confidence": confidence,
        "total_score": total,
        "breakdown": {
            "violence": v_n,
            "sexual_content": s_n,
            "language": l_n,
            "drug_references": d_n,
            "sensitive_themes": t_n,
            "horror": h_n,
        },
        "reasons": reasons,
        "cbfc_criteria": _CRITERIA[rating],
        "scene_count": scene_count,
    }
