"""
GovScheme Navigator — API Integration Tests
Tests HTTP endpoints via FastAPI TestClient.
All Bedrock/AWS calls are mocked via dependency overrides.
"""
from __future__ import annotations

import json
from typing import Any, Dict
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


# ── Health Check ──────────────────────────────────────────────────────────────

class TestHealthEndpoint:
    def test_health_returns_200(self):
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_response_body(self):
        response = client.get("/health")
        data = response.json()
        assert data["status"] == "ok"
        assert "GovScheme" in data["service"]

    def test_health_no_auth_required(self):
        """Health endpoint is public — no auth required."""
        response = client.get("/health")
        assert response.status_code != 401
        assert response.status_code != 403


# ── Validation Errors ─────────────────────────────────────────────────────────

class TestValidationErrors:
    def test_profile_extract_empty_text_rejected(self):
        """Empty text field should return 422 validation error."""
        response = client.post(
            "/api/profile/extract",
            json={"text": ""},
        )
        assert response.status_code == 422

    def test_profile_extract_text_too_long_rejected(self):
        """Text exceeding 5000 chars should return 422."""
        response = client.post(
            "/api/profile/extract",
            json={"text": "x" * 5001},
        )
        assert response.status_code == 422

    def test_synthesize_empty_text_rejected(self):
        response = client.post(
            "/api/voice/synthesize",
            json={"text": ""},
        )
        assert response.status_code == 422

    def test_draft_empty_text_rejected(self):
        response = client.post(
            "/api/drafts/grievance",
            json={"user_text": ""},
        )
        assert response.status_code == 422


# ── Scheme List ───────────────────────────────────────────────────────────────

class TestSchemeList:
    def test_scheme_list_returns_schemes(self):
        response = client.get("/api/schemes/list")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] > 0
        assert len(data["schemes"]) > 0

    def test_scheme_list_has_source_metadata(self):
        """Every scheme must include source URL and title."""
        response = client.get("/api/schemes/list")
        schemes = response.json()["schemes"]
        for scheme in schemes:
            assert scheme["source"]["url"]
            assert scheme["source"]["title"]
            assert scheme["source"]["version_or_checked_date"]

    def test_scheme_list_has_required_documents(self):
        """Every scheme must list required documents."""
        response = client.get("/api/schemes/list")
        schemes = response.json()["schemes"]
        for scheme in schemes:
            assert len(scheme["required_documents"]) > 0


# ── Scheme Evaluation (deterministic, no mock needed) ─────────────────────────

class TestSchemeEvaluation:
    def test_evaluate_street_vendor_profile(self, street_vendor_profile_dict):
        response = client.post(
            "/api/schemes/evaluate",
            json={
                "profile": street_vendor_profile_dict,
                "scheme_ids": ["pm_svanidhi"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["results"][0]["scheme_id"] == "pm_svanidhi"

    def test_evaluate_returns_correlation_id(self, street_vendor_profile_dict):
        response = client.post(
            "/api/schemes/evaluate",
            json={"profile": street_vendor_profile_dict},
        )
        assert response.status_code == 200
        assert response.json()["correlation_id"]

    def test_evaluate_high_income_not_eligible_pmay(self):
        profile = {
            "state": "Delhi",
            "occupation": "construction_worker",
            "monthly_income": 100000,
            "income_currency": "INR",
            "documents_available": [],
            "missing_fields": [],
            "language": "en",
            "confidence": {},
        }
        response = client.post(
            "/api/schemes/evaluate",
            json={"profile": profile, "scheme_ids": ["pm_awas_yojana_urban"]},
        )
        assert response.status_code == 200
        result = response.json()["results"][0]
        assert result["status"] == "not_eligible"


# ── Profile Extraction (mocked Bedrock) ───────────────────────────────────────

class TestProfileExtractEndpoint:
    def test_profile_extract_with_mocked_bedrock(self, hindi_profile_response):
        """Verify the endpoint calls Bedrock and returns a profile."""
        from tests.conftest import make_mock_client
        from app.api.routes_profile import get_bedrock_client

        mock_client = make_mock_client(response_json=hindi_profile_response)

        # Override the FastAPI dependency with our mock
        app.dependency_overrides[get_bedrock_client] = lambda: mock_client
        try:
            response = client.post(
                "/api/profile/extract",
                json={"text": "मैं हरियाणा में रेहड़ी लगाता हूँ और पंद्रह हजार रुपये कमाता हूँ।"},
            )
        finally:
            app.dependency_overrides.clear()

        assert response.status_code == 200
        data = response.json()
        assert data["profile"]["state"] == "Haryana"
        assert data["profile"]["occupation"] == "street_vendor"
        assert data["profile"]["monthly_income"] == 15000
        assert data["correlation_id"]


# ── API Docs ──────────────────────────────────────────────────────────────────

class TestDocs:
    def test_openapi_docs_accessible(self):
        response = client.get("/docs")
        assert response.status_code == 200

    def test_openapi_json_accessible(self):
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert data["info"]["title"]
        # Verify all expected paths exist
        paths = data["paths"]
        expected_paths = [
            "/health",
            "/api/profile/extract",
            "/api/schemes/list",
            "/api/schemes/evaluate",
            "/api/explanation",
            "/api/drafts/grievance",
            "/api/drafts/application",
            "/api/voice/transcribe",
            "/api/voice/synthesize",
            "/api/documents/extract",
        ]
        for path in expected_paths:
            assert path in paths, f"Expected API path '{path}' not found in OpenAPI schema"
