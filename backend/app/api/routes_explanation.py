"""
GovScheme Navigator — Explanation Route
POST /api/explanation
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.ai.bedrock_client import BedrockClient, get_bedrock_client
from app.ai.explanation_generator import generate_explanation
from app.core.logging import get_logger, make_correlation_id
from app.schemas.eligibility import EligibilityResult
from app.schemas.profile import UserProfile

logger = get_logger(__name__)
router = APIRouter(prefix="/api", tags=["explanation"])


class ExplanationRequest(BaseModel):
    profile: dict = Field(..., description="UserProfile dict")
    eligibility: dict = Field(..., description="EligibilityResult dict from rules engine")
    language: str = Field("hi", description="Output language: hi | en | hinglish")


class ExplanationResponse(BaseModel):
    explanation: str
    scheme_id: str
    status: str
    language: str
    correlation_id: str


@router.post(
    "/explanation",
    response_model=ExplanationResponse,
    summary="Generate a simple-language explanation of scheme eligibility",
    description=(
        "Takes the rules engine result (EligibilityResult) and user profile and generates "
        "a human-readable explanation in Hindi/English/Hinglish. "
        "The LLM explanation CANNOT override the rules engine decision."
    ),
)
async def generate_explanation_endpoint(
    request: ExplanationRequest,
    client: BedrockClient = Depends(get_bedrock_client),
) -> ExplanationResponse:
    correlation_id = make_correlation_id()
    logger.info(
        "Explanation request",
        extra={
            "correlation_id": correlation_id,
            "language": request.language,
        },
    )

    # Validate inputs
    profile = UserProfile(**request.profile)
    eligibility = EligibilityResult(**request.eligibility)

    explanation = generate_explanation(
        profile=profile,
        eligibility=eligibility,
        client=client,
        language=request.language,
        correlation_id=correlation_id,
    )

    return ExplanationResponse(
        explanation=explanation,
        scheme_id=eligibility.scheme_id,
        status=eligibility.status.value,
        language=request.language,
        correlation_id=correlation_id,
    )
