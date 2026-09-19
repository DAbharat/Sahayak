package com.sahayak.scheme.ingestion;

import com.sahayak.scheme.domain.SourceType;
import com.sahayak.scheme.dto.OnboardingIngestionRequest;
import com.sahayak.scheme.exception.BadRequestException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;

@Component
public class PdfIngestionConnector implements IngestionConnector {

    @Override
    public boolean supports(SourceType sourceType) {
        return SourceType.PDF == sourceType;
    }

    @Override
    public NormalizedDocument ingest(OnboardingIngestionRequest request, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("PDF sourceType requires uploaded file");
        }
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            String normalized = text == null ? "" : text.replaceAll("\\s+", " ").trim();
            if (normalized.isBlank()) {
                throw new BadRequestException("PDF had no readable text");
            }
            return new NormalizedDocument(
                    SourceType.PDF,
                    request.getSourceUrl() == null ? "uploaded://" + file.getOriginalFilename() : request.getSourceUrl(),
                    file.getOriginalFilename() == null ? "uploaded-pdf" : file.getOriginalFilename(),
                    normalized,
                    IngestionUtils.sha256(normalized),
                    Instant.now()
            );
        } catch (IOException e) {
            throw new BadRequestException("Failed to parse PDF: " + e.getMessage());
        }
    }
}
