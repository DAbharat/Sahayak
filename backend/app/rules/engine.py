"""
GovScheme Navigator — Deterministic Rules Engine
Evaluates user profiles against scheme eligibility rules.

CRITICAL: This engine is the single source of truth for eligibility.
The LLM MUST NOT override this result.
"""
from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.core.errors import RuleEvaluationError, SchemeNotFoundError
from app.core.logging import get_logger
from app.rules.operators import evaluate_operator
from app.schemas.eligibility import EligibilityResult, EligibilityStatus, RuleResult
from app.schemas.scheme import SchemeRecord, SchemeRule

logger = get_logger(__name__)

_SCHEMES_FILE = Path(__file__).parent / "schemes.json"


@lru_cache(maxsize=1)
def load_schemes() -> List[SchemeRecord]:
    """Load scheme definitions from JSON file. Cached after first load."""
    if not _SCHEMES_FILE.exists():
        raise RuleEvaluationError(f"Schemes file not found: {_SCHEMES_FILE}")

    with open(_SCHEMES_FILE, encoding="utf-8") as f:
        raw = json.load(f)

    schemes = [SchemeRecord(**s) for s in raw]
    logger.info("Schemes loaded", extra={"count": len(schemes)})
    return schemes


def get_scheme_by_id(scheme_id: str) -> SchemeRecord:
    """Fetch a single scheme by ID."""
    for scheme in load_schemes():
        if scheme.scheme_id == scheme_id:
            return scheme
    raise SchemeNotFoundError(f"Scheme '{scheme_id}' not found")


def evaluate_profile(
    profile: Dict[str, Any],
    scheme_ids: Optional[List[str]] = None,
    correlation_id: str = "",
) -> List[EligibilityResult]:
    """
    Evaluate a user profile against one or all schemes.

    Args:
        profile: UserProfile as a dict (from .model_dump())
        scheme_ids: If None, evaluate all schemes
        correlation_id: Request trace ID

    Returns:
        List of EligibilityResult, one per evaluated scheme

    Raises:
        RuleEvaluationError: If scheme data is malformed
    """
    schemes = load_schemes()
    if scheme_ids:
        schemes = [s for s in schemes if s.scheme_id in scheme_ids]

    results = []
    for scheme in schemes:
        result = evaluate_scheme(profile, scheme, correlation_id=correlation_id)
        results.append(result)

    logger.info(
        "Profile evaluation complete",
        extra={
            "correlation_id": correlation_id,
            "schemes_evaluated": len(results),
            "eligible": sum(1 for r in results if r.status == EligibilityStatus.eligible),
        },
    )
    return results


def evaluate_scheme(
    profile: Dict[str, Any],
    scheme: SchemeRecord,
    correlation_id: str = "",
) -> EligibilityResult:
    """
    Evaluate a single scheme against the user profile.

    Rules:
    - Each rule is evaluated independently.
    - A None actual value for a required field → needs_more_information.
    - Any failed rule → not_eligible.
    - All rules pass → eligible.
    """
    matched_rules: List[RuleResult] = []
    failed_rules: List[RuleResult] = []
    missing_information: List[str] = []

    try:
        for rule in scheme.rules:
            rule_result = _evaluate_rule(profile, rule, correlation_id)

            # Check for missing information
            actual_val = _get_profile_value(profile, rule.field)
            if actual_val is None:
                missing_information.append(rule.field)
                continue

            if rule_result.passed:
                matched_rules.append(rule_result)
            else:
                failed_rules.append(rule_result)

    except ValueError as exc:
        raise RuleEvaluationError(
            f"Rule evaluation error for scheme '{scheme.scheme_id}': {exc}"
        ) from exc

    # Determine status
    if missing_information:
        status = EligibilityStatus.needs_more_information
    elif failed_rules:
        status = EligibilityStatus.not_eligible
    else:
        status = EligibilityStatus.eligible

    return EligibilityResult(
        scheme_id=scheme.scheme_id,
        scheme_name_en=scheme.name_en,
        scheme_name_hi=scheme.name_hi,
        status=status,
        matched_rules=matched_rules,
        failed_rules=failed_rules,
        missing_information=missing_information,
        required_documents=scheme.required_documents,
        source=scheme.source,
    )


def _evaluate_rule(
    profile: Dict[str, Any], rule: SchemeRule, correlation_id: str
) -> RuleResult:
    """Evaluate a single rule against the profile."""
    actual = _get_profile_value(profile, rule.field)

    passed = False
    if actual is not None:
        try:
            passed = evaluate_operator(rule.operator, actual, rule.value)
        except ValueError as exc:
            raise RuleEvaluationError(str(exc)) from exc

    return RuleResult(
        field=rule.field,
        operator=rule.operator,
        expected_value=rule.value,
        actual_value=actual,
        passed=passed,
        description=rule.description,
    )


def _get_profile_value(profile: Dict[str, Any], field: str) -> Any:
    """
    Get a field value from a profile dict.
    Supports simple field names and nested lookups via dot notation.
    For enum fields, returns the .value string.
    """
    # Dot notation support (e.g., "address.state")
    parts = field.split(".")
    val = profile
    for part in parts:
        if isinstance(val, dict):
            val = val.get(part)
        else:
            return None
        if val is None:
            return None

    # Handle Pydantic enum values stored as strings with .value suffix
    if hasattr(val, "value"):
        return val.value
    return val
