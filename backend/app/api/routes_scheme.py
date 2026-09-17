"""
GovScheme Navigator — Scheme Routes
GET  /api/schemes/list
POST /api/schemes/evaluate
"""
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Query

from app.core.logging import get_logger, make_correlation_id
from app.rules.engine import evaluate_profile, load_schemes
from app.schemas.eligibility import SchemeEvaluateRequest, SchemeEvaluateResponse
from app.schemas.scheme import SchemeListResponse

logger = get_logger(__name__)
router = APIRouter(prefix="/api/schemes", tags=["schemes"])


@router.get(
    "/list",
    response_model=SchemeListResponse,
    summary="List all available schemes",
)
async def list_schemes() -> SchemeListResponse:
    """Returns all seeded government schemes with metadata."""
    schemes = load_schemes()
    return SchemeListResponse(schemes=schemes, total=len(schemes))


@router.post(
    "/evaluate",
    response_model=SchemeEvaluateResponse,
    summary="Evaluate user profile against government schemes",
    description=(
        "Deterministic rules engine evaluates the profile. "
        "The LLM is NOT involved in this endpoint. "
        "Returns eligible/not_eligible/needs_more_information per scheme."
    ),
)
async def evaluate_schemes(request: SchemeEvaluateRequest) -> SchemeEvaluateResponse:
    correlation_id = make_correlation_id()
    logger.info(
        "Scheme evaluation request",
        extra={
            "correlation_id": correlation_id,
            "scheme_ids": request.scheme_ids,
        },
    )

    results = evaluate_profile(
        profile=request.profile,
        scheme_ids=request.scheme_ids,
        correlation_id=correlation_id,
    )

    return SchemeEvaluateResponse(results=results, correlation_id=correlation_id)
