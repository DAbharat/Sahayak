"""
GovScheme Navigator — Draft Generator
Generates editable application and grievance draft letters.

STRICT RULES:
- NEVER fabricate IDs, dates, payment references, addresses, registration
  numbers, Aadhaar numbers, or submission status.
- Use [PLACEHOLDER_NAME] format for missing information.
- Only include beneficiary information explicitly provided.
- Only use scheme name when explicitly known.
"""
from __future__ import annotations

import re
from typing import List, Optional

from app.ai.bedrock_client import BedrockClient
from app.core.logging import get_logger, make_correlation_id
from app.schemas.draft import DraftRequest, DraftResponse, DraftType

logger = get_logger(__name__)

_GRIEVANCE_SYSTEM_PROMPT = """
You are a legal-aid assistant helping low-income citizens write government grievance letters.

STRICT RULES:
1. NEVER fabricate: IDs, dates, payment references, Aadhaar numbers, addresses,
   registration numbers, application numbers, phone numbers, or submission portal status.
2. Use applicant information provided in the request directly.
3. NEVER create a placeholder for information that is already provided.
4. Use [PLACEHOLDER_NAME] only when a required piece of information is genuinely missing.
5. Only mention a scheme name if explicitly provided.
6. If a responsible department or authority is explicitly provided, use it directly.
7. Do NOT replace a provided department/authority with a placeholder.
8. Do NOT invent or infer a department/authority that was not provided.
9. Only describe facts about the user's situation that are explicitly provided in the request.
10. Do NOT invent events, dates, application history, payment delays, submitted documents,
    or previous communications with authorities.
11. Keep language simple and respectful.
12. The letter should request a specific, reasonable action from the authority.
13. Do NOT claim the portal accepted or rejected anything.

Return ONLY valid JSON (no markdown):
{
  "subject": "string",
  "body": "string",
  "placeholders": ["list of placeholder keys actually used"]
}
""".strip()

_APPLICATION_SYSTEM_PROMPT = """
You are a legal-aid assistant helping low-income citizens write government scheme application cover letters.

STRICT RULES:
1. NEVER fabricate: IDs, dates, payment references, Aadhaar numbers, addresses,
   registration numbers, or application numbers.
2. Use [PLACEHOLDER_NAME] for ANY missing information (e.g., [APPLICANT_NAME], [VILLAGE]).
3. Only mention scheme name if explicitly provided.
4. Only include applicant details explicitly mentioned by the user.
5. Keep language simple, formal, and respectful.
6. Do NOT promise or imply approval.

Return ONLY valid JSON (no markdown):
{
  "subject": "string",
  "body": "string (letter text with [PLACEHOLDER] markers)",
  "placeholders": ["list of placeholder keys used"]
}
""".strip()


def generate_draft(
    request: DraftRequest,
    client: BedrockClient,
    correlation_id: Optional[str] = None,
) -> DraftResponse:
    """
    Generate an application or grievance draft.

    Args:
        request: DraftRequest with user text and preferences
        client: BedrockClient instance
        correlation_id: Request trace ID

    Returns:
        DraftResponse with subject, body, placeholders
    """
    cid = correlation_id or make_correlation_id()
    logger.info(
        "Generating draft",
        extra={
            "correlation_id": cid,
            "draft_type": request.draft_type.value,
            "language": request.language,
        },
    )

    system_prompt = (
        _GRIEVANCE_SYSTEM_PROMPT
        if request.draft_type == DraftType.grievance
        else _APPLICATION_SYSTEM_PROMPT
    )

    user_message = _build_user_message(request)
    messages = [{"role": "user", "content": [{"text": user_message}]}]

    try:
        raw_json = client.extract_json(
            messages=messages,
            system_prompt=system_prompt,
            temperature=0.3,
            correlation_id=cid,
        )
        subject = str(raw_json.get("subject", "[SUBJECT]"))
        body = str(raw_json.get("body", "[DRAFT_BODY]"))
        placeholders: List[str] = raw_json.get("placeholders", [])

        # Also extract any [PLACEHOLDER] markers from the body not listed
        found = re.findall(r"\[([A-Z_]+)\]", body)
        all_placeholders = list(dict.fromkeys(placeholders + found))  # deduplicate, preserve order

    except Exception as exc:
        logger.error(
            "Draft generation failed, using fallback",
            extra={"correlation_id": cid, "error_type": type(exc).__name__},
        )
        subject, body, all_placeholders = _fallback_draft(request)

    logger.info(
        "Draft generated",
        extra={"correlation_id": cid, "placeholder_count": len(all_placeholders)},
    )

    return DraftResponse(
        draft_type=request.draft_type,
        language=request.language,
        subject=subject,
        body=body,
        placeholders=all_placeholders,
        correlation_id=cid,
    )


def _build_user_message(request: DraftRequest) -> str:
    """Build the user message context for the LLM."""
    parts = [
        f"Draft type: {request.draft_type.value}",
        f"Language: {request.language}",
        f"\nUser's situation/complaint:\n{request.user_text}",
    ]

    if request.scheme_name:
        parts.append(f"\nScheme name (known): {request.scheme_name}")

    if request.department_name:
        parts.append(
            f"\nResponsible department/authority (known): {request.department_name}"
        )   

    if request.profile_context:
        safe_fields = {
        k: v for k, v in request.profile_context.items()
        if k in (
            "name",
            "state",
            "district",
            "occupation",
            "monthly_income",
            "gender",
        )
        and v is not None
        and v != ""
    }

        if safe_fields:
            parts.append(f"\nApplicant profile context: {safe_fields}")

    parts.append(
        "\nIMPORTANT:"
        "\n- Use the provided applicant information directly."
        "\n- Do NOT create placeholders for information that is already provided."
        "\n- Use [PLACEHOLDER_NAME] only when information is genuinely missing."
        "\n- Do NOT fabricate IDs, dates, addresses, phone numbers, or references."
    )

    return "\n".join(parts)


def _fallback_draft(request: DraftRequest):
    """Return a safe fallback draft when Bedrock is unavailable."""
    if request.draft_type == DraftType.grievance:
        profile = request.profile_context or {}

        name = profile.get("name") or "[APPLICANT_NAME]"
        district = profile.get("district") or "[DISTRICT]"
        state = profile.get("state") or "[STATE]"
        scheme_name = request.scheme_name or "[SCHEME_NAME]"
        department_name = request.department_name or "[DEPARTMENT_NAME]"
        subject = f"Grievance Regarding {scheme_name}"

        body = (
            "To,\n"
            "The Competent Authority,\n"
            f"{department_name}\n"
            f"{district}, {state}\n\n"
            f"Subject: Grievance regarding {scheme_name}\n\n"
            "Respected Sir/Madam,\n\n"
            f"I, {name}, wish to bring to your kind attention the following issue:\n\n"
            f"{request.user_text}\n\n"
            "I humbly request you to look into this matter and take appropriate action "
            "at the earliest.\n\n"
            "Thanking you,\n"
            f"{name}"
        )
    else:
        subject = "Application for [SCHEME_NAME]"
        body = (
            "To,\nThe Competent Authority,\n[DEPARTMENT_NAME]\n[DISTRICT], [STATE]\n\n"
            "Subject: Application for [SCHEME_NAME]\n\n"
            "Respected Sir/Madam,\n\n"
            "I, [APPLICANT_NAME], resident of [VILLAGE/WARD], [DISTRICT], [STATE], "
            "respectfully submit this application for [SCHEME_NAME].\n\n"
            f"{request.user_text}\n\n"
            "I request you to kindly consider my application.\n\n"
            "Yours faithfully,\n[APPLICANT_NAME]\n[DATE]\nContact: [PHONE_NUMBER]"
        )
    placeholders = re.findall(r"\[([A-Z_/]+)\]", body)
    return subject, body, list(dict.fromkeys(placeholders))
