"""
GovScheme Navigator — Rules Engine Tests
Tests deterministic eligibility evaluation.
No LLM calls involved.
"""
from __future__ import annotations

import pytest

from app.rules.engine import evaluate_profile, evaluate_scheme, load_schemes
from app.rules.operators import (
    bool_equals,
    equals,
    evaluate_operator,
    greater_than,
    greater_than_or_equal,
    in_collection,
    less_than,
    less_than_or_equal,
    not_equals,
)
from app.schemas.eligibility import EligibilityStatus


# ── Operator Unit Tests ───────────────────────────────────────────────────────

class TestOperators:
    def test_equals_string_case_insensitive(self):
        assert equals("Haryana", "haryana") is True
        assert equals("Haryana", "Punjab") is False

    def test_not_equals(self):
        assert not_equals("Haryana", "Punjab") is True
        assert not_equals("Haryana", "Haryana") is False

    def test_less_than_passes(self):
        assert less_than(14999, 15000) is True

    def test_less_than_fails_at_boundary(self):
        assert less_than(15000, 15000) is False

    def test_less_than_or_equal_at_boundary(self):
        assert less_than_or_equal(15000, 15000) is True

    def test_less_than_or_equal_above_threshold(self):
        assert less_than_or_equal(15001, 15000) is False

    def test_greater_than_passes(self):
        assert greater_than(18, 17) is True

    def test_greater_than_fails_at_boundary(self):
        assert greater_than(18, 18) is False

    def test_greater_than_or_equal_at_boundary(self):
        assert greater_than_or_equal(18, 18) is True

    def test_in_collection(self):
        assert in_collection("street_vendor", ["street_vendor", "artisan"]) is True
        assert in_collection("doctor", ["street_vendor", "artisan"]) is False

    def test_in_collection_case_insensitive(self):
        assert in_collection("STREET_VENDOR", ["street_vendor"]) is True

    def test_bool_equals_true(self):
        assert bool_equals(True, True) is True
        assert bool_equals(False, False) is True

    def test_bool_equals_mismatch(self):
        assert bool_equals(True, False) is False
        assert bool_equals(False, True) is False

    def test_none_actual_always_false(self):
        assert less_than(None, 15000) is False
        assert greater_than(None, 0) is False
        assert in_collection(None, ["street_vendor"]) is False

    def test_unknown_operator_raises(self):
        with pytest.raises(ValueError, match="Unknown operator"):
            evaluate_operator("is_magic", "foo", "bar")


# ── Rules Engine Integration Tests ────────────────────────────────────────────

class TestRulesEngine:
    def test_street_vendor_eligible_for_svanidhi(self, street_vendor_profile_dict):
        """
        Scenario 1: Haryana street vendor, income 15000.
        PM SVANidhi requires street_vendor occupation + income ≤ 50000.
        Should be ELIGIBLE (income and occupation match, no income cap hit).
        But may be needs_more_information if other required fields are missing.
        """
        results = evaluate_profile(
            profile=street_vendor_profile_dict,
            scheme_ids=["pm_svanidhi"],
        )
        assert len(results) == 1
        result = results[0]
        assert result.scheme_id == "pm_svanidhi"
        # Income 15000 ≤ 50000, occupation = street_vendor → eligible
        # (no missing rules for these two fields)
        assert result.status in (EligibilityStatus.eligible, EligibilityStatus.needs_more_information)

    def test_street_vendor_is_eligible(self, street_vendor_profile_dict):
        """Explicitly check eligible for svanidhi with all required fields set."""
        results = evaluate_profile(
            profile=street_vendor_profile_dict,
            scheme_ids=["pm_svanidhi"],
        )
        result = results[0]
        # The two svanidhi rules check occupation and income — both present
        assert result.status == EligibilityStatus.eligible

    def test_high_income_not_eligible_for_pmay(self):
        """PMAY-U requires income ≤ 25000. High income → not_eligible."""
        profile = {
            "state": "Delhi",
            "occupation": "construction_worker",
            "monthly_income": 80000,  # Too high
            "income_currency": "INR",
            "documents_available": [],
            "missing_fields": [],
            "language": "en",
            "confidence": {},
        }
        results = evaluate_profile(profile=profile, scheme_ids=["pm_awas_yojana_urban"])
        assert results[0].status == EligibilityStatus.not_eligible
        assert any(r.field == "monthly_income" for r in results[0].failed_rules)

    def test_missing_income_needs_more_info(self):
        """Income is None → needs_more_information for income-dependent schemes."""
        profile = {
            "state": "UP",
            "occupation": "street_vendor",
            "monthly_income": None,  # Missing
            "income_currency": "INR",
            "documents_available": [],
            "missing_fields": ["monthly_income"],
            "language": "hi",
            "confidence": {},
        }
        results = evaluate_profile(profile=profile, scheme_ids=["pm_svanidhi"])
        assert results[0].status == EligibilityStatus.needs_more_information
        assert "monthly_income" in results[0].missing_information

    def test_unbanked_user_eligible_for_pmjdy(self, unbanked_profile_dict):
        """PMJDY requires has_bank_account = False. Unbanked user should be eligible."""
        results = evaluate_profile(
            profile=unbanked_profile_dict,
            scheme_ids=["pmjdy"],
        )
        assert results[0].status == EligibilityStatus.eligible

    def test_banked_user_not_eligible_for_pmjdy(self):
        """PMJDY: already has a bank account → not_eligible."""
        profile = {
            "state": "Bihar",
            "occupation": "daily_wage_worker",
            "monthly_income": 6000,
            "income_currency": "INR",
            "has_bank_account": True,  # Already banked
            "documents_available": [],
            "missing_fields": [],
            "language": "hi",
            "confidence": {},
        }
        results = evaluate_profile(profile=profile, scheme_ids=["pmjdy"])
        assert results[0].status == EligibilityStatus.not_eligible

    def test_artisan_above_18_eligible_vishwakarma(self):
        """PM Vishwakarma: artisan, age ≥ 18 → eligible."""
        profile = {
            "state": "Rajasthan",
            "occupation": "artisan",
            "monthly_income": 10000,
            "income_currency": "INR",
            "age": 30,
            "documents_available": [],
            "missing_fields": [],
            "language": "hi",
            "confidence": {},
        }
        results = evaluate_profile(profile=profile, scheme_ids=["pm_vishwakarma"])
        assert results[0].status == EligibilityStatus.eligible

    def test_artisan_under_18_not_eligible_vishwakarma(self):
        """PM Vishwakarma: artisan, age < 18 → not_eligible."""
        profile = {
            "state": "Rajasthan",
            "occupation": "artisan",
            "monthly_income": 10000,
            "income_currency": "INR",
            "age": 16,
            "documents_available": [],
            "missing_fields": [],
            "language": "hi",
            "confidence": {},
        }
        results = evaluate_profile(profile=profile, scheme_ids=["pm_vishwakarma"])
        assert results[0].status == EligibilityStatus.not_eligible

    def test_all_schemes_evaluated(self, street_vendor_profile_dict):
        """Evaluating without scheme_ids evaluates all 5 seeded schemes."""
        results = evaluate_profile(profile=street_vendor_profile_dict)
        assert len(results) == 5

    def test_result_includes_required_documents(self, street_vendor_profile_dict):
        """Each result must include required_documents from the scheme."""
        results = evaluate_profile(
            profile=street_vendor_profile_dict, scheme_ids=["pm_svanidhi"]
        )
        assert len(results[0].required_documents) > 0

    def test_result_includes_source_metadata(self, street_vendor_profile_dict):
        """Each result must include source URL and date."""
        results = evaluate_profile(
            profile=street_vendor_profile_dict, scheme_ids=["pm_svanidhi"]
        )
        assert results[0].source.url
        assert results[0].source.title
