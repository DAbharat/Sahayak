"""
GovScheme Navigator — Test Fixtures and Shared Mocks
All AWS clients are mocked — no live calls made in tests.
"""
from __future__ import annotations

import json
from typing import Any, Dict, Optional
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.ai.bedrock_client import BedrockClient
from app.main import app


# ── Fixture: mocked Bedrock client ────────────────────────────────────────────

class MockBedrockClient:
    """
    A mock BedrockClient that returns pre-configured responses.
    Allows simulating valid JSON, malformed JSON, and Bedrock errors.
    """

    def __init__(self, response_json: Optional[Dict[str, Any]] = None, raise_error: Optional[Exception] = None):
        self._response_json = response_json or {}
        self._raise_error = raise_error

    def converse(self, *, messages, system_prompt=None, temperature=None, max_tokens=None, correlation_id="") -> str:
        if self._raise_error:
            raise self._raise_error
        return json.dumps(self._response_json)

    def extract_json(self, *, messages, system_prompt=None, temperature=None, correlation_id="") -> Dict[str, Any]:
        if self._raise_error:
            raise self._raise_error
        return self._response_json


def make_mock_client(response_json: Optional[Dict[str, Any]] = None, raise_error: Optional[Exception] = None) -> MockBedrockClient:
    return MockBedrockClient(response_json=response_json, raise_error=raise_error)


# ── Common profile fixtures ───────────────────────────────────────────────────

@pytest.fixture
def hindi_profile_response():
    """Mocked Bedrock extraction response for Hindi street vendor input."""
    return {
        "state": "Haryana",
        "district": None,
        "occupation": "street_vendor",
        "monthly_income": 15000,
        "family_size": None,
        "children_count": None,
        "children_school_going": None,
        "age": None,
        "gender": None,
        "is_registered_worker": None,
        "caste_category": None,
        "has_bank_account": None,
        "documents_available": [],
        "missing_fields": ["age", "family_size", "has_bank_account"],
        "language": "hi",
        "confidence": {
            "state": 0.95,
            "occupation": 0.97,
            "monthly_income": 0.93
        }
    }


@pytest.fixture
def english_profile_response():
    """Mocked Bedrock extraction for English input."""
    return {
        "state": "Maharashtra",
        "district": "Pune",
        "occupation": "construction_worker",
        "monthly_income": 8000,
        "family_size": 4,
        "children_count": 2,
        "children_school_going": True,
        "age": 35,
        "gender": "male",
        "is_registered_worker": False,
        "caste_category": None,
        "has_bank_account": True,
        "documents_available": ["aadhaar", "voter_id"],
        "missing_fields": [],
        "language": "en",
        "confidence": {"state": 0.99, "occupation": 0.98, "monthly_income": 0.95}
    }


@pytest.fixture
def hinglish_profile_response():
    """Mocked Bedrock extraction for Hinglish input."""
    return {
        "state": "Delhi",
        "district": None,
        "occupation": "auto_driver",
        "monthly_income": 20000,
        "family_size": 3,
        "children_count": 1,
        "children_school_going": True,
        "age": 40,
        "gender": "male",
        "is_registered_worker": None,
        "caste_category": None,
        "has_bank_account": None,
        "documents_available": [],
        "missing_fields": ["has_bank_account", "is_registered_worker"],
        "language": "hinglish",
        "confidence": {"state": 0.9, "occupation": 0.95, "monthly_income": 0.88}
    }


@pytest.fixture
def missing_fields_profile_response():
    """Mocked response for a very incomplete input."""
    return {
        "state": None,
        "district": None,
        "occupation": "unknown",
        "monthly_income": None,
        "family_size": None,
        "children_count": None,
        "children_school_going": None,
        "age": None,
        "gender": None,
        "is_registered_worker": None,
        "caste_category": None,
        "has_bank_account": None,
        "documents_available": [],
        "missing_fields": ["state", "occupation", "monthly_income", "age", "gender", "family_size"],
        "language": "hi",
        "confidence": {}
    }


# ── API Test Client ───────────────────────────────────────────────────────────

@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)


# ── Sample profiles for rules engine tests ────────────────────────────────────

@pytest.fixture
def street_vendor_profile_dict():
    return {
        "state": "Haryana",
        "district": None,
        "occupation": "street_vendor",
        "monthly_income": 15000,
        "income_currency": "INR",
        "family_size": None,
        "children_count": None,
        "children_school_going": None,
        "age": None,
        "gender": None,
        "is_registered_worker": None,
        "caste_category": None,
        "has_bank_account": None,
        "documents_available": [],
        "missing_fields": [],
        "language": "hi",
        "confidence": {},
        "raw_input": None,
    }


@pytest.fixture
def unbanked_profile_dict():
    return {
        "state": "Bihar",
        "district": None,
        "occupation": "daily_wage_worker",
        "monthly_income": 6000,
        "income_currency": "INR",
        "family_size": 5,
        "children_count": 3,
        "children_school_going": True,
        "age": 30,
        "gender": "female",
        "is_registered_worker": False,
        "caste_category": None,
        "has_bank_account": False,
        "documents_available": [],
        "missing_fields": [],
        "language": "hi",
        "confidence": {},
        "raw_input": None,
    }
