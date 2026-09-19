package com.sahayak.scheme.ingestion;

import com.sahayak.scheme.domain.SourceType;

import java.time.Instant;

public record NormalizedDocument(
        SourceType sourceType,
        String sourceUrl,
        String title,
        String rawText,
        String checksum,
        Instant fetchedAt
) {
}
