"""
GovScheme Navigator — Voice I/O Schemas (Transcribe + Polly)
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


# ── Transcribe ────────────────────────────────────────────────────────────────

class TranscribeResponse(BaseModel):
    """Result of audio-to-text transcription via Amazon Transcribe."""
    transcript: str = Field(..., description="Transcribed text")
    language_code: str = Field("hi-IN", description="Detected/requested language code")
    job_name: str = Field(..., description="Transcribe job name for reference")
    confidence: Optional[float] = Field(
        None, ge=0.0, le=1.0, description="Average confidence score"
    )
    correlation_id: str


# ── Polly ─────────────────────────────────────────────────────────────────────

class SynthesizeRequest(BaseModel):
    """Request to synthesize Hindi speech from text."""
    text: str = Field(..., min_length=1, max_length=3000, description="Text to synthesize")
    language: str = Field("hi", description="Language: hi | en")
    voice_id: Optional[str] = Field(
        None, description="Override voice ID (e.g. Aditi, Kajal). Default from config."
    )


class SynthesizeResponse(BaseModel):
    """Result of Polly speech synthesis."""
    audio_base64: Optional[str] = Field(
        None, description="Base64-encoded MP3 audio bytes"
    )
    content_type: str = Field("audio/mpeg")
    text_fallback: str = Field(
        ..., description="Original text — always provided as fallback"
    )
    voice_id: str
    synthesis_succeeded: bool
    correlation_id: str
