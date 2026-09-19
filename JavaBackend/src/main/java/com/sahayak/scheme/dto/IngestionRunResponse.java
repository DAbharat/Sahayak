package com.sahayak.scheme.dto;

import com.sahayak.scheme.domain.IngestionState;

import java.time.Instant;

public record IngestionRunResponse(
        Long id,
        Long schemeId,
        Long documentId,
        IngestionState state,
        String errors,
        Instant createdAt,
        Instant updatedAt
) {
}
