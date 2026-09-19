"""
GovScheme Navigator — Speech-to-Text Service using faster-whisper
Replaces Amazon Transcribe with local/server-side faster-whisper inference.
Maintains exact response contract: (transcript, job_name, confidence).
"""
from __future__ import annotations

import math
import os
import tempfile
import threading
import time
import uuid
from typing import Optional, Tuple

from app.config import get_settings
from app.core.errors import TranscriptionError, UnsupportedFileTypeError
from app.core.logging import get_logger

logger = get_logger(__name__)

# Supported audio MIME types and their typical file extensions
SUPPORTED_AUDIO_FORMATS = {
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/wave": ".wav",
    "audio/flac": ".flac",
    "audio/ogg": ".ogg",
    "audio/webm": ".webm",
    "audio/mp4": ".mp4",
    "video/mp4": ".mp4",
    "audio/amr": ".amr",
    "audio/m4a": ".m4a",
    "audio/x-m4a": ".m4a",
    "audio/aac": ".aac",
}

# Standard filename extension fallbacks
VALID_EXTENSIONS = {
    ".wav", ".mp3", ".m4a", ".webm", ".ogg", ".flac", ".mp4", ".amr", ".aac"
}


class WhisperService:
    """
    Singleton service wrapping faster-whisper WhisperModel.
    Ensures model is initialized only once and reused across concurrent requests.
    """

    def __init__(
        self,
        model_size: Optional[str] = None,
        device: Optional[str] = None,
        compute_type: Optional[str] = None,
        beam_size: Optional[int] = None,
        download_root: Optional[str] = None,
    ) -> None:
        settings = get_settings()
        self.model_size = model_size or settings.whisper_model_size
        self.device = device or settings.whisper_device
        self.compute_type = compute_type or settings.whisper_compute_type
        self.beam_size = beam_size or settings.whisper_beam_size
        self.download_root = download_root or settings.whisper_download_root

        self._model = None
        self._lock = threading.Lock()

    def get_model(self):
        """
        Lazily loads and returns the singleton WhisperModel instance.
        Thread-safe initialization prevents multiple concurrent model loads.
        """
        if self._model is not None:
            return self._model

        with self._lock:
            if self._model is not None:
                return self._model

            try:
                from faster_whisper import WhisperModel
            except ImportError as exc:
                logger.error("faster-whisper is not installed in the environment")
                raise TranscriptionError(
                    "Speech-to-text service is not available (missing faster-whisper dependency)."
                ) from exc

            logger.info(
                "Loading faster-whisper model",
                extra={
                    "model_size": self.model_size,
                    "device": self.device,
                    "compute_type": self.compute_type,
                },
            )

            try:
                self._model = WhisperModel(
                    self.model_size,
                    device=self.device,
                    compute_type=self.compute_type,
                    download_root=self.download_root,
                )
            except Exception as exc:
                # If CUDA or specific compute_type fails, attempt graceful fallback to CPU
                if self.device != "cpu":
                    logger.warning(
                        f"Failed to load Whisper model on device '{self.device}': {exc}. "
                        "Attempting fallback to cpu / int8."
                    )
                    try:
                        self.device = "cpu"
                        self.compute_type = "int8"
                        self._model = WhisperModel(
                            self.model_size,
                            device="cpu",
                            compute_type="int8",
                            download_root=self.download_root,
                        )
                    except Exception as fallback_exc:
                        logger.error(f"Fallback model loading failed: {fallback_exc}")
                        raise TranscriptionError(
                            f"Failed to initialize speech recognition model: {fallback_exc}"
                        ) from fallback_exc
                else:
                    logger.error(f"WhisperModel initialization failed: {exc}")
                    raise TranscriptionError(
                        f"Failed to initialize speech recognition model: {exc}"
                    ) from exc

            logger.info("faster-whisper model successfully loaded and ready")
            return self._model

    def _determine_suffix(self, content_type: str, filename: Optional[str]) -> str:
        """Determines appropriate file extension for temp file from content_type or filename."""
        if filename:
            _, ext = os.path.splitext(filename)
            if ext and ext.lower() in VALID_EXTENSIONS:
                return ext.lower()

        clean_type = (content_type or "").split(";")[0].strip().lower()
        if clean_type in SUPPORTED_AUDIO_FORMATS:
            return SUPPORTED_AUDIO_FORMATS[clean_type]

        # Default fallback
        return ".wav"

    def transcribe_audio(
        self,
        audio_bytes: bytes,
        content_type: str = "audio/wav",
        language_code: Optional[str] = "hi-IN",
        filename: Optional[str] = None,
        correlation_id: str = "",
    ) -> Tuple[str, str, Optional[float]]:
        """
        Transcribes raw audio bytes using faster-whisper.

        Args:
            audio_bytes: Raw binary content of the uploaded audio file
            content_type: MIME type of audio
            language_code: Requested or expected language code (e.g. 'hi-IN', 'en-IN', 'hi', 'auto')
            filename: Original uploaded file name
            correlation_id: Request correlation ID for tracing

        Returns:
            Tuple of (transcript_text, job_name, confidence_score)

        Raises:
            UnsupportedFileTypeError: If audio format is completely unsupported
            TranscriptionError: If audio is empty or transcription fails
        """
        if not audio_bytes or len(audio_bytes) == 0:
            raise TranscriptionError("Audio file is empty. Please provide valid audio data.")

        # Check content type if provided
        clean_type = (content_type or "").split(";")[0].strip().lower()
        has_valid_type = clean_type in SUPPORTED_AUDIO_FORMATS
        has_valid_ext = False
        if filename:
            _, ext = os.path.splitext(filename)
            if ext and ext.lower() in VALID_EXTENSIONS:
                has_valid_ext = True

        if clean_type and clean_type not in ("application/octet-stream", "binary/octet-stream") and not has_valid_type and not has_valid_ext:
            raise UnsupportedFileTypeError(
                f"Audio format '{content_type}' is not supported. "
                f"Supported formats: {sorted(list(SUPPORTED_AUDIO_FORMATS.keys()))}"
            )

        suffix = self._determine_suffix(clean_type, filename)

        job_name = f"whisper-{correlation_id[:8] if correlation_id else uuid.uuid4().hex[:8]}-{int(time.time())}"

        # Map language code: faster-whisper expects 2-letter ISO (e.g. 'hi', 'en') or None for auto-detect
        whisper_lang = None
        if language_code and language_code.lower() not in ("auto", "none", ""):
            whisper_lang = language_code.split("-")[0].lower()

        # Write audio bytes to temporary file for faster-whisper processing
        temp_path = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                temp_file.write(audio_bytes)
                temp_path = temp_file.name

            model = self.get_model()

            logger.info(
                "Running faster-whisper transcription",
                extra={
                    "job_name": job_name,
                    "correlation_id": correlation_id,
                    "whisper_lang": whisper_lang,
                    "bytes_len": len(audio_bytes),
                    "beam_size": self.beam_size,
                },
            )

            # Transcribe with VAD filter to omit non-speech noise
            segments, info = model.transcribe(
                temp_path,
                language=whisper_lang,
                beam_size=self.beam_size,
                vad_filter=True,
            )

            segment_texts = []
            confidences = []

            for segment in segments:
                text_chunk = segment.text.strip()
                if text_chunk:
                    segment_texts.append(text_chunk)
                if segment.avg_logprob is not None:
                    try:
                        prob = math.exp(segment.avg_logprob)
                        confidences.append(min(1.0, max(0.0, prob)))
                    except OverflowError:
                        confidences.append(1.0)

            full_transcript = " ".join(segment_texts).strip()

            if not full_transcript:
                logger.warning(
                    "Transcription resulted in empty text",
                    extra={"job_name": job_name, "correlation_id": correlation_id},
                )
                raise TranscriptionError(
                    "Transcription returned empty result. Please ensure the audio contains clear speech."
                )

            # Compute average confidence or fallback to language probability
            if confidences:
                avg_confidence = round(sum(confidences) / len(confidences), 3)
            elif hasattr(info, "language_probability") and info.language_probability:
                avg_confidence = round(float(info.language_probability), 3)
            else:
                avg_confidence = 0.95

            logger.info(
                "Transcription completed successfully",
                extra={
                    "job_name": job_name,
                    "correlation_id": correlation_id,
                    "char_count": len(full_transcript),
                    "avg_confidence": avg_confidence,
                    "detected_language": getattr(info, "language", whisper_lang),
                },
            )

            return full_transcript, job_name, avg_confidence

        except (TranscriptionError, UnsupportedFileTypeError):
            raise
        except Exception as exc:
            logger.error(
                f"faster-whisper transcription error: {exc}",
                extra={"job_name": job_name, "correlation_id": correlation_id},
                exc_info=True,
            )
            raise TranscriptionError(
                f"Voice transcription failed: {str(exc)}"
            ) from exc
        finally:
            if temp_path and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except OSError as err:
                    logger.warning(f"Failed to delete temp file {temp_path}: {err}")

    def transcribe(
        self,
        audio_bytes: bytes,
        filename: str = "audio.wav",
        content_type: str = "audio/wav",
        language_code: Optional[str] = "hi-IN",
        correlation_id: str = "",
    ):
        """Alias for transcribe_audio to support callers using transcribe(bytes, filename)."""
        return self.transcribe_audio(
            audio_bytes=audio_bytes,
            content_type=content_type,
            language_code=language_code,
            filename=filename,
            correlation_id=correlation_id,
        )


# Module-level singleton
_whisper_service: Optional[WhisperService] = None


def get_whisper_service() -> WhisperService:
    """Returns the singleton WhisperService instance."""
    global _whisper_service
    if _whisper_service is None:
        _whisper_service = WhisperService()
    return _whisper_service
