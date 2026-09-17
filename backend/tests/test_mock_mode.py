"""
Unit tests for NavigatorService in Mock Mode.
Verifies all 6 features operate offline without any AWS calls.
"""
from __future__ import annotations

import pytest

from app.services.navigator_service import NavigatorService, BudgetExceededError
from app.schemas.profile import OccupationEnum, LanguageEnum, UserProfile
from app.schemas.eligibility import EligibilityStatus
from app.schemas.draft import DraftType


@pytest.fixture
def nav_service() -> NavigatorService:
    return NavigatorService()


def test_mock_profile_extraction(nav_service: NavigatorService):
    text = "Mera naam Ramesh hai, Delhi me fruit thela lagata hu, monthly income 8000 rupaye hai. Aadhaar card hai."
    profile = nav_service.extract_profile(text, mock_mode=True)

    assert isinstance(profile, UserProfile)
    assert profile.occupation == OccupationEnum.street_vendor
    assert profile.monthly_income == 8000.0
    assert profile.state == "Delhi"
    assert "Aadhaar Card" in profile.documents_available
    assert nav_service.bedrock_requests_count == 0  # 0 AWS calls made


def test_deterministic_eligibility_check(nav_service: NavigatorService):
    profile = UserProfile(
        occupation=OccupationEnum.street_vendor,
        monthly_income=8000.0,
        state="Delhi",
        has_bank_account=True,
    )
    results = nav_service.check_eligibility(profile)

    assert len(results) > 0
    # PM SVANidhi should match a street vendor
    svanidhi = next((r for r in results if r.scheme_id == "pm_svanidhi"), None)
    assert svanidhi is not None
    assert svanidhi.status == EligibilityStatus.eligible


def test_mock_explanation(nav_service: NavigatorService):
    profile = UserProfile(
        occupation=OccupationEnum.street_vendor,
        monthly_income=8000.0,
        state="Delhi",
    )
    results = nav_service.check_eligibility(profile)
    svanidhi_res = next(r for r in results if r.scheme_id == "pm_svanidhi")
    svanidhi_scheme = nav_service.get_scheme_by_id("pm_svanidhi")
    assert svanidhi_scheme is not None

    explanation_hi = nav_service.explain_result(
        profile=profile,
        scheme=svanidhi_scheme,
        result=svanidhi_res,
        language="hi",
        mock_mode=True,
    )
    assert "पात्र" in explanation_hi or "योजना" in explanation_hi
    assert nav_service.bedrock_requests_count == 0

    explanation_en = nav_service.explain_result(
        profile=profile,
        scheme=svanidhi_scheme,
        result=svanidhi_res,
        language="en",
        mock_mode=True,
    )
    assert "eligible" in explanation_en.lower()


def test_mock_draft_generation(nav_service: NavigatorService):
    user_text = "Mera PM SVANidhi loan 3 mahine se pending hai aur bank se koi response nahi aaya."
    draft = nav_service.generate_draft(
        user_text=user_text,
        draft_type="grievance",
        language="hi",
        scheme_name="PM SVANidhi",
        mock_mode=True,
    )
    assert draft.draft_type == DraftType.grievance
    assert "[APPLICANT_NAME]" in draft.placeholders
    assert "[APPLICANT_NAME]" in draft.body
    assert "PM SVANidhi" in draft.subject
    assert nav_service.bedrock_requests_count == 0


def test_mock_voice_transcribe(nav_service: NavigatorService):
    dummy_audio = b"\x00\x01\x02\x03" * 100
    res = nav_service.transcribe_audio(dummy_audio, filename="test.wav", mock_mode=True)
    assert res.transcript is not None
    assert len(res.transcript) > 10
    assert res.confidence is not None
    assert res.confidence > 0.8


def test_mock_voice_synthesize(nav_service: NavigatorService):
    text = "आपकी पात्रता की पुष्टि हो गई है।"
    res = nav_service.synthesize_speech(text, language="hi", mock_mode=True)
    assert res.synthesis_succeeded is True
    assert res.text_fallback == text
    assert res.audio_base64 is not None


def test_mock_document_extraction(nav_service: NavigatorService):
    dummy_doc = b"%PDF-1.4 dummy content"
    expected = {"Name": "RAMESH KUMAR"}
    res = nav_service.extract_document(
        dummy_doc,
        filename="aadhaar.pdf",
        expected_fields=expected,
        mock_mode=True,
    )
    assert len(res.key_value_pairs) > 0
    assert "authenticity" in res.authenticity_disclaimer.lower()
    assert len(res.field_checks) == 1
    assert res.field_checks[0].legibility_match is True


def test_session_budget_enforcement(nav_service: NavigatorService):
    nav_service.settings.max_bedrock_requests_per_session = 2
    nav_service.reset_session_budget()

    status = nav_service.get_budget_status()
    assert status["requests_used"] == 0
    assert status["requests_limit"] == 2
    assert status["budget_exhausted"] is False
