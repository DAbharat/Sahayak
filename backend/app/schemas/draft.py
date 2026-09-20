"""
GovScheme Navigator — Draft Schemas
Application and grievance drafts with placeholders for missing info.
"""
from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class DraftType(str, Enum):
    grievance = "grievance"
    application = "application"


class DraftRequest(BaseModel):
    """
    Request to generate a draft letter/application.
    Only include information actually provided by the user.
    """
    user_text: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User's description of their situation or complaint",
    )
    draft_type: DraftType = Field(DraftType.grievance)
    language: str = Field("hi", description="Preferred output language: hi | en | hinglish")
    # Optional context from prior profile extraction
    profile_context: Optional[dict] = Field(
        None, description="Extracted UserProfile dict (optional enrichment)"
    )
    department_name: Optional[str] = Field(
    None,
    description="Responsible department or authority for the scheme"
    )
    scheme_name: Optional[str] = Field(
        None, description="Specific scheme name — only when known"
    )


class DraftResponse(BaseModel):
    """
    Structured draft letter.
    Placeholders use the format: [PLACEHOLDER_NAME]
    """
    draft_type: DraftType
    language: str
    subject: str
    body: str
    placeholders: List[str] = Field(
        default_factory=list,
        description="List of placeholder keys used in the draft",
    )
    disclaimer: str = Field(
        "This draft was generated as a starting point. "
        "Please review and fill in all [PLACEHOLDER] fields before submitting.",
        description="Standard disclaimer reminding user to verify",
    )
    correlation_id: str
