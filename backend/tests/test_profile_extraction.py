"""
GovScheme Navigator — Profile Extraction Tests
Tests NLU extraction for Hindi, Hinglish, English, missing fields, and malformed JSON.
All Bedrock calls are mocked.
"""
from __future__ import annotations

import json

import pytest

from app.ai.profile_extractor import extract_profile
from app.core.errors import AIExtractionError, InvalidModelOutputError
from tests.conftest import MockBedrockClient, make_mock_client


class TestHindiExtraction:
    """Scenario 1: Hindi input — extract state, occupation, income."""

    def test_hindi_street_vendor_basic(self, hindi_profile_response):
        """
        मैं हरियाणा में रेहड़ी लगाता हूँ और पंद्रह हजार रुपये कमाता हूँ।
        Expected: state=Haryana, occupation=street_vendor, monthly_income=15000
        """
        client = make_mock_client(response_json=hindi_profile_response)
        profile = extract_profile(
            text="मैं हरियाणा में रेहड़ी लगाता हूँ और पंद्रह हजार रुपये कमाता हूँ।",
            client=client,
        )

        assert profile.state == "Haryana"
        assert profile.occupation.value == "street_vendor"
        assert profile.monthly_income == 15000
        assert profile.language.value == "hi"

    def test_hindi_missing_fields_populated(self, hindi_profile_response):
        """Missing fields list should contain what couldn't be extracted."""
        client = make_mock_client(response_json=hindi_profile_response)
        profile = extract_profile(
            text="मैं हरियाणा में रेहड़ी लगाता हूँ और पंद्रह हजार रुपये कमाता हूँ।",
            client=client,
        )
        # Profile should have missing fields populated
        assert isinstance(profile.missing_fields, list)
        assert len(profile.missing_fields) > 0

    def test_hindi_no_fabricated_facts(self, hindi_profile_response):
        """Values not in the text must be None — not invented."""
        client = make_mock_client(response_json=hindi_profile_response)
        profile = extract_profile(
            text="मैं हरियाणा में रेहड़ी लगाता हूँ और पंद्रह हजार रुपये कमाता हूँ।",
            client=client,
        )
        # Fields not mentioned in text
        assert profile.district is None
        assert profile.family_size is None
        assert profile.age is None


class TestHinglishExtraction:
    """Hinglish input test."""

    def test_hinglish_auto_driver(self, hinglish_profile_response):
        """Delhi mein auto chalata hoon aur 20,000 earn karta hoon."""
        client = make_mock_client(response_json=hinglish_profile_response)
        profile = extract_profile(
            text="Delhi mein auto chalata hoon aur 20,000 earn karta hoon.",
            client=client,
        )
        assert profile.occupation.value == "auto_driver"
        assert profile.language.value == "hinglish"
        assert profile.monthly_income == 20000

    def test_hinglish_state_extracted(self, hinglish_profile_response):
        client = make_mock_client(response_json=hinglish_profile_response)
        profile = extract_profile(
            text="Delhi mein auto chalata hoon.", client=client
        )
        assert profile.state == "Delhi"


class TestEnglishExtraction:
    """English input test."""

    def test_english_construction_worker(self, english_profile_response):
        client = make_mock_client(response_json=english_profile_response)
        profile = extract_profile(
            text="I am a construction worker in Pune, Maharashtra, earning ₹8000 per month.",
            client=client,
        )
        assert profile.occupation.value == "construction_worker"
        assert profile.state == "Maharashtra"
        assert profile.monthly_income == 8000
        assert profile.language.value == "en"

    def test_english_bank_account_extracted(self, english_profile_response):
        client = make_mock_client(response_json=english_profile_response)
        profile = extract_profile(
            text="I have a bank account and aadhaar card.", client=client
        )
        assert profile.has_bank_account is True
        assert "aadhaar" in profile.documents_available


class TestMissingFields:
    """Very incomplete input — must not fabricate, must list missing fields."""

    def test_highly_incomplete_input(self, missing_fields_profile_response):
        """Single word input — nearly all fields should be missing."""
        client = make_mock_client(response_json=missing_fields_profile_response)
        profile = extract_profile(text="मजदूर", client=client)
        # Should identify many missing fields
        assert len(profile.missing_fields) >= 4
        # Should not fabricate income
        assert profile.monthly_income is None
        assert profile.state is None

    def test_occupation_defaults_to_unknown_when_not_mentioned(self, missing_fields_profile_response):
        client = make_mock_client(response_json=missing_fields_profile_response)
        profile = extract_profile(text="नमस्ते", client=client)
        assert profile.occupation.value == "unknown"


class TestMalformedLLMOutput:
    """Tests for robust handling of malformed Bedrock JSON."""

    def test_malformed_json_raises_ai_extraction_error(self):
        """If Bedrock returns garbage JSON, AIExtractionError must be raised."""

        class MalformedMockClient:
            def extract_json(self, **kwargs):
                from app.core.errors import InvalidModelOutputError
                raise InvalidModelOutputError("Cannot parse JSON")

            def converse(self, **kwargs):
                return "This is not JSON at all!"

        with pytest.raises(AIExtractionError):
            extract_profile(text="test input", client=MalformedMockClient())

    def test_empty_json_object_uses_defaults(self):
        """Empty JSON {} should produce a profile with all-None fields and unknown occupation."""
        client = make_mock_client(response_json={})
        profile = extract_profile(text="test", client=client)
        assert profile.state is None
        assert profile.monthly_income is None
        assert profile.occupation.value == "unknown"

    def test_invalid_occupation_falls_back_to_unknown(self):
        """Invalid occupation string should default to 'unknown'."""
        client = make_mock_client(
            response_json={
                "occupation": "इलेक्ट्रीशियन",  # Not in enum
                "state": "UP",
                "language": "hi",
                "monthly_income": None,
                "documents_available": [],
                "missing_fields": [],
                "confidence": {},
            }
        )
        profile = extract_profile(text="main electrician hoon", client=client)
        assert profile.occupation.value == "unknown"
