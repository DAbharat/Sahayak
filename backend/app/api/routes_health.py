"""GovScheme Navigator — Health check endpoint."""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


@router.get("/health", response_model=HealthResponse, summary="Health check")
async def health() -> HealthResponse:
    """Returns 200 OK when the service is running."""
    return HealthResponse(
        status="ok",
        service="GovScheme Navigator AI Backend",
        version="1.0.0",
    )
