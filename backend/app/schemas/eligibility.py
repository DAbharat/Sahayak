"""
GovScheme Navigator — Eligibility Result Schemas
The rules engine (NOT the LLM) produces this result.
"""
from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.scheme import SchemeSource


class EligibilityStatus(str, Enum):
    eligible = "eligible"
    not_eligible = "not_eligible"
    needs_more_information = "needs_more_information"


class RuleResult(BaseModel):
    field: str
    operator: str
    expected_value: object
    actual_value: object
    passed: bool
    description: Optional[str] = None


class EligibilityResult(BaseModel):
    """
    Output of the deterministic rules engine.
    The LLM MUST NOT override or contradict this result.
    """
    scheme_id: str
    scheme_name_en: str
    scheme_name_hi: str
    status: EligibilityStatus
    matched_rules: List[RuleResult] = Field(default_factory=list)
    failed_rules: List[RuleResult] = Field(default_factory=list)
    missing_information: List[str] = Field(
        default_factory=list,
        description="Profile fields needed to complete evaluation",
    )
    required_documents: List[str] = Field(default_factory=list)
    source: SchemeSource


class SchemeEvaluateRequest(BaseModel):
    """Evaluate all or specific schemes against a user profile."""
    profile: dict = Field(
        ..., description="UserProfile dict from /api/profile/extract"
    )
    scheme_ids: Optional[List[str]] = Field(
        None, description="If None, evaluate all schemes"
    )


class SchemeEvaluateResponse(BaseModel):
    results: List[EligibilityResult]
    correlation_id: str
