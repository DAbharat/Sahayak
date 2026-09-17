"""
GovScheme Navigator — Draft Generation Tests
Validates that drafts:
1. Do not fabricate user facts
2. Contain [PLACEHOLDER] markers for missing info
3. Correctly differentiate grievance vs application
"""
from __future__ import annotations

import re

import pytest

from app.ai.draft_generator import generate_draft
from app.schemas.draft import DraftRequest, DraftType
from tests.conftest import make_mock_client


GRIEVANCE_MOCK_RESPONSE = {
    "subject": "Grievance Regarding PM SVANidhi Loan",
    "body": (
        "To,\nThe Competent Authority,\n[DEPARTMENT_NAME]\n[DISTRICT], [STATE]\n\n"
        "Subject: Grievance regarding PM SVANidhi\n\n"
        "Respected Sir/Madam,\n\n"
        "I, [APPLICANT_NAME], wish to bring to your attention that my scheme payment "
        "has not arrived for three months.\n\n"
        "Requested action: Please investigate and process the pending payment.\n\n"
        "Thanking you,\n[APPLICANT_NAME]\n[DATE]\nContact: [PHONE_NUMBER]"
    ),
    "placeholders": ["DEPARTMENT_NAME", "DISTRICT", "STATE", "APPLICANT_NAME", "DATE", "PHONE_NUMBER"],
}

APPLICATION_MOCK_RESPONSE = {
    "subject": "Application for PM SVANidhi Scheme",
    "body": (
        "To,\nThe Competent Authority,\n[DEPARTMENT_NAME]\n[DISTRICT], [STATE]\n\n"
        "Subject: Application for PM SVANidhi\n\n"
        "Respected Sir/Madam,\n\n"
        "I, [APPLICANT_NAME], a street vendor residing in [VILLAGE/WARD], "
        "Haryana, respectfully apply for the PM SVANidhi scheme.\n\n"
        "Monthly income: ₹15,000\n\n"
        "Thanking you,\n[APPLICANT_NAME]\n[DATE]"
    ),
    "placeholders": ["DEPARTMENT_NAME", "DISTRICT", "STATE", "APPLICANT_NAME", "VILLAGE/WARD", "DATE"],
}


class TestGrievanceDraft:
    def test_grievance_draft_has_subject_and_body(self):
        client = make_mock_client(response_json=GRIEVANCE_MOCK_RESPONSE)
        request = DraftRequest(
            user_text="मेरी योजना का पैसा तीन महीने से नहीं आया।",
            draft_type=DraftType.grievance,
            language="hi",
        )
        result = generate_draft(request=request, client=client)

        assert result.subject
        assert result.body
        assert result.draft_type == DraftType.grievance

    def test_grievance_has_placeholders_for_missing_info(self):
        """Missing info must be marked as [PLACEHOLDER], not fabricated."""
        client = make_mock_client(response_json=GRIEVANCE_MOCK_RESPONSE)
        request = DraftRequest(
            user_text="मेरी योजना का पैसा तीन महीने से नहीं आया।",
            draft_type=DraftType.grievance,
            language="hi",
        )
        result = generate_draft(request=request, client=client)

        # Body should have placeholders
        assert len(result.placeholders) > 0
        # Verify placeholders exist in body
        for ph in result.placeholders:
            assert f"[{ph}]" in result.body or ph in result.body

    def test_grievance_no_fabricated_ids(self):
        """Draft must not contain any fabricated application/payment IDs."""
        client = make_mock_client(response_json=GRIEVANCE_MOCK_RESPONSE)
        request = DraftRequest(
            user_text="मेरी योजना का पैसा तीन महीने से नहीं आया।",
            draft_type=DraftType.grievance,
            language="hi",
        )
        result = generate_draft(request=request, client=client)

        # The body should not contain patterns like fake Aadhaar numbers (12 digits)
        assert not re.search(r"\b\d{12}\b", result.body), "Draft contains what looks like an Aadhaar number"
        # No fake application IDs
        assert not re.search(r"APP\d+", result.body), "Draft contains a fabricated application ID"

    def test_grievance_includes_disclaimer(self):
        """Every draft must have a disclaimer."""
        client = make_mock_client(response_json=GRIEVANCE_MOCK_RESPONSE)
        request = DraftRequest(
            user_text="मेरी योजना का पैसा नहीं आया।",
            draft_type=DraftType.grievance,
            language="hi",
        )
        result = generate_draft(request=request, client=client)
        assert result.disclaimer
        assert len(result.disclaimer) > 10


class TestApplicationDraft:
    def test_application_draft_type_correct(self):
        client = make_mock_client(response_json=APPLICATION_MOCK_RESPONSE)
        request = DraftRequest(
            user_text="मैं PM SVANidhi के लिए आवेदन करना चाहता हूँ।",
            draft_type=DraftType.application,
            language="hi",
            scheme_name="PM SVANidhi",
        )
        result = generate_draft(request=request, client=client)
        assert result.draft_type == DraftType.application

    def test_application_does_not_invent_income(self):
        """
        If income is NOT in the user_text, the draft must not include a specific income figure.
        (In this test the mock includes income from context — verify it came from profile_context)
        """
        # No profile_context, no income in text
        client = make_mock_client(
            response_json={
                "subject": "Application for PM SVANidhi",
                "body": "I, [APPLICANT_NAME], apply for PM SVANidhi.\nIncome: [MONTHLY_INCOME]",
                "placeholders": ["APPLICANT_NAME", "MONTHLY_INCOME"],
            }
        )
        request = DraftRequest(
            user_text="मुझे योजना के लिए आवेदन करना है।",
            draft_type=DraftType.application,
            language="hi",
        )
        result = generate_draft(request=request, client=client)
        # Income should be a placeholder, not a fabricated number
        assert "[MONTHLY_INCOME]" in result.body or "MONTHLY_INCOME" in result.placeholders

    def test_only_known_info_in_draft(self):
        """
        If scheme_name is NOT provided, the draft must not invent a scheme name.
        """
        client = make_mock_client(
            response_json={
                "subject": "Application for Government Scheme",
                "body": "I apply for [SCHEME_NAME] scheme.",
                "placeholders": ["SCHEME_NAME"],
            }
        )
        request = DraftRequest(
            user_text="मुझे किसी योजना के लिए आवेदन करना है।",
            draft_type=DraftType.application,
            language="hi",
            scheme_name=None,  # Not known
        )
        result = generate_draft(request=request, client=client)
        assert "SCHEME_NAME" in result.placeholders


class TestFallbackDraft:
    """Test that fallback drafts work when Bedrock is unavailable."""

    def test_fallback_grievance_when_bedrock_fails(self):
        from app.core.errors import BedrockInvocationError
        client = make_mock_client(raise_error=BedrockInvocationError("mock error"))
        request = DraftRequest(
            user_text="पैसा नहीं आया।",
            draft_type=DraftType.grievance,
            language="hi",
        )
        # Should not raise — should return fallback draft
        result = generate_draft(request=request, client=client)
        assert result.subject
        assert result.body
        assert "[APPLICANT_NAME]" in result.body
