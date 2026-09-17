"""
GovScheme Navigator — Amazon Transcribe Service
Architecture: audio upload → S3 → Transcribe job → poll → return text

Handles:
- Unsupported file types
- Job failures
- Timeout
- Empty transcription
"""
from __future__ import annotations

import time
import uuid
from typing import Optional

import boto3
from botocore.exceptions import ClientError

from app.config import get_settings
from app.core.errors import TranscriptionError, UnsupportedFileTypeError
from app.core.logging import get_logger

logger = get_logger(__name__)

# Supported audio formats for Amazon Transcribe
SUPPORTED_FORMATS = {
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/flac": "flac",
    "audio/ogg": "ogg",
    "audio/webm": "webm",
    "audio/mp4": "mp4",
    "video/mp4": "mp4",
    "audio/amr": "amr",
}


class TranscribeService:
    """
    Wraps Amazon Transcribe for Hindi speech-to-text.
    Uses an S3 bucket as the intermediate storage for audio files.
    """

    def __init__(
        self,
        session: Optional[boto3.Session] = None,
        s3_client=None,
        transcribe_client=None,
    ) -> None:
        settings = get_settings()
        self._settings = settings
        _session = session or _build_session(settings)
        self._s3 = s3_client or _session.client("s3")
        self._transcribe = transcribe_client or _session.client("transcribe")

    def transcribe_audio(
        self,
        audio_bytes: bytes,
        content_type: str,
        language_code: str = "hi-IN",
        correlation_id: str = "",
    ) -> tuple[str, str, Optional[float]]:
        """
        Transcribe audio bytes to text.

        Args:
            audio_bytes: Raw audio file bytes
            content_type: MIME type of the audio
            language_code: AWS language code (default hi-IN for Hindi)
            correlation_id: Request trace ID

        Returns:
            Tuple of (transcript_text, job_name, confidence_score)

        Raises:
            UnsupportedFileTypeError: If the audio format is not supported
            TranscriptionError: If the transcription job fails or times out
        """
        settings = self._settings
        bucket = settings.transcribe_s3_bucket

        # Validate format
        fmt = SUPPORTED_FORMATS.get(content_type.lower())
        if not fmt:
            raise UnsupportedFileTypeError(
                f"Audio format '{content_type}' is not supported. "
                f"Supported formats: {list(SUPPORTED_FORMATS.keys())}"
            )

        if not bucket:
            raise TranscriptionError(
                "Transcribe S3 bucket not configured. Set TRANSCRIBE_S3_BUCKET in .env"
            )

        job_name = f"govscheme-{correlation_id or uuid.uuid4().hex[:8]}-{int(time.time())}"
        s3_key = f"transcribe/{job_name}.{fmt}"

        # Upload audio to S3
        try:
            logger.info(
                "Uploading audio to S3 for transcription",
                extra={"job_name": job_name, "s3_key": s3_key, "correlation_id": correlation_id},
            )
            self._s3.put_object(
                Bucket=bucket,
                Key=s3_key,
                Body=audio_bytes,
                ContentType=content_type,
            )
        except ClientError as exc:
            raise TranscriptionError(
                f"Failed to upload audio to S3: {exc.response['Error']['Code']}"
            ) from exc

        s3_uri = f"s3://{bucket}/{s3_key}"

        # Start Transcribe job
        try:
            logger.info("Starting Transcribe job", extra={"job_name": job_name})
            self._transcribe.start_transcription_job(
                TranscriptionJobName=job_name,
                Media={"MediaFileUri": s3_uri},
                MediaFormat=fmt,
                LanguageCode=language_code,
                Settings={"ShowSpeakerLabels": False},
            )
        except ClientError as exc:
            raise TranscriptionError(
                f"Failed to start transcription job: {exc.response['Error']['Code']}"
            ) from exc

        # Poll for completion
        transcript, confidence = self._poll_job(job_name, correlation_id)
        return transcript, job_name, confidence

    def _poll_job(
        self, job_name: str, correlation_id: str
    ) -> tuple[str, Optional[float]]:
        """Poll the Transcribe job until complete or timeout."""
        settings = self._settings
        timeout = settings.transcribe_timeout_seconds
        elapsed = 0
        poll_interval = 5

        while elapsed < timeout:
            time.sleep(poll_interval)
            elapsed += poll_interval

            try:
                result = self._transcribe.get_transcription_job(
                    TranscriptionJobName=job_name
                )
            except ClientError as exc:
                raise TranscriptionError(
                    f"Failed to get transcription job status: {exc.response['Error']['Code']}"
                ) from exc

            status = result["TranscriptionJob"]["TranscriptionJobStatus"]
            logger.info(
                "Transcription job status",
                extra={"job_name": job_name, "status": status, "elapsed": elapsed},
            )

            if status == "COMPLETED":
                transcript_uri = result["TranscriptionJob"]["Transcript"]["TranscriptFileUri"]
                return self._fetch_transcript(transcript_uri, correlation_id)
            elif status == "FAILED":
                reason = result["TranscriptionJob"].get("FailureReason", "Unknown")
                raise TranscriptionError(f"Transcription job failed: {reason}")

        raise TranscriptionError(
            f"Transcription job timed out after {timeout}s. Job: {job_name}"
        )

    def _fetch_transcript(
        self, uri: str, correlation_id: str
    ) -> tuple[str, Optional[float]]:
        """Fetch and parse the transcript JSON from the result URI."""
        import json
        import urllib.request

        try:
            with urllib.request.urlopen(uri, timeout=30) as resp:
                data = json.loads(resp.read())
        except Exception as exc:
            raise TranscriptionError(f"Failed to fetch transcript result: {exc}") from exc

        results = data.get("results", {})
        transcripts = results.get("transcripts", [])
        if not transcripts or not transcripts[0].get("transcript"):
            raise TranscriptionError("Transcription returned empty result")

        text = transcripts[0]["transcript"].strip()
        if not text:
            raise TranscriptionError("Transcription result is empty")

        # Extract average confidence if available
        confidence: Optional[float] = None
        items = results.get("items", [])
        if items:
            confidences = [
                float(i["alternatives"][0]["confidence"])
                for i in items
                if i.get("type") == "pronunciation"
                and i.get("alternatives")
                and i["alternatives"][0].get("confidence")
            ]
            if confidences:
                confidence = sum(confidences) / len(confidences)

        logger.info(
            "Transcription complete",
            extra={
                "correlation_id": correlation_id,
                "char_count": len(text),
                "avg_confidence": confidence,
            },
        )
        return text, confidence


def _build_session(settings) -> boto3.Session:
    kwargs = {"region_name": settings.aws_region}
    if settings.aws_profile:
        kwargs["profile_name"] = settings.aws_profile
    return boto3.Session(**kwargs)


# Module-level singleton
_transcribe_service: Optional[TranscribeService] = None


def get_transcribe_service() -> TranscribeService:
    global _transcribe_service
    if _transcribe_service is None:
        _transcribe_service = TranscribeService()
    return _transcribe_service
