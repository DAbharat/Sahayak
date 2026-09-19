package com.sahayak.scheme.dto;

import com.sahayak.scheme.domain.SourceType;

import java.time.LocalDate;

public record SourceMetadataResponse(
        String source,
        SourceType sourceType,
        String sourceUrl,
        LocalDate lastVerified
) {
}
