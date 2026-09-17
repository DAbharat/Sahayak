"""
GovScheme Navigator — Amazon Polly Service
Converts text to Hindi speech audio.

Features:
- Hindi voice (Aditi standard / Kajal neural where available)
- Returns base64-encoded MP3 audio bytes
- Text fallback when synthesis fails (never crashes the request)
"""
from __future__ import annotations

import base64
from typing import Optional, Tuple

import boto3
from botocore.exceptions import ClientError

from app.config import get_settings
from app.core.errors import SpeechSynthesisError
from app.core.logging import get_logger

logger = get_logger(__name__)

# Supported languages → default voice
LANGUAGE_VOICE_MAP = {
    "hi": "Aditi",
    "en": "Raveena",
    "hinglish": "Aditi",
}

MAX_POLLY_CHARS = 3000  # AWS Polly limit is 3000 characters per request


class PollyService:
    """Wraps Amazon Polly for text-to-speech synthesis."""

    def __init__(
        self,
        session: Optional[boto3.Session] = None,
        polly_client=None,
    ) -> None:
        settings = get_settings()
        self._settings = settings
        _session = session or _build_session(settings)
        self._polly = polly_client or _session.client("polly")

    def synthesize(
        self,
        text: str,
        language: str = "hi",
        voice_id: Optional[str] = None,
        correlation_id: str = "",
    ) -> Tuple[Optional[str], str, bool]:
        """
        Synthesize text to speech.

        Args:
            text: Text to convert to speech (max 3000 chars)
            language: Language code (hi | en | hinglish)
            voice_id: Override voice ID (uses config default if None)
            correlation_id: Request trace ID

        Returns:
            Tuple of (base64_audio_or_None, actual_voice_id, synthesis_succeeded)
        """
        settings = self._settings
        # Truncate if too long
        if len(text) > MAX_POLLY_CHARS:
            text = text[:MAX_POLLY_CHARS]
            logger.warning(
                "Text truncated for Polly synthesis",
                extra={"correlation_id": correlation_id, "max_chars": MAX_POLLY_CHARS},
            )

        # Determine voice
        effective_voice = voice_id or settings.polly_voice_id or LANGUAGE_VOICE_MAP.get(language, "Aditi")
        engine = settings.polly_engine

        try:
            logger.info(
                "Synthesizing speech with Polly",
                extra={
                    "voice_id": effective_voice,
                    "engine": engine,
                    "correlation_id": correlation_id,
                },
            )
            response = self._polly.synthesize_speech(
                Text=text,
                OutputFormat="mp3",
                VoiceId=effective_voice,
                Engine=engine,
            )

            audio_stream = response.get("AudioStream")
            if audio_stream is None:
                raise SpeechSynthesisError("Polly returned no audio stream")

            audio_bytes = audio_stream.read()
            audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

            logger.info(
                "Speech synthesis complete",
                extra={
                    "correlation_id": correlation_id,
                    "audio_bytes": len(audio_bytes),
                    "voice_id": effective_voice,
                },
            )
            return audio_b64, effective_voice, True

        except ClientError as exc:
            error_code = exc.response["Error"]["Code"]
            logger.error(
                "Polly synthesis failed",
                extra={
                    "error_code": error_code,
                    "correlation_id": correlation_id,
                    "voice_id": effective_voice,
                },
            )
            # Return None audio — caller provides text fallback
            return None, effective_voice, False

        except SpeechSynthesisError:
            return None, effective_voice, False

        except Exception as exc:
            logger.error(
                "Polly unexpected error",
                extra={"error_type": type(exc).__name__, "correlation_id": correlation_id},
            )
            return None, effective_voice, False


def _build_session(settings) -> boto3.Session:
    kwargs = {"region_name": settings.aws_region}
    if settings.aws_profile:
        kwargs["profile_name"] = settings.aws_profile
    return boto3.Session(**kwargs)


# Module-level singleton
_polly_service: Optional[PollyService] = None


def get_polly_service() -> PollyService:
    global _polly_service
    if _polly_service is None:
        _polly_service = PollyService()
    return _polly_service
