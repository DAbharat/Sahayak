"""
GovScheme Navigator — Unified Schemas Module
Re-exports all domain schemas for convenient single-import usage.
"""
from app.schemas.profile import (
    OccupationEnum,
    LanguageEnum,
    GenderEnum,
    UserProfile,
    ProfileExtractRequest,
    ProfileExtractResponse,
)
from app.schemas.scheme import (
    SchemeSource,
    SchemeRule,
    SchemeRecord,
    SchemeListResponse,
)
from app.schemas.eligibility import (
    EligibilityStatus,
    RuleResult,
    EligibilityResult,
    SchemeEvaluateRequest,
    SchemeEvaluateResponse,
)
from app.schemas.draft import (
    DraftType,
    DraftRequest,
    DraftResponse,
)
from app.schemas.voice import (
    TranscribeResponse,
    SynthesizeRequest,
    SynthesizeResponse,
)
from app.schemas.document import (
    ExtractedField,
    FieldCheckResult,
    DocumentExtractResponse,
)

__all__ = [
    "OccupationEnum",
    "LanguageEnum",
    "GenderEnum",
    "UserProfile",
    "ProfileExtractRequest",
    "ProfileExtractResponse",
    "SchemeSource",
    "SchemeRule",
    "SchemeRecord",
    "SchemeListResponse",
    "EligibilityStatus",
    "RuleResult",
    "EligibilityResult",
    "SchemeEvaluateRequest",
    "SchemeEvaluateResponse",
    "DraftType",
    "DraftRequest",
    "DraftResponse",
    "TranscribeResponse",
    "SynthesizeRequest",
    "SynthesizeResponse",
    "ExtractedField",
    "FieldCheckResult",
    "DocumentExtractResponse",
]
