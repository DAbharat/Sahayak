"""
GovScheme Navigator — Voice Routes
POST /api/voice/transcribe  — Audio → text via Amazon Transcribe
POST /api/voice/synthesize  — Text → audio via Amazon Polly
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.aws.polly_service import PollyService, get_polly_service
from app.aws.transcribe_service import TranscribeService, get_transcribe_service
from app.config import get_settings
from app.core.errors import FileTooLargeError
from app.core.logging import get_logger, make_correlation_id
from app.schemas.voice import SynthesizeRequest, SynthesizeResponse, TranscribeResponse

logger = get_logger(__name__)
router = APIRouter(prefix="/api/voice", tags=["voice"])

AUDIO_CONTENT_TYPES = {
    "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
    "audio/flac", "audio/ogg", "audio/webm", "audio/mp4",
    "video/mp4", "audio/amr",
}


@router.post(
    "/transcribe",
    response_model=TranscribeResponse,
    summary="Convert audio to text (Amazon Transcribe)",
    description=(
        "Upload an audio file (WAV, MP3, FLAC, OGG, WebM, MP4) and receive the transcribed text. "
        "Optimized for Hindi (hi-IN) but supports other Transcribe languages. "
        "AWS credentials and a configured S3 bucket are required."
    ),
)
async def transcribe_audio(
    file: UploadFile = File(..., description="Audio file to transcribe"),
    language_code: str = Form("hi-IN", description="AWS language code (hi-IN, en-IN, etc.)"),
    service: TranscribeService = Depends(get_transcribe_service),
) -> TranscribeResponse:
    correlation_id = make_correlation_id()
    settings = get_settings()

    # Validate file size
    audio_bytes = await file.read()
    if len(audio_bytes) > settings.max_upload_size_bytes:
        raise FileTooLargeError(
            f"Audio file too large ({len(audio_bytes)} bytes). Max: {settings.max_upload_size_bytes}"
        )

    content_type = file.content_type or "audio/wav"
    logger.info(
        "Transcription request",
        extra={
            "correlation_id": correlation_id,
            "content_type": content_type,
            "size_bytes": len(audio_bytes),
            "language_code": language_code,
        },
    )

    transcript, job_name, confidence = service.transcribe_audio(
        audio_bytes=audio_bytes,
        content_type=content_type,
        language_code=language_code,
        correlation_id=correlation_id,
    )

    return TranscribeResponse(
        transcript=transcript,
        language_code=language_code,
        job_name=job_name,
        confidence=confidence,
        correlation_id=correlation_id,
    )


@router.post(
    "/synthesize",
    response_model=SynthesizeResponse,
    summary="Convert text to speech (Amazon Polly)",
    description=(
        "Synthesizes Hindi or English speech from text using Amazon Polly. "
        "Returns base64-encoded MP3 audio. Falls back to text if synthesis fails."
    ),
)
async def synthesize_speech(
    request: SynthesizeRequest,
    service: PollyService = Depends(get_polly_service),
) -> SynthesizeResponse:
    correlation_id = make_correlation_id()
    logger.info(
        "Speech synthesis request",
        extra={
            "correlation_id": correlation_id,
            "language": request.language,
            "text_length": len(request.text),
        },
    )

    audio_b64, voice_id, succeeded = service.synthesize(
        text=request.text,
        language=request.language,
        voice_id=request.voice_id,
        correlation_id=correlation_id,
    )

    return SynthesizeResponse(
        audio_base64=audio_b64,
        content_type="audio/mpeg",
        text_fallback=request.text,
        voice_id=voice_id,
        synthesis_succeeded=succeeded,
        correlation_id=correlation_id,
    )
