package com.sahayak.scheme.dto;

import com.sahayak.scheme.domain.ReviewStatus;
import com.sahayak.scheme.domain.RuleOperator;
import com.sahayak.scheme.domain.RuleValueType;

import java.math.BigDecimal;

public record RuleResponse(
        Long id,
        String field,
        RuleOperator operator,
        String value,
        RuleValueType valueType,
        String rawTextSpan,
        BigDecimal confidence,
        ReviewStatus reviewStatus,
        boolean resolved
) {
}
