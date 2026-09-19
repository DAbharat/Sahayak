"""
GovScheme Navigator — Application Configuration
Reads settings from environment variables / .env file.
"""
from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── AWS Core ──────────────────────────────────────────────────────────
    aws_region: str = "us-east-1"
    aws_profile: str | None = None

    # ── Amazon Bedrock ────────────────────────────────────────────────────
    bedrock_model_id: str = "google.gemma-3-4b-it-v1:0"
    bedrock_max_tokens: int = 1024
    bedrock_extraction_temperature: float = 0.1
    bedrock_generation_temperature: float = 0.3
    bedrock_max_retries: int = 3

    # ── Amazon Transcribe (Legacy / Fallback) ─────────────────────────────
    transcribe_s3_bucket: str = ""
    transcribe_timeout_seconds: int = 120

    # ── Speech-to-Text (faster-whisper) ───────────────────────────────────
    whisper_model_size: str = "small"
    whisper_device: str = "cpu"
    whisper_compute_type: str = "int8"
    whisper_beam_size: int = 5
    whisper_download_root: str | None = None

    # ── Amazon Polly ──────────────────────────────────────────────────────
    polly_voice_id: str = "Aditi"
    polly_engine: str = "standard"

    # ── Amazon Textract ───────────────────────────────────────────────────
    textract_s3_bucket: str = ""

    # ── Application ───────────────────────────────────────────────────────
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:3000"
    max_upload_size_bytes: int = 10 * 1024 * 1024  # 10 MB

    # ── Streamlit & Session Safety ────────────────────────────────────────
    streamlit_mock_mode: bool = True
    max_bedrock_requests_per_session: int = 10
    max_audio_size_mb: int = 10
    max_document_size_mb: int = 5

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
