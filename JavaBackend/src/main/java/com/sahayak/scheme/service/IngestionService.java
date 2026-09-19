package com.sahayak.scheme.service;

import com.sahayak.scheme.domain.*;
import com.sahayak.scheme.dto.CreateSchemeRequest;
import com.sahayak.scheme.dto.OnboardingIngestionRequest;
import com.sahayak.scheme.exception.NotFoundException;
import com.sahayak.scheme.ingestion.IngestionConnector;
import com.sahayak.scheme.ingestion.IngestionConnectorFactory;
import com.sahayak.scheme.ingestion.NormalizedDocument;
import com.sahayak.scheme.normalization.ExtractedRule;
import com.sahayak.scheme.normalization.RuleExtractionService;
import com.sahayak.scheme.persistence.IngestionRunRepository;
import com.sahayak.scheme.persistence.SchemeDocumentRepository;
import com.sahayak.scheme.persistence.SchemeRepository;
import com.sahayak.scheme.persistence.SchemeRuleRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
public class IngestionService {

    private static final Logger log = LoggerFactory.getLogger(IngestionService.class);

    private final IngestionConnectorFactory connectorFactory;
    private final RuleExtractionService ruleExtractionService;
    private final SchemeService schemeService;
    private final SchemeRepository schemeRepository;
    private final SchemeDocumentRepository schemeDocumentRepository;
    private final SchemeRuleRepository schemeRuleRepository;
    private final IngestionRunRepository ingestionRunRepository;
    private final AuditService auditService;
    private final Counter ingestionSuccessCounter;
    private final Counter ingestionFailureCounter;

    public IngestionService(IngestionConnectorFactory connectorFactory,
                            RuleExtractionService ruleExtractionService,
                            SchemeService schemeService,
                            SchemeRepository schemeRepository,
                            SchemeDocumentRepository schemeDocumentRepository,
                            SchemeRuleRepository schemeRuleRepository,
                            IngestionRunRepository ingestionRunRepository,
                            AuditService auditService,
                            MeterRegistry meterRegistry) {
        this.connectorFactory = connectorFactory;
        this.ruleExtractionService = ruleExtractionService;
        this.schemeService = schemeService;
        this.schemeRepository = schemeRepository;
        this.schemeDocumentRepository = schemeDocumentRepository;
        this.schemeRuleRepository = schemeRuleRepository;
        this.ingestionRunRepository = ingestionRunRepository;
        this.auditService = auditService;
        this.ingestionSuccessCounter = meterRegistry.counter("ingestion.runs.success");
        this.ingestionFailureCounter = meterRegistry.counter("ingestion.runs.failure");
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

        processIngestionAsync(savedRun.getId(), request, file);
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

    @Async("ingestionExecutor")
    public void processIngestionAsync(Long runId, OnboardingIngestionRequest request, MultipartFile file) {
        processIngestion(runId, request, file);
    }

    @Transactional
    public void processIngestion(Long runId, OnboardingIngestionRequest request, MultipartFile file) {
        IngestionRun run = ingestionRunRepository.findById(runId)
                .orElseThrow(() -> new NotFoundException("Ingestion run not found: " + runId));
        run.setState(IngestionState.PROCESSING);

        try {
            IngestionConnector connector = connectorFactory.getConnector(request.getSourceType());
            NormalizedDocument normalizedDocument = connector.ingest(request, file);

            Scheme scheme = run.getScheme();
            SchemeDocument document = new SchemeDocument();
            document.setScheme(scheme);
            document.setSourceUrl(normalizedDocument.sourceUrl());
            document.setTitle(normalizedDocument.title());
            document.setRawText(normalizedDocument.rawText());
            document.setChecksum(normalizedDocument.checksum());
            document.setFetchedAt(normalizedDocument.fetchedAt());
            int nextVersion = schemeDocumentRepository.findTopBySchemeIdOrderByVersionDesc(scheme.getId())
                    .map(existing -> existing.getVersion() + 1)
                    .orElse(1);
            document.setVersion(nextVersion);
            SchemeDocument savedDocument = schemeDocumentRepository.save(document);

            List<ExtractedRule> extractedRules = ruleExtractionService.extract(normalizedDocument.rawText());
            for (ExtractedRule extractedRule : extractedRules) {
                SchemeRule rule = new SchemeRule();
                rule.setScheme(scheme);
                rule.setFieldName(extractedRule.field());
                rule.setOperator(extractedRule.operator());
                rule.setValue(extractedRule.value());
                rule.setValueType(extractedRule.valueType());
                rule.setRawTextSpan(extractedRule.rawTextSpan());
                rule.setConfidence(extractedRule.confidence());
                rule.setReviewStatus(extractedRule.resolved() ? ReviewStatus.PENDING_REVIEW : ReviewStatus.REJECTED);
                rule.setResolved(extractedRule.resolved());
                schemeService.validateRule(rule);
                SchemeRule savedRule = schemeRuleRepository.save(rule);
                auditService.record(scheme, savedRule, AuditAction.RULE_EXTRACTED, request.getActor(), "Rule extracted from source document");
            }

            run.setDocument(savedDocument);
            run.setState(IngestionState.COMPLETED);
            run.setErrors(null);
            ingestionSuccessCounter.increment();
            log.info("event=ingestion_completed runId={} schemeId={} sourceType={} extractedRules={}",
                    runId, scheme.getId(), request.getSourceType(), extractedRules.size());
        } catch (Exception ex) {
            run.setState(IngestionState.FAILED);
            run.setErrors(ex.getMessage());
            ingestionFailureCounter.increment();
            log.error("event=ingestion_failed runId={} reason={}", runId, ex.getMessage(), ex);
        }
    }

    @Transactional(readOnly = true)
    public IngestionRun getIngestionRun(Long runId) {
        return ingestionRunRepository.findById(runId)
                .orElseThrow(() -> new NotFoundException("Ingestion run not found: " + runId));
    }
}
