"""
GovScheme Navigator — Scheme Schemas
Represents government scheme definitions including source metadata.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, HttpUrl


class SchemeSource(BaseModel):
    """Verified source metadata — REQUIRED for every scheme record."""
    title: str = Field(..., description="Official title of the source document or page")
    url: str = Field(..., description="Direct URL to official government source")
    version_or_checked_date: str = Field(
        ..., description="Version or date when criteria were last verified (YYYY-MM-DD)"
    )


class SchemeRule(BaseModel):
    """
    A single eligibility rule.
    field: the UserProfile field to check
    operator: one of equals, not_equals, lt, lte, gt, gte, in, bool_equals
    value: the target value to compare against
    """
    field: str
    operator: str
    value: Any
    description: Optional[str] = None


class SchemeRecord(BaseModel):
    """
    A government scheme with eligibility criteria, documents, and source.
    NOTE: Criteria marked SAMPLE/DEMO must be verified by project team before public use.
    """
    scheme_id: str
    name_en: str
    name_hi: str
    description_en: str
    description_hi: str
    eligible_occupations: List[str] = Field(default_factory=list)
    rules: List[SchemeRule] = Field(default_factory=list)
    required_documents: List[str] = Field(default_factory=list)
    benefit_summary_en: str = ""
    benefit_summary_hi: str = ""
    application_url: Optional[str] = None
    source: SchemeSource
    is_demo_data: bool = Field(
        True,
        description="True = SAMPLE/DEMO data not yet verified by project team",
    )


class SchemeListResponse(BaseModel):
    schemes: List[SchemeRecord]
    total: int
