"""
GovScheme Navigator — Amazon Textract Service
Document text extraction and key-value pair parsing.

IMPORTANT DISCLAIMERS:
- Textract extracts text and key-value pairs from uploaded images/PDFs.
- This service does NOT verify document authenticity.
- This service does NOT verify government portal submission status.
- Extracted fields are checked for legibility only.
"""
from __future__ import annotations

import uuid
from typing import List, Optional, Tuple

import boto3
from botocore.exceptions import ClientError

from app.config import get_settings
from app.core.errors import DocumentExtractionError, UnsupportedFileTypeError
from app.core.logging import get_logger
from app.schemas.document import ExtractedField

logger = get_logger(__name__)

SUPPORTED_DOCUMENT_TYPES = {
    "image/jpeg": "jpeg",
    "image/jpg": "jpeg",
    "image/png": "png",
    "application/pdf": "pdf",
    "image/tiff": "tiff",
}


class TextractService:
    """Wraps Amazon Textract for document text extraction."""

    def __init__(
        self,
        session: Optional[boto3.Session] = None,
        s3_client=None,
        textract_client=None,
    ) -> None:
        settings = get_settings()
        self._settings = settings
        _session = session or _build_session(settings)
        self._s3 = s3_client or _session.client("s3")
        self._textract = textract_client or _session.client("textract")

    def extract_document(
        self,
        file_bytes: bytes,
        content_type: str,
        correlation_id: str = "",
    ) -> Tuple[str, List[ExtractedField], int]:
        """
        Extract text and key-value pairs from a document.

        Args:
            file_bytes: Raw document bytes
            content_type: MIME type of the document
            correlation_id: Request trace ID

        Returns:
            Tuple of (raw_text, key_value_pairs, page_count)

        Raises:
            UnsupportedFileTypeError: If the document format is not supported
            DocumentExtractionError: If Textract fails
        """
        # Validate format
        doc_type = SUPPORTED_DOCUMENT_TYPES.get(content_type.lower())
        if not doc_type:
            raise UnsupportedFileTypeError(
                f"Document type '{content_type}' is not supported. "
                f"Supported types: {list(SUPPORTED_DOCUMENT_TYPES.keys())}"
            )

        settings = self._settings
        bucket = settings.textract_s3_bucket

        # For single-page images, Textract can work inline (no S3 needed)
        # For PDFs and multi-page docs, S3 is required
        if doc_type == "pdf":
            return self._extract_via_s3(file_bytes, content_type, correlation_id)
        else:
            return self._extract_inline(file_bytes, content_type, correlation_id)

    def _extract_inline(
        self, file_bytes: bytes, content_type: str, correlation_id: str
    ) -> Tuple[str, List[ExtractedField], int]:
        """Extract from an image inline (no S3 required)."""
        try:
            logger.info(
                "Extracting document inline with Textract",
                extra={"correlation_id": correlation_id, "bytes": len(file_bytes)},
            )
            response = self._textract.analyze_document(
                Document={"Bytes": file_bytes},
                FeatureTypes=["FORMS"],  # Extract key-value pairs
            )
        except ClientError as exc:
            raise DocumentExtractionError(
                f"Textract extraction failed: {exc.response['Error']['Code']}"
            ) from exc

        return self._parse_textract_response(response, correlation_id)

    def _extract_via_s3(
        self, file_bytes: bytes, content_type: str, correlation_id: str
    ) -> Tuple[str, List[ExtractedField], int]:
        """Upload to S3 and use async Textract for PDFs."""
        bucket = self._settings.textract_s3_bucket
        if not bucket:
            raise DocumentExtractionError(
                "Textract S3 bucket not configured. Set TEXTRACT_S3_BUCKET in .env"
            )

        key = f"textract/{correlation_id or uuid.uuid4().hex}.pdf"
        try:
            self._s3.put_object(Bucket=bucket, Key=key, Body=file_bytes)
        except ClientError as exc:
            raise DocumentExtractionError(
                f"Failed to upload document to S3: {exc.response['Error']['Code']}"
            ) from exc

        try:
            response = self._textract.start_document_analysis(
                DocumentLocation={"S3Object": {"Bucket": bucket, "Name": key}},
                FeatureTypes=["FORMS"],
            )
            job_id = response["JobId"]
        except ClientError as exc:
            raise DocumentExtractionError(
                f"Failed to start Textract job: {exc.response['Error']['Code']}"
            ) from exc

        # Poll for result
        import time
        for _ in range(24):  # max 2 minutes
            time.sleep(5)
            try:
                result = self._textract.get_document_analysis(JobId=job_id)
            except ClientError as exc:
                raise DocumentExtractionError(
                    f"Failed to get Textract result: {exc.response['Error']['Code']}"
                ) from exc

            status = result["JobStatus"]
            if status == "SUCCEEDED":
                return self._parse_textract_response(result, correlation_id)
            elif status == "FAILED":
                raise DocumentExtractionError(
                    f"Textract job failed: {result.get('StatusMessage', 'Unknown')}"
                )

        raise DocumentExtractionError("Textract job timed out after 2 minutes")

    def _parse_textract_response(
        self, response: dict, correlation_id: str
    ) -> Tuple[str, List[ExtractedField], int]:
        """Parse Textract response into raw text and key-value pairs."""
        blocks = response.get("Blocks", [])
        pages = set()

        # Collect raw text
        lines = []
        key_map = {}
        value_map = {}
        block_map = {}

        for block in blocks:
            block_id = block.get("Id", "")
            block_map[block_id] = block

            if block.get("Page"):
                pages.add(block["Page"])

            if block["BlockType"] == "LINE":
                lines.append(block.get("Text", ""))
            elif block["BlockType"] == "KEY_VALUE_SET":
                entity_types = block.get("EntityTypes", [])
                if "KEY" in entity_types:
                    key_map[block_id] = block
                elif "VALUE" in entity_types:
                    value_map[block_id] = block

        raw_text = "\n".join(lines)

        # Extract key-value pairs
        kv_pairs: List[ExtractedField] = []
        for key_block_id, key_block in key_map.items():
            key_text = self._get_text_from_block(key_block, block_map)
            # Find corresponding value
            for rel in key_block.get("Relationships", []):
                if rel["Type"] == "VALUE":
                    for val_id in rel["Ids"]:
                        val_block = value_map.get(val_id)
                        if val_block:
                            val_text = self._get_text_from_block(val_block, block_map)
                            confidence = key_block.get("Confidence", 0) / 100.0
                            if key_text:
                                kv_pairs.append(
                                    ExtractedField(
                                        key=key_text.strip(),
                                        value=val_text.strip(),
                                        confidence=confidence,
                                    )
                                )

        page_count = max(pages) if pages else 1
        logger.info(
            "Textract extraction complete",
            extra={
                "correlation_id": correlation_id,
                "page_count": page_count,
                "kv_pairs": len(kv_pairs),
                "lines": len(lines),
            },
        )
        return raw_text, kv_pairs, page_count

    def _get_text_from_block(self, block: dict, block_map: dict) -> str:
        """Extract text content from a block and its children."""
        text = ""
        if block.get("Relationships"):
            for rel in block["Relationships"]:
                if rel["Type"] == "CHILD":
                    for child_id in rel["Ids"]:
                        child = block_map.get(child_id, {})
                        if child.get("BlockType") == "WORD":
                            text += child.get("Text", "") + " "
                        elif child.get("BlockType") == "SELECTION_ELEMENT":
                            status = child.get("SelectionStatus", "")
                            text += f"[{status}] "
        return text.strip()


def _build_session(settings) -> boto3.Session:
    kwargs = {"region_name": settings.aws_region}
    if settings.aws_profile:
        kwargs["profile_name"] = settings.aws_profile
    return boto3.Session(**kwargs)


# Module-level singleton
_textract_service: Optional[TextractService] = None


def get_textract_service() -> TextractService:
    global _textract_service
    if _textract_service is None:
        _textract_service = TextractService()
    return _textract_service
