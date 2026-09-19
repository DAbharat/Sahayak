"""
GovScheme Navigator — Document Extraction Route
POST /api/documents/extract
"""
from __future__ import annotations

from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from pydantic import BaseModel

from app.aws.textract_service import TextractService, get_textract_service
from app.config import get_settings
from app.core.errors import FileTooLargeError
from app.core.logging import get_logger, make_correlation_id
from app.schemas.document import DocumentExtractResponse, FieldCheckResult

logger = get_logger(__name__)
router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post(
    "/extract",
    response_model=DocumentExtractResponse,
    summary="Extract text from a document (Amazon Textract)",
    description=(
        "Upload a document (JPEG, PNG, PDF, TIFF) and receive extracted text and key-value pairs. "
        "Optionally supply expected values for a basic legibility check. "
        "IMPORTANT: This is a text extraction service only. "
        "It does NOT verify document authenticity or government status."
    ),
)
async def extract_document(
    file: UploadFile = File(..., description="Document image or PDF to extract"),
    expected_fields: Optional[str] = Form(
        None,
        description=(
            "JSON string of expected field values for legibility check, e.g. "
            '\'{"Name": "Ramu Kumar"}\'. '
            "Comparison is for legibility check ONLY — not authenticity."
        ),
    ),
    service: TextractService = Depends(get_textract_service),
) -> DocumentExtractResponse:
    correlation_id = make_correlation_id()
    settings = get_settings()

    file_bytes = await file.read()
    if len(file_bytes) > settings.max_upload_size_bytes:
        raise FileTooLargeError(
            f"Document too large ({len(file_bytes)} bytes). Max: {settings.max_upload_size_bytes}"
        )

    content_type = file.content_type or "image/jpeg"
    logger.info(
        "Document extraction request",
        extra={
            "correlation_id": correlation_id,
            "content_type": content_type,
            "size_bytes": len(file_bytes),
        },
    )

    raw_text, kv_pairs, page_count = service.extract_document(
        file_bytes=file_bytes,
        content_type=content_type,
        correlation_id=correlation_id,
    )

    # Build field checks if expected values provided
    field_checks: List[FieldCheckResult] = []
    if expected_fields:
        import json as _json

        try:
            expected: Dict[str, str] = _json.loads(expected_fields)
            # Build a lookup from extracted key-value pairs
            extracted_map = {
                kv.key.strip().lower(): kv.value for kv in kv_pairs
            }
            for field_name, expected_val in expected.items():
                extracted_val = extracted_map.get(field_name.strip().lower())
                match = None
                if extracted_val is not None:
                    match = extracted_val.strip().lower() == expected_val.strip().lower()
                field_checks.append(
                    FieldCheckResult(
                        field_name=field_name,
                        extracted_value=extracted_val,
                        expected_value=expected_val,
                        legibility_match=match,
                    )
                )
        except Exception:
            logger.warning(
                "Failed to parse expected_fields JSON",
                extra={"correlation_id": correlation_id},
            )

    return DocumentExtractResponse(
        raw_text=raw_text,
        key_value_pairs=kv_pairs,
        field_checks=field_checks,
        page_count=page_count,
        correlation_id=correlation_id,
    )
