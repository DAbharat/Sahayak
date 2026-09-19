package com.sahayak.scheme.service;

import com.sahayak.scheme.domain.*;
import com.sahayak.scheme.dto.OnboardingIngestionRequest;
import com.sahayak.scheme.exception.NotFoundException;
import com.sahayak.scheme.ingestion.InMemoryMultipartFile;
import com.sahayak.scheme.ingestion.IngestionConnector;
import com.sahayak.scheme.ingestion.IngestionConnectorFactory;
import com.sahayak.scheme.ingestion.NormalizedDocument;
import com.sahayak.scheme.normalization.ExtractedRule;
import com.sahayak.scheme.normalization.RuleExtractionService;
import com.sahayak.scheme.persistence.IngestionRunRepository;
import com.sahayak.scheme.persistence.SchemeDocumentRepository;
import com.sahayak.scheme.persistence.SchemeRuleRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class IngestionProcessor {

    private static final Logger log = LoggerFactory.getLogger(IngestionProcessor.class);

    private final IngestionConnectorFactory connectorFactory;
    private final RuleExtractionService ruleExtractionService;
    private final SchemeService schemeService;
    private final SchemeDocumentRepository schemeDocumentRepository;
    private final SchemeRuleRepository schemeRuleRepository;
    private final IngestionRunRepository ingestionRunRepository;
    private final AuditService auditService;
    private final TransactionTemplate transactionTemplate;
    private final Counter ingestionSuccessCounter;
    private final Counter ingestionFailureCounter;

    public IngestionProcessor(IngestionConnectorFactory connectorFactory,
                              RuleExtractionService ruleExtractionService,
                              SchemeService schemeService,
                              SchemeDocumentRepository schemeDocumentRepository,
                              SchemeRuleRepository schemeRuleRepository,
                              IngestionRunRepository ingestionRunRepository,
                              AuditService auditService,
                              PlatformTransactionManager transactionManager,
                              MeterRegistry meterRegistry) {
        this.connectorFactory = connectorFactory;
        this.ruleExtractionService = ruleExtractionService;
        this.schemeService = schemeService;
        this.schemeDocumentRepository = schemeDocumentRepository;
        this.schemeRuleRepository = schemeRuleRepository;
        this.ingestionRunRepository = ingestionRunRepository;
        this.auditService = auditService;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.ingestionSuccessCounter = meterRegistry.counter("ingestion.runs.success");
        this.ingestionFailureCounter = meterRegistry.counter("ingestion.runs.failure");
    }

    @Async("ingestionExecutor")
    public void processAsync(Long runId, OnboardingIngestionRequest request, byte[] fileBytes, String originalFilename, String contentType) {
        process(runId, request, fileBytes, originalFilename, contentType);
    }

    public void process(Long runId, OnboardingIngestionRequest request, byte[] fileBytes, String originalFilename, String contentType) {
        MultipartFile multipartFile = fileBytes != null ?
                new InMemoryMultipartFile("file", originalFilename, contentType, fileBytes) : null;

        // Step 1: Mark run as PROCESSING
        transactionTemplate.executeWithoutResult(status -> {
            IngestionRun run = ingestionRunRepository.findById(runId)
                    .orElseThrow(() -> new NotFoundException("Ingestion run not found: " + runId));
            run.setState(IngestionState.PROCESSING);
            ingestionRunRepository.save(run);
        });

        try {
            // Step 2: Fetch and normalize document
            IngestionConnector connector = connectorFactory.getConnector(request.getSourceType());
            NormalizedDocument normalizedDocument = connector.ingest(request, multipartFile);
            List<ExtractedRule> extractedRules = ruleExtractionService.extract(normalizedDocument.rawText());

            // Step 3: Persist document, rules, and mark run COMPLETED in a single atomic transaction
            transactionTemplate.executeWithoutResult(status -> {
                IngestionRun run = ingestionRunRepository.findById(runId)
                        .orElseThrow(() -> new NotFoundException("Ingestion run not found: " + runId));
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

                for (ExtractedRule extractedRule : extractedRules) {
                    SchemeRule rule = new SchemeRule();
                    rule.setScheme(scheme);
                    rule.setFieldName(extractedRule.field());
                    rule.setOperator(extractedRule.operator());
                    rule.setValue(extractedRule.value());
                    rule.setValueType(extractedRule.valueType());
                    rule.setRawTextSpan(extractedRule.rawTextSpan());
                    rule.setConfidence(extractedRule.confidence());
                    // Both resolved and unresolved clauses start in PENDING_REVIEW for reviewer verification
                    rule.setReviewStatus(ReviewStatus.PENDING_REVIEW);
                    rule.setResolved(extractedRule.resolved());
                    schemeService.validateRule(rule);
                    SchemeRule savedRule = schemeRuleRepository.save(rule);
                    auditService.record(scheme, savedRule, AuditAction.RULE_EXTRACTED, request.getActor(), "Rule extracted from source document");
                }

                run.setDocument(savedDocument);
                run.setState(IngestionState.COMPLETED);
                run.setErrors(null);
                ingestionRunRepository.save(run);
            });

            ingestionSuccessCounter.increment();
            log.info("event=ingestion_completed runId={} sourceType={} extractedRules={}",
                    runId, request.getSourceType(), extractedRules.size());
        } catch (Exception ex) {
            // Step 4: On failure, record FAILED state in a clean, separate transaction without saving corrupt rules
            transactionTemplate.executeWithoutResult(status -> {
                IngestionRun run = ingestionRunRepository.findById(runId)
                        .orElseThrow(() -> new NotFoundException("Ingestion run not found: " + runId));
                run.setState(IngestionState.FAILED);
                run.setErrors(ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName());
                ingestionRunRepository.save(run);
            });
            ingestionFailureCounter.increment();
            log.error("event=ingestion_failed runId={} reason={}", runId, ex.getMessage(), ex);
        }
    }
}
