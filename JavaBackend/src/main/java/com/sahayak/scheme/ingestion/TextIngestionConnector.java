package com.sahayak.scheme.ingestion;

import com.sahayak.scheme.domain.SourceType;
import com.sahayak.scheme.dto.OnboardingIngestionRequest;
import com.sahayak.scheme.exception.BadRequestException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

@Component
public class TextIngestionConnector implements IngestionConnector {

    @Override
    public boolean supports(SourceType sourceType) {
        return SourceType.TEXT == sourceType;
    }

    @Override
    public NormalizedDocument ingest(OnboardingIngestionRequest request, MultipartFile file) {
        String text = request.getTextContent();
        if ((text == null || text.isBlank()) && file != null && !file.isEmpty()) {
            try {
                text = new String(file.getBytes(), StandardCharsets.UTF_8);
            } catch (IOException e) {
                throw new BadRequestException("Failed to read uploaded text: " + e.getMessage());
            }
        }
        if (text == null || text.isBlank()) {
            throw new BadRequestException("TEXT sourceType requires textContent or uploaded file");
        }
        String normalized = text.replaceAll("\\s+", " ").trim();
        return new NormalizedDocument(
                SourceType.TEXT,
                request.getSourceUrl() == null ? "inline://text" : request.getSourceUrl(),
                "text-upload",
                normalized,
                IngestionUtils.sha256(normalized),
                Instant.now()
        );
    }
}
