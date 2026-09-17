"""
GovScheme Navigator — Amazon Bedrock Client
Reusable client wrapping boto3 bedrock-runtime using the Converse API.

Features:
- Configurable model ID
- Low temperature for extraction, higher for generation
- Bounded retry with exponential backoff for transient errors
- Safe structured JSON parsing + Pydantic validation
- No sensitive data logged
"""
from __future__ import annotations

import json
import re
import time
from typing import Any, Dict, List, Optional, Type, TypeVar

import boto3
from botocore.exceptions import ClientError, EndpointResolutionError

from app.config import get_settings
from app.core.errors import BedrockInvocationError, InvalidModelOutputError
from app.core.logging import get_logger

logger = get_logger(__name__)
T = TypeVar("T")

# Errors that indicate transient issues (safe to retry)
_RETRYABLE_CODES = {
    "ThrottlingException",
    "ServiceUnavailableException",
    "ModelTimeoutException",
    "TooManyRequestsException",
}


def _build_boto3_session() -> boto3.Session:
    settings = get_settings()
    kwargs: Dict[str, Any] = {"region_name": settings.aws_region}
    if settings.aws_profile:
        kwargs["profile_name"] = settings.aws_profile
    return boto3.Session(**kwargs)


class BedrockClient:
    """
    Thread-safe, reusable Bedrock client.
    Instantiate once per application (via dependency injection or module-level singleton).
    """

    def __init__(self, session: Optional[boto3.Session] = None) -> None:
        settings = get_settings()
        self._settings = settings
        _session = session or _build_boto3_session()
        self._client = _session.client("bedrock-runtime")
        self._model_id = settings.bedrock_model_id
        logger.info("BedrockClient initialized", extra={"model_id": self._model_id})

    def converse(
        self,
        *,
        messages: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        correlation_id: str = "",
    ) -> str:
        """
        Call Bedrock Converse API and return the assistant text response.
        Retries on transient errors.
        """
        settings = self._settings
        _temperature = temperature if temperature is not None else settings.bedrock_extraction_temperature
        _max_tokens = max_tokens or settings.bedrock_max_tokens

        request_kwargs: Dict[str, Any] = {
            "modelId": self._model_id,
            "messages": messages,
            "inferenceConfig": {
                "temperature": _temperature,
                "maxTokens": _max_tokens,
            },
        }
        if system_prompt:
            request_kwargs["system"] = [{"text": system_prompt}]

        last_exception: Optional[Exception] = None
        for attempt in range(1, settings.bedrock_max_retries + 1):
            try:
                logger.info(
                    "Bedrock converse attempt",
                    extra={
                        "attempt": attempt,
                        "model_id": self._model_id,
                        "correlation_id": correlation_id,
                    },
                )
                response = self._client.converse(**request_kwargs)
                text = response["output"]["message"]["content"][0]["text"]
                logger.info(
                    "Bedrock converse success",
                    extra={"correlation_id": correlation_id, "attempt": attempt},
                )
                return text
            except ClientError as exc:
                error_code = exc.response["Error"]["Code"]
                if error_code in _RETRYABLE_CODES and attempt < settings.bedrock_max_retries:
                    wait = 2 ** attempt
                    logger.warning(
                        "Bedrock transient error, retrying",
                        extra={
                            "error_code": error_code,
                            "wait_seconds": wait,
                            "correlation_id": correlation_id,
                        },
                    )
                    time.sleep(wait)
                    last_exception = exc
                    continue
                logger.error(
                    "Bedrock ClientError (non-retryable or max retries exceeded)",
                    extra={
                        "error_code": error_code,
                        "correlation_id": correlation_id,
                    },
                )
                raise BedrockInvocationError(
                    f"Bedrock error: {error_code}"
                ) from exc
            except (EndpointResolutionError, Exception) as exc:
                logger.error(
                    "Bedrock unexpected error",
                    extra={"error_type": type(exc).__name__, "correlation_id": correlation_id},
                )
                raise BedrockInvocationError(
                    f"Bedrock unexpected error: {type(exc).__name__}"
                ) from exc

        raise BedrockInvocationError(
            f"Bedrock max retries ({settings.bedrock_max_retries}) exceeded"
        ) from last_exception

    def extract_json(
        self,
        *,
        messages: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        correlation_id: str = "",
    ) -> Dict[str, Any]:
        """
        Call Bedrock and parse the response as JSON.
        Strips markdown code fences before parsing.
        """
        raw = self.converse(
            messages=messages,
            system_prompt=system_prompt,
            temperature=temperature or self._settings.bedrock_extraction_temperature,
            correlation_id=correlation_id,
        )
        return _parse_json_from_llm_output(raw, correlation_id=correlation_id)


def _strip_code_fences(text: str) -> str:
    """Remove ```json ... ``` or ``` ... ``` wrappers."""
    text = text.strip()
    patterns = [
        r"```json\s*(.*?)\s*```",
        r"```\s*(.*?)\s*```",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.DOTALL)
        if match:
            return match.group(1).strip()
    return text


def _parse_json_from_llm_output(
    raw: str, correlation_id: str = ""
) -> Dict[str, Any]:
    """Attempt to parse JSON from LLM output, with fallback strategies."""
    cleaned = _strip_code_fences(raw)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Fallback: find first { ... } block
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    logger.error(
        "Failed to parse Bedrock JSON output",
        extra={"correlation_id": correlation_id, "raw_length": len(raw)},
    )
    raise InvalidModelOutputError(
        f"Could not parse JSON from model output. Raw length: {len(raw)}"
    )


# ── Module-level singleton ────────────────────────────────────────────────────

_bedrock_client: Optional[BedrockClient] = None


def get_bedrock_client() -> BedrockClient:
    """FastAPI dependency / module-level singleton accessor."""
    global _bedrock_client
    if _bedrock_client is None:
        _bedrock_client = BedrockClient()
    return _bedrock_client
