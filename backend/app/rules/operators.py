"""
GovScheme Navigator — Rules Engine Operators
Pure, testable comparison functions. NO LLM calls.
All operators return bool.
"""
from __future__ import annotations

from typing import Any, Collection


def equals(actual: Any, expected: Any) -> bool:
    """Exact equality check. Case-insensitive for strings."""
    if isinstance(actual, str) and isinstance(expected, str):
        return actual.strip().lower() == expected.strip().lower()
    return actual == expected


def not_equals(actual: Any, expected: Any) -> bool:
    return not equals(actual, expected)


def less_than(actual: Any, expected: Any) -> bool:
    """actual < expected. Returns False if actual is None."""
    if actual is None:
        return False
    try:
        return float(actual) < float(expected)
    except (TypeError, ValueError):
        return False


def less_than_or_equal(actual: Any, expected: Any) -> bool:
    """actual <= expected. Returns False if actual is None."""
    if actual is None:
        return False
    try:
        return float(actual) <= float(expected)
    except (TypeError, ValueError):
        return False


def greater_than(actual: Any, expected: Any) -> bool:
    """actual > expected. Returns False if actual is None."""
    if actual is None:
        return False
    try:
        return float(actual) > float(expected)
    except (TypeError, ValueError):
        return False


def greater_than_or_equal(actual: Any, expected: Any) -> bool:
    """actual >= expected. Returns False if actual is None."""
    if actual is None:
        return False
    try:
        return float(actual) >= float(expected)
    except (TypeError, ValueError):
        return False


def in_collection(actual: Any, expected: Collection) -> bool:
    """Check if actual value is in the expected collection."""
    if actual is None:
        return False
    if isinstance(actual, str):
        return actual.strip().lower() in {
            str(v).strip().lower() for v in expected
        }
    return actual in expected


def bool_equals(actual: Any, expected: Any) -> bool:
    """Boolean equality check. Coerces truthy/falsy values."""
    if actual is None:
        return False
    actual_bool = bool(actual)
    expected_bool = bool(expected)
    return actual_bool == expected_bool


# Operator registry — maps string operator names to functions
OPERATOR_MAP = {
    "equals": equals,
    "not_equals": not_equals,
    "lt": less_than,
    "lte": less_than_or_equal,
    "gt": greater_than,
    "gte": greater_than_or_equal,
    "less_than": less_than,
    "less_than_or_equal": less_than_or_equal,
    "greater_than": greater_than,
    "greater_than_or_equal": greater_than_or_equal,
    "in": in_collection,
    "bool_equals": bool_equals,
}


def evaluate_operator(operator: str, actual: Any, expected: Any) -> bool:
    """
    Evaluate a named operator.

    Args:
        operator: One of the operator names in OPERATOR_MAP
        actual: Value from the user profile
        expected: Target value from the rule

    Returns:
        True if the rule passes, False otherwise

    Raises:
        ValueError: If the operator is not recognized
    """
    fn = OPERATOR_MAP.get(operator)
    if fn is None:
        raise ValueError(
            f"Unknown operator '{operator}'. Valid operators: {list(OPERATOR_MAP.keys())}"
        )
    return fn(actual, expected)
