"""
GovScheme Navigator — Explanation Generator
Generates simple Hindi/Hinglish/English explanations of scheme eligibility.

CRITICAL RULE:
- The explanation MUST reflect the rules engine result EXACTLY.
- The LLM MUST NOT override, reverse, or soften the eligibility decision.
- The LLM MUST NOT promise approval, payment, or government action.
- The LLM MUST use only scheme facts from the provided context — no invented rules.
"""
from __future__ import annotations

from typing import Optional

from app.ai.bedrock_client import BedrockClient
from app.core.errors import AIExtractionError, InvalidModelOutputError
from app.core.logging import get_logger, make_correlation_id
from app.schemas.eligibility import EligibilityResult, EligibilityStatus
from app.schemas.profile import UserProfile

logger = get_logger(__name__)

_SYSTEM_PROMPT_TEMPLATE = """
You are a helpful assistant explaining Indian government scheme eligibility to a citizen.
You are given:
1. A structured user profile (facts only).
2. Scheme information.
3. An eligibility RESULT produced by a deterministic rules engine.

YOUR STRICT RULES:
1. Your explanation MUST match the eligibility result exactly. If the result is "not_eligible", explain why — do NOT suggest the user might be eligible.
2. If the result is "eligible", explain what matched and list the required documents.
3. If the result is "needs_more_information", ask for ONLY the missing fields listed.
4. NEVER invent scheme criteria, amounts, dates, or rules not given to you.
5. NEVER promise approval, payment, or any government action.
6. Use simple, clear language appropriate for a first-generation smartphone user.
7. Respond in: {language}
8. Keep the response under 300 words.
9. Do NOT repeat the raw JSON — only provide a human-readable explanation.

Eligibility decision (do NOT change this): {status}
""".strip()


def generate_explanation(
    profile: UserProfile,
    eligibility: EligibilityResult,
    client: BedrockClient,
    language: str = "hi",
    correlation_id: Optional[str] = None,
) -> str:
    """
    Generate a simple explanation of the eligibility result.
    The LLM explanation mirrors the rules engine — it cannot change the decision.

    Args:
        profile: Extracted user profile
        eligibility: Rules engine output (source of truth)
        client: BedrockClient instance
        language: Output language (hi | en | hinglish)
        correlation_id: Request trace ID

    Returns:
        Human-readable explanation string

    Raises:
        AIExtractionError: On Bedrock failure
    """
    cid = correlation_id or make_correlation_id()

    system_prompt = _SYSTEM_PROMPT_TEMPLATE.format(
        language=_language_label(language),
        status=eligibility.status.value,
    )

    # Build context — do NOT include raw identity data
    profile_summary = _safe_profile_summary(profile)
    rules_summary = _rules_summary(eligibility)

    user_message = f"""
Scheme: {eligibility.scheme_name_en} ({eligibility.scheme_name_hi})
Status: {eligibility.status.value.upper()}

User profile summary:
{profile_summary}

Rules engine result:
{rules_summary}

Required documents: {', '.join(eligibility.required_documents) if eligibility.required_documents else 'None listed'}
Missing information: {', '.join(eligibility.missing_information) if eligibility.missing_information else 'None'}

Please provide a simple, clear explanation in {_language_label(language)}.
""".strip()

    messages = [
        {"role": "user", "content": [{"text": user_message}]}
    ]

    try:
        explanation = client.converse(
            messages=messages,
            system_prompt=system_prompt,
            temperature=0.3,
            correlation_id=cid,
        )
    except Exception as exc:
        logger.error(
            "Explanation generation failed",
            extra={"correlation_id": cid, "error_type": type(exc).__name__},
        )
        # Return a safe fallback rather than crashing
        return _fallback_explanation(eligibility, language)

    # Sanity check: ensure the explanation reflects the correct status
    explanation = _enforce_status_consistency(explanation, eligibility.status)

    logger.info(
        "Explanation generated",
        extra={"correlation_id": cid, "status": eligibility.status.value},
    )
    return explanation


def _language_label(code: str) -> str:
    mapping = {
        "hi": "simple Hindi (हिंदी)",
        "en": "simple English",
        "hinglish": "Hinglish (Hindi mixed with English)",
    }
    return mapping.get(code, "simple Hindi")


def _safe_profile_summary(profile: UserProfile) -> str:
    """Build a profile summary without raw identity data."""
    parts = []
    if profile.state:
        parts.append(f"State: {profile.state}")
    if profile.occupation:
        parts.append(f"Occupation: {profile.occupation.value}")
    if profile.monthly_income is not None:
        parts.append(f"Monthly income: ₹{profile.monthly_income:,.0f}")
    if profile.family_size is not None:
        parts.append(f"Family size: {profile.family_size}")
    if profile.age is not None:
        parts.append(f"Age: {profile.age}")
    if profile.gender:
        parts.append(f"Gender: {profile.gender.value if profile.gender else 'not specified'}")
    if profile.is_registered_worker is not None:
        parts.append(f"Registered worker: {'Yes' if profile.is_registered_worker else 'No'}")
    return "\n".join(parts) if parts else "No profile information available"


def _rules_summary(eligibility: EligibilityResult) -> str:
    parts = []
    if eligibility.matched_rules:
        parts.append("Criteria met:")
        for r in eligibility.matched_rules:
            parts.append(f"  ✓ {r.description or r.field} ({r.operator} {r.expected_value})")
    if eligibility.failed_rules:
        parts.append("Criteria NOT met:")
        for r in eligibility.failed_rules:
            parts.append(
                f"  ✗ {r.description or r.field}: required {r.operator} {r.expected_value}, "
                f"found {r.actual_value}"
            )
    if eligibility.missing_information:
        parts.append(f"Missing information: {', '.join(eligibility.missing_information)}")
    return "\n".join(parts) if parts else "No rules evaluated"


def _enforce_status_consistency(explanation: str, status: EligibilityStatus) -> str:
    """
    Add a pinned status line if the explanation might be ambiguous.
    This ensures the explanation never contradicts the engine result.
    """
    status_pin = {
        EligibilityStatus.eligible: "✅ Eligibility status: ELIGIBLE",
        EligibilityStatus.not_eligible: "❌ Eligibility status: NOT ELIGIBLE",
        EligibilityStatus.needs_more_information: "ℹ️ Eligibility status: MORE INFORMATION NEEDED",
    }
    pin = status_pin.get(status, "")
    return f"{pin}\n\n{explanation}" if pin else explanation


def _fallback_explanation(eligibility: EligibilityResult, language: str) -> str:
    """Safe fallback explanation when Bedrock is unavailable."""
    if language == "hi":
        return (
            f"योजना: {eligibility.scheme_name_hi}\n"
            f"परिणाम: {eligibility.status.value}\n"
            "AI स्पष्टीकरण अभी उपलब्ध नहीं है। कृपया पुनः प्रयास करें।"
        )
    return (
        f"Scheme: {eligibility.scheme_name_en}\n"
        f"Result: {eligibility.status.value}\n"
        "AI explanation is temporarily unavailable. Please try again."
    )
