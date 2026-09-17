"""
GovScheme Navigator — Profile Extractor
Converts free-form Hindi/Hinglish/English text into a validated UserProfile.

Rules:
- NEVER invent facts (unknown values = null)
- Detect missing fields
- Normalize occupation using the controlled enum
- Convert Indian numeric expressions (e.g., "पंद्रह हजार" = 15000)
- Preserve uncertainty (use low confidence scores for uncertain values)
- Do NOT make eligibility decisions
"""
from __future__ import annotations

import json
from typing import Any, Dict, Optional

from pydantic import ValidationError

from app.ai.bedrock_client import BedrockClient
from app.core.errors import AIExtractionError, InvalidModelOutputError
from app.core.logging import get_logger, make_correlation_id
from app.schemas.profile import (
    LanguageEnum,
    OccupationEnum,
    UserProfile,
)

logger = get_logger(__name__)

# Occupation mappings from common Hindi/English terms → enum values
OCCUPATION_HINTS = {
    "रेहड़ी": "street_vendor",
    "रेहड़ीवाला": "street_vendor",
    "फेरीवाला": "street_vendor",
    "vendor": "street_vendor",
    "street vendor": "street_vendor",
    "construction": "construction_worker",
    "मजदूर": "construction_worker",
    "निर्माण": "construction_worker",
    "किसान": "small_farmer",
    "farmer": "small_farmer",
    "मछुआरा": "fisherman",
    "fisherman": "fisherman",
    "auto": "auto_driver",
    "rickshaw": "rickshaw_puller",
    "artisan": "artisan",
    "कारीगर": "artisan",
}

_SYSTEM_PROMPT = """
You are an expert information extractor for an Indian government scheme navigator.
Your job is to extract structured facts from a citizen's free-form text (Hindi, Hinglish, or English).

STRICT RULES:
1. NEVER invent or assume facts not present in the text.
2. If a fact is not mentioned, set its value to null.
3. Convert Indian numeric expressions to numbers:
   - "पंद्रह हजार" → 15000
   - "दस हजार" → 10000
   - "1 lakh" → 100000
4. Normalize state names to standard English names (e.g., "हरियाणा" → "Haryana").
5. Normalize occupation to ONE of these values:
   construction_worker, street_vendor, agricultural_worker, domestic_worker,
   rickshaw_puller, auto_driver, small_farmer, fisherman, artisan,
   daily_wage_worker, self_employed, unemployed, student, other, unknown
6. Detect language: hi (Hindi), en (English), hinglish (mixed Hindi+English), other.
7. Set missing_fields to a list of important fields NOT mentioned that are commonly needed
   for scheme eligibility (e.g., income, state, family_size).
8. Set confidence as a dict of field → float (0.0–1.0). Use lower scores for inferred/uncertain values.
9. Do NOT make any eligibility determination.

Return ONLY valid JSON, no explanation. Format:
{
  "state": string or null,
  "district": string or null,
  "occupation": string (from enum list above),
  "monthly_income": number or null,
  "family_size": integer or null,
  "children_count": integer or null,
  "children_school_going": boolean or null,
  "age": integer or null,
  "gender": "male" | "female" | "other" | "not_specified" | null,
  "is_registered_worker": boolean or null,
  "caste_category": string or null,
  "has_bank_account": boolean or null,
  "documents_available": [string],
  "missing_fields": [string],
  "language": "hi" | "en" | "hinglish" | "other",
  "confidence": { "field_name": float }
}
""".strip()


def extract_profile(
    text: str,
    client: BedrockClient,
    correlation_id: Optional[str] = None,
) -> UserProfile:
    """
    Extract a structured UserProfile from free-form text using Bedrock.

    Args:
        text: User's free-form input (Hindi/Hinglish/English)
        client: Initialized BedrockClient
        correlation_id: Optional request trace ID

    Returns:
        Validated UserProfile with missing_fields populated

    Raises:
        AIExtractionError: If extraction or validation fails
    """
    cid = correlation_id or make_correlation_id()
    logger.info("Starting profile extraction", extra={"correlation_id": cid})

    messages = [
        {
            "role": "user",
            "content": [{"text": f"Extract structured facts from this text:\n\n{text}"}],
        }
    ]

    try:
        raw_json = client.extract_json(
            messages=messages,
            system_prompt=_SYSTEM_PROMPT,
            temperature=0.1,
            correlation_id=cid,
        )
    except InvalidModelOutputError as exc:
        raise AIExtractionError("Model returned malformed JSON during profile extraction") from exc

    # Validate and coerce with Pydantic
    try:
        # Ensure occupation is a valid enum value
        raw_json = _normalize_occupation(raw_json)
        # Ensure language is valid
        raw_json = _normalize_language(raw_json)
        # Attach raw_input (not sent to Bedrock, kept for downstream use)
        raw_json["raw_input"] = text
        profile = UserProfile(**raw_json)
    except (ValidationError, TypeError, ValueError) as exc:
        logger.error(
            "Profile Pydantic validation failed",
            extra={"correlation_id": cid, "error": str(exc)},
        )
        raise AIExtractionError(
            f"Profile validation failed after extraction: {exc}"
        ) from exc

    logger.info(
        "Profile extraction complete",
        extra={
            "correlation_id": cid,
            "occupation": profile.occupation.value,
            "language": profile.language.value,
            "missing_count": len(profile.missing_fields),
        },
    )
    return profile


def _normalize_occupation(data: Dict[str, Any]) -> Dict[str, Any]:
    """Ensure occupation is a valid OccupationEnum value, defaulting to 'unknown'."""
    occ = data.get("occupation", "unknown")
    valid_values = {e.value for e in OccupationEnum}
    if occ not in valid_values:
        # Try case-insensitive match
        occ_lower = str(occ).lower().replace(" ", "_")
        if occ_lower in valid_values:
            data["occupation"] = occ_lower
        else:
            data["occupation"] = "unknown"
    return data


def _normalize_language(data: Dict[str, Any]) -> Dict[str, Any]:
    """Ensure language is a valid LanguageEnum value, defaulting to 'en'."""
    lang = data.get("language", "en")
    valid_values = {e.value for e in LanguageEnum}
    if lang not in valid_values:
        data["language"] = "en"
    return data
