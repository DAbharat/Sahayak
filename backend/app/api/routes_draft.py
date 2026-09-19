"""
GovScheme Navigator — Draft Generation Routes
POST /api/drafts/grievance
POST /api/drafts/application
"""
from __future__ import annotations

from fastapi import APIRouter, Depends

from app.ai.bedrock_client import BedrockClient, get_bedrock_client
from app.ai.draft_generator import generate_draft
from app.core.logging import get_logger, make_correlation_id
from app.schemas.draft import DraftRequest, DraftResponse, DraftType

logger = get_logger(__name__)
router = APIRouter(prefix="/api/drafts", tags=["drafts"])


@router.post(
    "/grievance",
    response_model=DraftResponse,
    summary="Generate an editable grievance draft letter",
    description=(
        "Creates a structured grievance letter with [PLACEHOLDER] markers for missing info. "
        "Does NOT fabricate IDs, dates, or government references."
    ),
)
async def generate_grievance(
    request: DraftRequest,
    client: BedrockClient = Depends(get_bedrock_client),
) -> DraftResponse:
    correlation_id = make_correlation_id()
    # Force draft_type to grievance regardless of what was passed
    request = DraftRequest(
        **{**request.model_dump(), "draft_type": DraftType.grievance}
    )
    logger.info(
        "Grievance draft request",
        extra={"correlation_id": correlation_id, "language": request.language},
    )
    return generate_draft(request=request, client=client, correlation_id=correlation_id)


@router.post(
    "/application",
    response_model=DraftResponse,
    summary="Generate an editable application letter",
    description=(
        "Creates a structured application letter with [PLACEHOLDER] markers for missing info. "
        "Does NOT fabricate IDs, dates, or government references."
    ),
)
async def generate_application(
    request: DraftRequest,
    client: BedrockClient = Depends(get_bedrock_client),
) -> DraftResponse:
    correlation_id = make_correlation_id()
    request = DraftRequest(
        **{**request.model_dump(), "draft_type": DraftType.application}
    )
    logger.info(
        "Application draft request",
        extra={"correlation_id": correlation_id, "language": request.language},
    )
    return generate_draft(request=request, client=client, correlation_id=correlation_id)
