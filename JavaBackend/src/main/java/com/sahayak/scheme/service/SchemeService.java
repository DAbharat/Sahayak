package com.sahayak.scheme.service;

import com.sahayak.scheme.domain.*;
import com.sahayak.scheme.dto.CreateSchemeRequest;
import com.sahayak.scheme.dto.EditRuleRequest;
import com.sahayak.scheme.dto.ReviewActionRequest;
import com.sahayak.scheme.exception.BadRequestException;
import com.sahayak.scheme.exception.NotFoundException;
import com.sahayak.scheme.persistence.SchemeRepository;
import com.sahayak.scheme.persistence.SchemeRuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class SchemeService {

    private final SchemeRepository schemeRepository;
    private final SchemeRuleRepository schemeRuleRepository;
    private final AuditService auditService;

    public SchemeService(SchemeRepository schemeRepository,
                         SchemeRuleRepository schemeRuleRepository,
                         AuditService auditService) {
        this.schemeRepository = schemeRepository;
        this.schemeRuleRepository = schemeRuleRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Scheme createScheme(CreateSchemeRequest request, String actor) {
        validateSource(request.getSource(), request.getSourceUrl(), request.getSourceType());

        schemeRepository.findByNameIgnoreCase(request.getName())
                .ifPresent(existing -> {
                    throw new BadRequestException("Scheme already exists with same name");
                });

        Scheme scheme = new Scheme();
        scheme.setName(request.getName().trim());
        scheme.setDescription(request.getDescription());
        scheme.setSource(request.getSource().trim());
        scheme.setSourceType(request.getSourceType());
        scheme.setSourceUrl(request.getSourceUrl().trim());
        scheme.setLastVerified(request.getLastVerified());
        scheme.setStatus(SchemeStatus.DRAFT);
        scheme.setReviewStatus(ReviewStatus.PENDING_REVIEW);

        Scheme saved = schemeRepository.save(scheme);
        auditService.record(saved, null, AuditAction.SCHEME_CREATED, actor, "Scheme created with source metadata");
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Scheme> getSchemes(SchemeStatus status, String name) {
        if (status != null && name != null && !name.isBlank()) {
            return schemeRepository.findByStatusAndNameContainingIgnoreCase(status, name.trim());
        }
        if (status != null) {
            return schemeRepository.findByStatus(status);
        }
        if (name != null && !name.isBlank()) {
            return schemeRepository.findByNameContainingIgnoreCase(name.trim());
        }
        return schemeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Scheme getScheme(Long id) {
        return schemeRepository.findById(id).orElseThrow(() -> new NotFoundException("Scheme not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<SchemeRule> getRules(Long schemeId) {
        getScheme(schemeId);
        return schemeRuleRepository.findBySchemeId(schemeId);
    }

    @Transactional
    public Scheme approveScheme(Long schemeId, ReviewActionRequest request) {
        Scheme scheme = getScheme(schemeId);
        List<SchemeRule> rules = schemeRuleRepository.findBySchemeId(schemeId);
        boolean hasPendingUnresolved = rules.stream().anyMatch(rule -> !rule.isResolved());
        if (hasPendingUnresolved) {
            throw new BadRequestException("Cannot publish scheme with unresolved eligibility clauses");
        }
        scheme.setReviewStatus(ReviewStatus.APPROVED);
        scheme.setStatus(SchemeStatus.PUBLISHED);
        scheme.setLastVerified(LocalDate.now());
        Scheme saved = schemeRepository.save(scheme);
        auditService.record(saved, null, AuditAction.SCHEME_APPROVED, request.getActor(), request.getNotes());
        return saved;
    }

    @Transactional
    public Scheme archiveScheme(Long schemeId, ReviewActionRequest request) {
        Scheme scheme = getScheme(schemeId);
        scheme.setStatus(SchemeStatus.ARCHIVED);
        scheme.setReviewStatus(ReviewStatus.REJECTED);
        Scheme saved = schemeRepository.save(scheme);
        auditService.record(saved, null, AuditAction.SCHEME_ARCHIVED, request.getActor(), request.getNotes());
        return saved;
    }

    @Transactional
    public SchemeRule editRule(Long schemeId, Long ruleId, EditRuleRequest request) {
        Scheme scheme = getScheme(schemeId);
        SchemeRule rule = schemeRuleRepository.findById(ruleId)
                .orElseThrow(() -> new NotFoundException("Rule not found: " + ruleId));
        if (!rule.getScheme().getId().equals(schemeId)) {
            throw new BadRequestException("Rule does not belong to scheme");
        }

        rule.setFieldName(request.getFieldName().trim());
        rule.setOperator(request.getOperator());
        rule.setValue(request.getValue().trim());
        rule.setValueType(request.getValueType());
        rule.setRawTextSpan(request.getRawTextSpan().trim());
        rule.setReviewStatus(request.getReviewStatus());
        rule.setResolved(request.getOperator() != RuleOperator.UNKNOWN);

        validateRule(rule);

        SchemeRule saved = schemeRuleRepository.save(rule);
        auditService.record(scheme, saved, AuditAction.RULE_EDITED, request.getActor(), "Rule manually edited during review");
        return saved;
    }

    public void validateSource(String source, String sourceUrl, SourceType sourceType) {
        if (source == null || source.isBlank()) {
            throw new BadRequestException("source is mandatory");
        }
        if (sourceType == null) {
            throw new BadRequestException("sourceType is mandatory");
        }
        if (sourceUrl == null || sourceUrl.isBlank()) {
            throw new BadRequestException("sourceUrl/reference is mandatory");
        }
    }

    public void validateRule(SchemeRule rule) {
        if (rule.getFieldName() == null || rule.getFieldName().isBlank()) {
            throw new BadRequestException("Rule field cannot be blank");
        }
        if (rule.getOperator() == null || rule.getValueType() == null || rule.getValue() == null || rule.getValue().isBlank()) {
            throw new BadRequestException("Rule schema invalid");
        }
        if (rule.isResolved() && rule.getOperator() == RuleOperator.UNKNOWN) {
            throw new BadRequestException("Resolved rule cannot have UNKNOWN operator");
        }
    }
}
