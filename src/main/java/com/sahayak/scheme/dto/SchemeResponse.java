package com.sahayak.scheme.dto;

import com.sahayak.scheme.domain.ReviewStatus;
import com.sahayak.scheme.domain.SchemeStatus;
import com.sahayak.scheme.domain.SourceType;

import java.time.LocalDate;

public record SchemeResponse(
        Long id,
        String name,
        String description,
        String source,
        SourceType sourceType,
        String sourceUrl,
        LocalDate lastVerified,
        SchemeStatus status,
        ReviewStatus reviewStatus
) {
}
