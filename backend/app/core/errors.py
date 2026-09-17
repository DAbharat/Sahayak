"""
GovScheme Navigator — Custom Exceptions and FastAPI Error Handlers
All errors return safe user-facing messages without leaking AWS internals.
"""
from __future__ import annotations

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


# Version-agnostic status codes
STATUS_422: int = 422
STATUS_413: int = 413


# ── Domain Exceptions ─────────────────────────────────────────────────────────

class GovSchemeBaseError(Exception):
    """Base class for all application errors."""
    user_message: str = "An unexpected error occurred. Please try again."
    http_status: int = status.HTTP_500_INTERNAL_SERVER_ERROR


class AIExtractionError(GovSchemeBaseError):
    """Raised when the AI fails to extract a structured profile from text."""
    user_message = "Could not understand your input. Please try rephrasing."
    http_status: int = STATUS_422


class BedrockInvocationError(GovSchemeBaseError):
    """Raised when the Bedrock API call fails (throttling, timeout, etc.)."""
    user_message = "AI service is temporarily unavailable. Please try again shortly."
    http_status = status.HTTP_503_SERVICE_UNAVAILABLE


class InvalidModelOutputError(GovSchemeBaseError):
    """Raised when Bedrock returns malformed or non-parseable JSON."""
    user_message = "AI returned an unexpected response. Please try again."
    http_status = status.HTTP_502_BAD_GATEWAY


class RuleEvaluationError(GovSchemeBaseError):
    """Raised when the rules engine encounters an invalid scheme configuration."""
    user_message = "Scheme evaluation encountered an error. Please contact support."
    http_status = status.HTTP_500_INTERNAL_SERVER_ERROR


class TranscriptionError(GovSchemeBaseError):
    """Raised when Amazon Transcribe fails to process the audio."""
    user_message = "Voice transcription failed. Please try again or use text input."
    http_status = status.HTTP_502_BAD_GATEWAY


class SpeechSynthesisError(GovSchemeBaseError):
    """Raised when Amazon Polly fails to synthesize speech."""
    user_message = "Voice synthesis failed. Text response is available."
    http_status = status.HTTP_502_BAD_GATEWAY


class DocumentExtractionError(GovSchemeBaseError):
    """Raised when Amazon Textract fails to extract document content."""
    user_message = "Document extraction failed. Please ensure the document is legible."
    http_status = STATUS_422


class FileTooLargeError(GovSchemeBaseError):
    """Raised when an uploaded file exceeds the maximum allowed size."""
    user_message = "Uploaded file is too large. Maximum allowed size is 10 MB."
    http_status = STATUS_413


class UnsupportedFileTypeError(GovSchemeBaseError):
    """Raised when an uploaded file has an unsupported MIME type."""
    user_message = "Unsupported file type. Please upload a supported format."
    http_status = status.HTTP_415_UNSUPPORTED_MEDIA_TYPE


class SchemeNotFoundError(GovSchemeBaseError):
    """Raised when the requested scheme ID does not exist."""
    user_message = "Scheme not found."
    http_status = status.HTTP_404_NOT_FOUND


# ── FastAPI Exception Handlers ────────────────────────────────────────────────

def _error_response(exc: GovSchemeBaseError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.http_status,
        content={
            "error": type(exc).__name__,
            "message": exc.user_message,
        },
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register all custom exception handlers on the FastAPI app."""

    @app.exception_handler(GovSchemeBaseError)
    async def govscheme_error_handler(
        request: Request, exc: GovSchemeBaseError
    ) -> JSONResponse:
        return _error_response(exc)

    @app.exception_handler(AIExtractionError)
    async def ai_extraction_handler(
        request: Request, exc: AIExtractionError
    ) -> JSONResponse:
        return _error_response(exc)

    @app.exception_handler(BedrockInvocationError)
    async def bedrock_handler(
        request: Request, exc: BedrockInvocationError
    ) -> JSONResponse:
        return _error_response(exc)

    @app.exception_handler(InvalidModelOutputError)
    async def invalid_output_handler(
        request: Request, exc: InvalidModelOutputError
    ) -> JSONResponse:
        return _error_response(exc)

    @app.exception_handler(RuleEvaluationError)
    async def rule_handler(
        request: Request, exc: RuleEvaluationError
    ) -> JSONResponse:
        return _error_response(exc)

    @app.exception_handler(TranscriptionError)
    async def transcription_handler(
        request: Request, exc: TranscriptionError
    ) -> JSONResponse:
        return _error_response(exc)

    @app.exception_handler(SpeechSynthesisError)
    async def speech_handler(
        request: Request, exc: SpeechSynthesisError
    ) -> JSONResponse:
        return _error_response(exc)

    @app.exception_handler(DocumentExtractionError)
    async def document_handler(
        request: Request, exc: DocumentExtractionError
    ) -> JSONResponse:
        return _error_response(exc)

    @app.exception_handler(FileTooLargeError)
    async def file_too_large_handler(
        request: Request, exc: FileTooLargeError
    ) -> JSONResponse:
        return _error_response(exc)

    @app.exception_handler(UnsupportedFileTypeError)
    async def unsupported_file_handler(
        request: Request, exc: UnsupportedFileTypeError
    ) -> JSONResponse:
        return _error_response(exc)
