"""
GovScheme Navigator — Document Extraction Schemas (Amazon Textract)
IMPORTANT: Textract checks legibility/readability only.
It does NOT verify document authenticity.
"""
from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class ExtractedField(BaseModel):
    """A key-value pair extracted from a document."""
    key: str
    value: str
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)


class FieldCheckResult(BaseModel):
    """
    Comparison of an extracted field against a user-supplied expected value.
    This is an extraction/legibility check ONLY — NOT an authenticity check.
    """
    field_name: str
    extracted_value: Optional[str] = None
    expected_value: Optional[str] = None
    legibility_match: Optional[bool] = None
    note: str = Field(
        "This is a basic text extraction check, not a document authenticity verification."
    )


class DocumentExtractResponse(BaseModel):
    """Result of Textract document processing."""
    raw_text: str = Field(..., description="All extracted raw text from the document")
    key_value_pairs: List[ExtractedField] = Field(
        default_factory=list, description="Structured key-value pairs found"
    )
    field_checks: List[FieldCheckResult] = Field(
        default_factory=list,
        description="User-supplied field comparisons (legibility check only)",
    )
    page_count: int = Field(1)
    authenticity_disclaimer: str = Field(
        "Document extraction is for legibility and field-reading only. "
        "This system does NOT verify document authenticity, government portal status, or submission.",
    )
    correlation_id: str
