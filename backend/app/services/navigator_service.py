"""
GovScheme Navigator — NavigatorService
Orchestration layer connecting Streamlit frontend and API to AI, Rules Engine, and AWS.
Supports Mock Mode and Live AWS Mode with session budget and safety guardrails.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from app.config import get_settings
from app.mock.mock_ai import (
    mock_extract_profile,
    mock_generate_explanation,
    mock_generate_draft,
    mock_transcribe_audio,
    mock_synthesize_speech,
    mock_extract_document,
)
from app.schemas.profile import UserProfile
from app.schemas.scheme import SchemeRecord
from app.schemas.eligibility import EligibilityResult
from app.schemas.draft import DraftResponse, DraftType
from app.schemas.voice import TranscribeResponse, SynthesizeResponse
from app.schemas.document import DocumentExtractResponse
from app.rules.engine import evaluate_profile, load_schemes, get_scheme_by_id

logger = logging.getLogger(__name__)


class BudgetExceededError(Exception):
    """Raised when the session AI request quota is exceeded."""
    pass


class NavigatorService:
    """
    Central service for GovScheme Navigator.
    Provides methods for all 6 application capabilities.
    """

    def __init__(self) -> None:
        self.settings = get_settings()
        self.bedrock_requests_count = 0
        self.schemes: List[SchemeRecord] = load_schemes()

    def reset_session_budget(self) -> None:
        """Reset request counters for the current session."""
        self.bedrock_requests_count = 0

    def get_budget_status(self) -> Dict[str, Any]:
        """Returns current session request usage and limit."""
        max_req = self.settings.max_bedrock_requests_per_session
        return {
            "requests_used": self.bedrock_requests_count,
            "requests_limit": max_req,
            "remaining": max(0, max_req - self.bedrock_requests_count),
            "budget_exhausted": self.bedrock_requests_count >= max_req,
        }

    def _check_and_increment_budget(self) -> None:
        max_req = self.settings.max_bedrock_requests_per_session
        if self.bedrock_requests_count >= max_req:
            raise BudgetExceededError(
                f"Session AI request limit ({max_req}) reached. "
                "Switch to Mock Mode or reset the session counter in the sidebar."
            )
        self.bedrock_requests_count += 1

    def get_all_schemes(self) -> List[SchemeRecord]:
        """Returns list of configured government schemes."""
        if not self.schemes:
            self.schemes = load_schemes()
        return self.schemes

    def get_scheme_by_id(self, scheme_id: str) -> Optional[SchemeRecord]:
        """Finds a scheme by ID."""
        try:
            return get_scheme_by_id(scheme_id)
        except Exception:
            return None

    # ── 1. Profile Extraction ─────────────────────────────────────────────────

    def extract_profile(self, text: str, mock_mode: bool = True) -> UserProfile:
        """
        Extracts structured UserProfile from natural language input.
        """
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty.")

        if mock_mode:
            return mock_extract_profile(text)

        self._check_and_increment_budget()
        from app.ai.profile_extractor import get_profile_extractor
        extractor = get_profile_extractor()
        return extractor.extract(text)

    # ── 2. Eligibility Evaluation (Deterministic Rules Engine) ─────────────────

    def check_eligibility(
        self,
        profile: UserProfile | Dict[str, Any],
        scheme_ids: Optional[List[str]] = None,
    ) -> List[EligibilityResult]:
        """
        Evaluates eligibility deterministically using the Rules Engine.
        This NEVER calls LLMs or AWS services (always 0 cost).
        """
        profile_dict = profile.model_dump() if hasattr(profile, "model_dump") else profile
        return evaluate_profile(profile_dict, scheme_ids=scheme_ids)

    # ── 3. Explanation Generation ─────────────────────────────────────────────

    def explain_result(
        self,
        profile: UserProfile,
        scheme: SchemeRecord,
        result: EligibilityResult,
        language: str = "hi",
        mock_mode: bool = True,
    ) -> str:
        """
        Generates simple multilingual explanation grounded in the rule results.
        """
        if mock_mode:
            return mock_generate_explanation(profile, scheme, result, language=language)

        self._check_and_increment_budget()
        from app.ai.explanation_generator import get_explanation_generator
        generator = get_explanation_generator()
        return generator.explain(profile, scheme, result, language=language)

    # ── 4. Draft Generation ───────────────────────────────────────────────────

    def generate_draft(
        self,
        user_text: str,
        draft_type: str = "application",
        language: str = "hi",
        scheme_name: Optional[str] = None,
        profile_context: Optional[dict] = None,
        mock_mode: bool = True,
    ) -> DraftResponse:
        """
        Generates an application or grievance letter with placeholders.
        """
        if not user_text or not user_text.strip():
            raise ValueError("Draft description text cannot be empty.")

        if mock_mode:
            return mock_generate_draft(
                user_text=user_text,
                draft_type=draft_type,
                language=language,
                scheme_name=scheme_name,
                profile_context=profile_context,
            )

        self._check_and_increment_budget()
        from app.ai.draft_generator import get_draft_generator
        from app.schemas.draft import DraftType
        generator = get_draft_generator()
        dt = DraftType(draft_type)
        return generator.generate(
            user_text=user_text,
            draft_type=dt,
            language=language,
            profile_context=profile_context,
            scheme_name=scheme_name,
        )

    # ── 5. Voice I/O (Transcribe & Polly) ──────────────────────────────────────

    def transcribe_audio(
        self,
        file_bytes: bytes,
        filename: str = "audio.wav",
        mock_mode: bool = True,
    ) -> TranscribeResponse:
        """
        Transcribes Hindi/English audio into text.
        """
        if not file_bytes:
            raise ValueError("Audio file content is empty.")

        # Check size guardrail
        max_bytes = self.settings.max_audio_size_mb * 1024 * 1024
        if len(file_bytes) > max_bytes:
            raise ValueError(
                f"Audio file exceeds maximum size of {self.settings.max_audio_size_mb} MB."
            )

        if mock_mode:
            return mock_transcribe_audio(file_bytes, filename)

        from app.aws.transcribe_service import get_transcribe_service
        service = get_transcribe_service()
        return service.transcribe(file_bytes, filename)

    def synthesize_speech(
        self,
        text: str,
        language: str = "hi",
        mock_mode: bool = True,
    ) -> SynthesizeResponse:
        """
        Synthesizes text into Hindi speech (MP3).
        """
        if not text or not text.strip():
            raise ValueError("Text for speech synthesis cannot be empty.")

        if mock_mode:
            return mock_synthesize_speech(text, language=language)

        from app.aws.polly_service import get_polly_service
        service = get_polly_service()
        return service.synthesize(text=text, language=language)

    # ── 6. Document OCR (Textract) ────────────────────────────────────────────

    def extract_document(
        self,
        file_bytes: bytes,
        filename: str = "doc.pdf",
        expected_fields: Optional[Dict[str, str]] = None,
        mock_mode: bool = True,
    ) -> DocumentExtractResponse:
        """
        Extracts key-value pairs and raw text from document image or PDF.
        Legibility verification only — NOT authenticity.
        """
        if not file_bytes:
            raise ValueError("Document file content is empty.")

        max_bytes = self.settings.max_document_size_mb * 1024 * 1024
        if len(file_bytes) > max_bytes:
            raise ValueError(
                f"Document exceeds maximum size of {self.settings.max_document_size_mb} MB."
            )

        if mock_mode:
            return mock_extract_document(file_bytes, filename, expected_fields)

        from app.aws.textract_service import get_textract_service
        service = get_textract_service()
        return service.extract_fields(file_bytes, filename, expected_fields)


_service_instance: Optional[NavigatorService] = None


def get_navigator_service() -> NavigatorService:
    """Returns singleton NavigatorService instance."""
    global _service_instance
    if _service_instance is None:
        _service_instance = NavigatorService()
    return _service_instance
