package com.sahayak.scheme.config;

import com.sahayak.scheme.domain.*;
import com.sahayak.scheme.persistence.ReviewAuditRepository;
import com.sahayak.scheme.persistence.SchemeDocumentRepository;
import com.sahayak.scheme.persistence.SchemeRepository;
import com.sahayak.scheme.persistence.SchemeRuleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Component
@ConditionalOnProperty(name = "app.seed-demo-data", havingValue = "true", matchIfMissing = true)
public class DemoDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataInitializer.class);

    private final SchemeRepository schemeRepository;
    private final SchemeRuleRepository schemeRuleRepository;
    private final SchemeDocumentRepository schemeDocumentRepository;
    private final ReviewAuditRepository reviewAuditRepository;

    public DemoDataInitializer(SchemeRepository schemeRepository,
                               SchemeRuleRepository schemeRuleRepository,
                               SchemeDocumentRepository schemeDocumentRepository,
                               ReviewAuditRepository reviewAuditRepository) {
        this.schemeRepository = schemeRepository;
        this.schemeRuleRepository = schemeRuleRepository;
        this.schemeDocumentRepository = schemeDocumentRepository;
        this.reviewAuditRepository = reviewAuditRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (schemeRepository.count() > 0) {
            log.info("Database already contains schemes. Skipping demo data seeding.");
            return;
        }

        log.info("Seeding demo welfare schemes into database...");

        // 1. Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM) - PUBLISHED & FULLY RESOLVED
        Scheme pmsym = new Scheme();
        pmsym.setName("Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)");
        pmsym.setDescription("A voluntary and contributory pension scheme for unorganized workers to ensure old age protection.");
        pmsym.setSource("Ministry of Labour and Employment");
        pmsym.setSourceType(SourceType.WEBPAGE);
        pmsym.setSourceUrl("https://labour.gov.in/pm-sym");
        pmsym.setLastVerified(LocalDate.now());
        pmsym.setStatus(SchemeStatus.PUBLISHED);
        pmsym.setReviewStatus(ReviewStatus.APPROVED);
        Scheme savedPmsym = schemeRepository.save(pmsym);

        SchemeDocument pmsymDoc = new SchemeDocument();
        pmsymDoc.setScheme(savedPmsym);
        pmsymDoc.setTitle("PM-SYM Scheme Guidelines & Eligibility Rules");
        pmsymDoc.setSourceUrl("https://labour.gov.in/pm-sym");
        pmsymDoc.setRawText("Applicant must be an unorganized worker. Monthly income must not exceed Rs. 15,000. Entry age between 18 and 40 years.");
        pmsymDoc.setChecksum("d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35");
        pmsymDoc.setFetchedAt(Instant.now());
        pmsymDoc.setVersion(1);
        schemeDocumentRepository.save(pmsymDoc);

        SchemeRule rule1 = new SchemeRule();
        rule1.setScheme(savedPmsym);
        rule1.setFieldName("occupation");
        rule1.setOperator(RuleOperator.IN);
        rule1.setValue("[\"unorganized_worker\"]");
        rule1.setValueType(RuleValueType.LIST);
        rule1.setRawTextSpan("Applicant must be an unorganized worker.");
        rule1.setConfidence(BigDecimal.valueOf(0.95));
        rule1.setReviewStatus(ReviewStatus.APPROVED);
        rule1.setResolved(true);
        schemeRuleRepository.save(rule1);

        SchemeRule rule2 = new SchemeRule();
        rule2.setScheme(savedPmsym);
        rule2.setFieldName("monthly_income");
        rule2.setOperator(RuleOperator.LTE);
        rule2.setValue("15000");
        rule2.setValueType(RuleValueType.NUMBER);
        rule2.setRawTextSpan("Monthly income must not exceed Rs. 15,000.");
        rule2.setConfidence(BigDecimal.valueOf(0.92));
        rule2.setReviewStatus(ReviewStatus.APPROVED);
        rule2.setResolved(true);
        schemeRuleRepository.save(rule2);

        SchemeRule rule3 = new SchemeRule();
        rule3.setScheme(savedPmsym);
        rule3.setFieldName("age");
        rule3.setOperator(RuleOperator.BETWEEN);
        rule3.setValue("[18,40]");
        rule3.setValueType(RuleValueType.LIST);
        rule3.setRawTextSpan("Entry age between 18 and 40 years.");
        rule3.setConfidence(BigDecimal.valueOf(0.90));
        rule3.setReviewStatus(ReviewStatus.APPROVED);
        rule3.setResolved(true);
        schemeRuleRepository.save(rule3);

        recordAudit(savedPmsym, null, AuditAction.SCHEME_CREATED, "system", "Initial scheme import");
        recordAudit(savedPmsym, rule1, AuditAction.RULE_EXTRACTED, "system", "Extracted rule: occupation");
        recordAudit(savedPmsym, rule2, AuditAction.RULE_EXTRACTED, "system", "Extracted rule: monthly_income");
        recordAudit(savedPmsym, rule3, AuditAction.RULE_EXTRACTED, "system", "Extracted rule: age");
        recordAudit(savedPmsym, null, AuditAction.SCHEME_APPROVED, "lead_reviewer", "Verified against official gazette notification");

        // 2. Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) - PUBLISHED
        Scheme pmkisan = new Scheme();
        pmkisan.setName("Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)");
        pmkisan.setDescription("Direct income transfer of Rs. 6000 per year to small and marginal farmer families.");
        pmkisan.setSource("Ministry of Agriculture and Farmers Welfare");
        pmkisan.setSourceType(SourceType.WEBPAGE);
        pmkisan.setSourceUrl("https://pmkisan.gov.in");
        pmkisan.setLastVerified(LocalDate.now());
        pmkisan.setStatus(SchemeStatus.PUBLISHED);
        pmkisan.setReviewStatus(ReviewStatus.APPROVED);
        Scheme savedPmkisan = schemeRepository.save(pmkisan);

        SchemeRule kisanRule = new SchemeRule();
        kisanRule.setScheme(savedPmkisan);
        kisanRule.setFieldName("occupation");
        kisanRule.setOperator(RuleOperator.IN);
        kisanRule.setValue("[\"small_marginal_farmer\"]");
        kisanRule.setValueType(RuleValueType.LIST);
        kisanRule.setRawTextSpan("Landholding farmer family having cultivable land.");
        kisanRule.setConfidence(BigDecimal.valueOf(0.92));
        kisanRule.setReviewStatus(ReviewStatus.APPROVED);
        kisanRule.setResolved(true);
        schemeRuleRepository.save(kisanRule);

        recordAudit(savedPmkisan, null, AuditAction.SCHEME_CREATED, "system", "Initial scheme import");
        recordAudit(savedPmkisan, kisanRule, AuditAction.RULE_EXTRACTED, "system", "Extracted farmer qualification");
        recordAudit(savedPmkisan, null, AuditAction.SCHEME_APPROVED, "officer_in_charge", "Approved for public API");

        // 3. Ayushman Bharat - PM-JAY - DRAFT (Contains both resolved & manual review rules for testing review flow)
        Scheme pmjay = new Scheme();
        pmjay.setName("Ayushman Bharat PM-JAY");
        pmjay.setDescription("Health insurance coverage of Rs. 5,00,000 per family per year for secondary and tertiary care hospitalization.");
        pmjay.setSource("National Health Authority Circular");
        pmjay.setSourceType(SourceType.TEXT);
        pmjay.setSourceUrl("https://nha.gov.in/PM-JAY");
        pmjay.setLastVerified(LocalDate.now());
        pmjay.setStatus(SchemeStatus.DRAFT);
        pmjay.setReviewStatus(ReviewStatus.PENDING_REVIEW);
        Scheme savedPmjay = schemeRepository.save(pmjay);

        SchemeRule pmjayRule1 = new SchemeRule();
        pmjayRule1.setScheme(savedPmjay);
        pmjayRule1.setFieldName("monthly_income");
        pmjayRule1.setOperator(RuleOperator.LTE);
        pmjayRule1.setValue("10000");
        pmjayRule1.setValueType(RuleValueType.NUMBER);
        pmjayRule1.setRawTextSpan("Monthly household income must not exceed Rs. 10,000.");
        pmjayRule1.setConfidence(BigDecimal.valueOf(0.88));
        pmjayRule1.setReviewStatus(ReviewStatus.PENDING_REVIEW);
        pmjayRule1.setResolved(true);
        schemeRuleRepository.save(pmjayRule1);

        SchemeRule pmjayRule2 = new SchemeRule();
        pmjayRule2.setScheme(savedPmjay);
        pmjayRule2.setFieldName("manual_review");
        pmjayRule2.setOperator(RuleOperator.UNKNOWN);
        pmjayRule2.setValue("UNRESOLVED");
        pmjayRule2.setValueType(RuleValueType.UNKNOWN);
        pmjayRule2.setRawTextSpan("Beneficiary must belong to identified deprivation categories (D1-D7) under SECC 2011.");
        pmjayRule2.setConfidence(BigDecimal.valueOf(0.15));
        pmjayRule2.setReviewStatus(ReviewStatus.PENDING_REVIEW);
        pmjayRule2.setResolved(false);
        schemeRuleRepository.save(pmjayRule2);

        recordAudit(savedPmjay, null, AuditAction.SCHEME_CREATED, "system", "Ingested from National Health Authority");
        recordAudit(savedPmjay, pmjayRule1, AuditAction.RULE_EXTRACTED, "system", "Extracted rule: monthly_income");
        recordAudit(savedPmjay, pmjayRule2, AuditAction.RULE_EXTRACTED, "system", "Flagged clause for manual review");

        log.info("Demo data seeding completed successfully: 3 schemes initialized.");
    }

    private void recordAudit(Scheme scheme, SchemeRule rule, AuditAction action, String actor, String notes) {
        ReviewAudit audit = new ReviewAudit();
        audit.setScheme(scheme);
        audit.setRule(rule);
        audit.setAction(action);
        audit.setActor(actor);
        audit.setNotes(notes);
        reviewAuditRepository.save(audit);
    }
}
