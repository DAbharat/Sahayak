"""
GovScheme Navigator — FastAPI Application Entry Point
"""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import routes_document, routes_draft, routes_explanation, routes_health, routes_profile, routes_scheme, routes_voice
from app.config import get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging, get_logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown."""
    configure_logging()
    logger = get_logger(__name__)
    settings = get_settings()
    logger.info(
        "GovScheme Navigator starting",
        extra={
            "bedrock_model": settings.bedrock_model_id,
            "aws_region": settings.aws_region,
            "log_level": settings.log_level,
        },
    )
    yield
    logger.info("GovScheme Navigator shutting down")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="GovScheme Navigator AI Backend",
        description=(
            "AI/ML backend for the GovScheme Navigator hackathon project. "
            "Provides Hindi/Hinglish/English NLU, scheme eligibility evaluation, "
            "explanation generation, draft creation, and voice I/O via AWS services."
        ),
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ── CORS ──────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Exception Handlers ────────────────────────────────────────────────
    register_exception_handlers(app)

    # ── Routers ───────────────────────────────────────────────────────────
    app.include_router(routes_health.router)
    app.include_router(routes_profile.router)
    app.include_router(routes_scheme.router)
    app.include_router(routes_explanation.router)
    app.include_router(routes_draft.router)
    app.include_router(routes_voice.router)
    app.include_router(routes_document.router)

    return app


app = create_app()
