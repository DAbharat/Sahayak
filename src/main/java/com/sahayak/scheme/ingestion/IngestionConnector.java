package com.sahayak.scheme.ingestion;

import com.sahayak.scheme.dto.OnboardingIngestionRequest;
import org.springframework.web.multipart.MultipartFile;

public interface IngestionConnector {
    boolean supports(com.sahayak.scheme.domain.SourceType sourceType);
    NormalizedDocument ingest(OnboardingIngestionRequest request, MultipartFile file);
}
