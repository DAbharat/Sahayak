package com.sahayak.scheme.normalization;

import com.sahayak.scheme.domain.RuleOperator;
import com.sahayak.scheme.domain.RuleValueType;

import java.math.BigDecimal;

public record ExtractedRule(
        String field,
        RuleOperator operator,
        String value,
        RuleValueType valueType,
        String rawTextSpan,
        BigDecimal confidence,
        boolean resolved
) {
}
