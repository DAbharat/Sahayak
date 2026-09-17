"""
GovScheme Navigator — Profile Extraction Route
POST /api/profile/extract
"""
from __future__ import annotations

from fastapi import APIRouter, Depends

from app.ai.bedrock_client import BedrockClient, get_bedrock_client
from app.ai.profile_extractor import extract_profile
from app.core.logging import get_logger, make_correlation_id
from app.schemas.profile import ProfileExtractRequest, ProfileExtractResponse

logger = get_logger(__name__)
router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.post(
    "/extract",
    response_model=ProfileExtractResponse,
    summary="Extract structured user profile from free-form text",
    description=(
        "Accepts Hindi, Hinglish, or English text and returns a structured UserProfile. "
        "Unknown values are returned as null — never invented. "
        "missing_fields lists what additional information is needed."
    ),
)
async def extract_profile_endpoint(
    request: ProfileExtractRequest,
    client: BedrockClient = Depends(get_bedrock_client),
) -> ProfileExtractResponse:
    correlation_id = make_correlation_id()
    logger.info(
        "Profile extraction request",
        extra={"correlation_id": correlation_id, "text_length": len(request.text)},
    )

    profile = extract_profile(
        text=request.text,
        client=client,
        correlation_id=correlation_id,
    )

    return ProfileExtractResponse(profile=profile, correlation_id=correlation_id)
