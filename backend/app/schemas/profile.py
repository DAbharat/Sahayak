"""
GovScheme Navigator — User Profile Schemas
All fields are optional/nullable to handle partial extractions gracefully.
Missing values are NEVER invented — they stay None.
"""
from __future__ import annotations

from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class OccupationEnum(str, Enum):
    construction_worker = "construction_worker"
    street_vendor = "street_vendor"
    agricultural_worker = "agricultural_worker"
    domestic_worker = "domestic_worker"
    rickshaw_puller = "rickshaw_puller"
    auto_driver = "auto_driver"
    small_farmer = "small_farmer"
    fisherman = "fisherman"
    artisan = "artisan"
    daily_wage_worker = "daily_wage_worker"
    self_employed = "self_employed"
    unemployed = "unemployed"
    student = "student"
    other = "other"
    unknown = "unknown"


class LanguageEnum(str, Enum):
    hi = "hi"       # Hindi
    en = "en"       # English
    hinglish = "hinglish"
    other = "other"


class GenderEnum(str, Enum):
    male = "male"
    female = "female"
    other = "other"
    not_specified = "not_specified"


class UserProfile(BaseModel):
    """
    Structured user profile extracted from free-form text.
    Unknown/unmentioned values MUST be None — never invent facts.
    """
    state: Optional[str] = Field(None, description="Indian state name (English)")
    district: Optional[str] = Field(None, description="District within the state")
    occupation: OccupationEnum = Field(OccupationEnum.unknown, description="Normalized occupation")
    monthly_income: Optional[float] = Field(None, ge=0, description="Monthly income in INR")
    income_currency: str = Field("INR", description="Always INR for this application")
    family_size: Optional[int] = Field(None, ge=1, description="Total family members")
    children_count: Optional[int] = Field(None, ge=0, description="Number of children")
    children_school_going: Optional[bool] = Field(None, description="Whether children attend school")
    age: Optional[int] = Field(None, ge=0, le=150, description="Age in years")
    gender: Optional[GenderEnum] = Field(None, description="Gender")
    is_registered_worker: Optional[bool] = Field(
        None, description="Whether registered with a Labour/welfare board"
    )
    caste_category: Optional[str] = Field(
        None, description="SC/ST/OBC/General — only if explicitly mentioned"
    )
    has_bank_account: Optional[bool] = Field(None, description="Whether has a bank account")
    documents_available: List[str] = Field(
        default_factory=list,
        description="Documents the user has mentioned having",
    )
    missing_fields: List[str] = Field(
        default_factory=list,
        description="Fields that could not be extracted and should be asked",
    )
    language: LanguageEnum = Field(LanguageEnum.en, description="Detected language of input")
    confidence: Dict[str, float] = Field(
        default_factory=dict,
        description="Per-field extraction confidence (0.0–1.0)",
    )
    raw_input: Optional[str] = Field(None, description="Original user text (never logged to AWS)")


class ProfileExtractRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="User's free-form input text")


class ProfileExtractResponse(BaseModel):
    profile: UserProfile
    correlation_id: str
