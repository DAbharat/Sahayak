package com.sahayak.scheme.ingestion;

import com.sahayak.scheme.domain.SourceType;
import com.sahayak.scheme.dto.OnboardingIngestionRequest;
import com.sahayak.scheme.exception.BadRequestException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;

@Component
public class WebpageIngestionConnector implements IngestionConnector {

    @Override
    public boolean supports(SourceType sourceType) {
        return SourceType.WEBPAGE == sourceType;
    }

    @Override
    @Retryable(retryFor = IOException.class, maxAttempts = 3, backoff = @Backoff(delay = 500, multiplier = 2))
    public NormalizedDocument ingest(OnboardingIngestionRequest request, MultipartFile file) {
        if (request.getSourceUrl() == null || request.getSourceUrl().isBlank()) {
            throw new BadRequestException("WEBPAGE sourceType requires sourceUrl");
        }
        try {
            Document document = Jsoup.connect(request.getSourceUrl()).timeout(15_000).get();
            String text = document.body() == null ? "" : document.body().text();
            String normalized = text.replaceAll("\\s+", " ").trim();
            if (normalized.isBlank()) {
                throw new BadRequestException("Webpage body text is empty");
            }
            return new NormalizedDocument(
                    SourceType.WEBPAGE,
                    request.getSourceUrl(),
                    document.title() == null || document.title().isBlank() ? request.getSourceUrl() : document.title(),
                    normalized,
                    IngestionUtils.sha256(normalized),
                    Instant.now()
            );
        } catch (IOException e) {
            throw new BadRequestException("Failed to fetch webpage: " + e.getMessage());
        }
    }
}
