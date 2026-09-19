package com.sahayak.scheme.dto;

public record IngestionSubmitResponse(
        Long ingestionRunId,
        Long schemeId,
        String status
) {
}
