package com.sahayak.scheme.service;

import com.sahayak.scheme.domain.*;
import com.sahayak.scheme.persistence.ReviewAuditRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final ReviewAuditRepository reviewAuditRepository;

    public AuditService(ReviewAuditRepository reviewAuditRepository) {
        this.reviewAuditRepository = reviewAuditRepository;
    }

    public void record(Scheme scheme, SchemeRule rule, AuditAction action, String actor, String notes) {
        ReviewAudit audit = new ReviewAudit();
        audit.setScheme(scheme);
        audit.setRule(rule);
        audit.setAction(action);
        audit.setActor(actor == null || actor.isBlank() ? "system" : actor);
        audit.setNotes(notes);
        reviewAuditRepository.save(audit);
    }
}
