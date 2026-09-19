package com.sahayak.scheme.service;

import com.sahayak.scheme.domain.*;
import com.sahayak.scheme.dto.CreateSchemeRequest;
import com.sahayak.scheme.dto.OnboardingIngestionRequest;
import com.sahayak.scheme.exception.BadRequestException;
import com.sahayak.scheme.exception.NotFoundException;
import com.sahayak.scheme.persistence.IngestionRunRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;

@Service
public class IngestionService {

    private final SchemeService schemeService;
    private final IngestionRunRepository ingestionRunRepository;
    private final IngestionProcessor ingestionProcessor;
    private final AuditService auditService;

    public IngestionService(SchemeService schemeService,
                            IngestionRunRepository ingestionRunRepository,
                            IngestionProcessor ingestionProcessor,
                            AuditService auditService) {
        this.schemeService = schemeService;
        this.ingestionRunRepository = ingestionRunRepository;
        this.ingestionProcessor = ingestionProcessor;
        this.auditService = auditService;
    }

    @Transactional
    public IngestionRun submitIngestion(OnboardingIngestionRequest request, MultipartFile file) {
        CreateSchemeRequest createSchemeRequest = new CreateSchemeRequest();
        createSchemeRequest.setName(request.getSchemeName());
        createSchemeRequest.setDescription(request.getDescription());
        createSchemeRequest.setSource(request.getSource());
        createSchemeRequest.setSourceType(request.getSourceType());
        createSchemeRequest.setSourceUrl(resolveSourceUrl(request, file));
        createSchemeRequest.setLastVerified(request.getLastVerified() == null ? LocalDate.now() : request.getLastVerified());

        Scheme scheme = schemeService.createScheme(createSchemeRequest, request.getActor());
        IngestionRun run = new IngestionRun();
        run.setScheme(scheme);
        run.setState(IngestionState.PENDING);
        IngestionRun savedRun = ingestionRunRepository.save(run);
        auditService.record(scheme, null, AuditAction.INGESTION_SUBMITTED, request.getActor(), "Ingestion requested");

        // Buffer file bytes before returning HTTP response to prevent stream/temp-file closure
        byte[] fileBytes = null;
        String filename = null;
        String contentType = null;
        if (file != null && !file.isEmpty()) {
            try {
                fileBytes = file.getBytes();
                filename = file.getOriginalFilename();
                contentType = file.getContentType();
            } catch (IOException e) {
                throw new BadRequestException("Failed to buffer uploaded file: " + e.getMessage());
            }
        }

        final Long runId = savedRun.getId();
        final byte[] finalFileBytes = fileBytes;
        final String finalFilename = filename;
        final String finalContentType = contentType;

        // Dispatch async processing strictly AFTER the current transaction commits to prevent race conditions
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    ingestionProcessor.processAsync(runId, request, finalFileBytes, finalFilename, finalContentType);
                }
            });
        } else {
            ingestionProcessor.processAsync(runId, request, finalFileBytes, finalFilename, finalContentType);
        }

        return savedRun;
    }

    private String resolveSourceUrl(OnboardingIngestionRequest request, MultipartFile file) {
        if (request.getSourceUrl() != null && !request.getSourceUrl().isBlank()) {
            return request.getSourceUrl();
        }
        if (request.getSourceType() == SourceType.PDF && file != null && file.getOriginalFilename() != null) {
            return "uploaded://" + file.getOriginalFilename();
        }
        if (request.getSourceType() == SourceType.TEXT) {
            return "inline://text";
        }
        return request.getSourceUrl();
    }

    @Transactional(readOnly = true)
    public IngestionRun getIngestionRun(Long runId) {
        return ingestionRunRepository.findById(runId)
                .orElseThrow(() -> new NotFoundException("Ingestion run not found: " + runId));
    }
}
