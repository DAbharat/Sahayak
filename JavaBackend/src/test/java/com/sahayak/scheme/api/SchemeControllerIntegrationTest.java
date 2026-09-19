package com.sahayak.scheme.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sahayak.scheme.domain.ReviewStatus;
import com.sahayak.scheme.domain.RuleOperator;
import com.sahayak.scheme.domain.RuleValueType;
import com.sahayak.scheme.domain.SchemeRule;
import com.sahayak.scheme.domain.SourceType;
import com.sahayak.scheme.dto.CreateSchemeRequest;
import com.sahayak.scheme.dto.EditRuleRequest;
import com.sahayak.scheme.dto.ReviewActionRequest;
import com.sahayak.scheme.persistence.SchemeRepository;
import com.sahayak.scheme.persistence.SchemeRuleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SchemeControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SchemeRepository schemeRepository;

    @Autowired
    private SchemeRuleRepository schemeRuleRepository;

    @Test
    void rejectsSchemeWithoutSourceMetadata() throws Exception {
        String payload = "{\"name\":\"Example\",\"sourceType\":\"TEXT\"}";

        mockMvc.perform(post("/api/v1/schemes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void exposesPublishedSchemesForBackendConsumption() throws Exception {
        CreateSchemeRequest draft = new CreateSchemeRequest();
        draft.setName("Scheme A");
        draft.setDescription("draft scheme");
        draft.setSource("Gov notification");
        draft.setSourceType(SourceType.TEXT);
        draft.setSourceUrl("https://example.gov/scheme-a");
        draft.setLastVerified(LocalDate.now());

        String createResponse = mockMvc.perform(post("/api/v1/schemes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(draft)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long schemeId = objectMapper.readTree(createResponse).get("id").asLong();

        ReviewActionRequest approve = new ReviewActionRequest();
        approve.setActor("reviewer");
        approve.setNotes("approved");

        mockMvc.perform(post("/api/v1/schemes/{schemeId}/review/approve", schemeId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approve)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));

        mockMvc.perform(get("/api/v1/schemes")
                        .param("status", "PUBLISHED")
                        .param("name", "Scheme A"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Scheme A"))
                .andExpect(jsonPath("$[0].sourceUrl").value("https://example.gov/scheme-a"));
    }

    @Test
    void allowsApprovingSchemeWhenUnresolvedRulesAreRejectedByReviewer() throws Exception {
        CreateSchemeRequest draft = new CreateSchemeRequest();
        draft.setName("Scheme with Review Workflow");
        draft.setDescription("testing deadlock resolution");
        draft.setSource("Gazette");
        draft.setSourceType(SourceType.TEXT);
        draft.setSourceUrl("https://example.gov/scheme-workflow");
        draft.setLastVerified(LocalDate.now());

        String createResponse = mockMvc.perform(post("/api/v1/schemes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(draft)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long schemeId = objectMapper.readTree(createResponse).get("id").asLong();

        // Create an unresolved rule for this scheme
        SchemeRule rule = new SchemeRule();
        rule.setScheme(schemeRepository.findById(schemeId).orElseThrow());
        rule.setFieldName("manual_review");
        rule.setOperator(RuleOperator.UNKNOWN);
        rule.setValue("UNRESOLVED");
        rule.setValueType(RuleValueType.UNKNOWN);
        rule.setRawTextSpan("Applicant must submit attested identity document");
        rule.setConfidence(BigDecimal.valueOf(0.15));
        rule.setReviewStatus(ReviewStatus.PENDING_REVIEW);
        rule.setResolved(false);
        SchemeRule savedRule = schemeRuleRepository.save(rule);

        // Verify approval fails while rule is unresolved and pending
        ReviewActionRequest approve = new ReviewActionRequest();
        approve.setActor("reviewer");
        approve.setNotes("try approving prematurely");

        mockMvc.perform(post("/api/v1/schemes/{schemeId}/review/approve", schemeId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approve)))
                .andExpect(status().isBadRequest());

        // Reviewer rejects the non-eligibility administrative rule
        EditRuleRequest edit = new EditRuleRequest();
        edit.setFieldName("manual_review");
        edit.setOperator(RuleOperator.UNKNOWN);
        edit.setValue("REJECTED_DOCUMENTATION_CLAUSE");
        edit.setValueType(RuleValueType.UNKNOWN);
        edit.setRawTextSpan("Applicant must submit attested identity document");
        edit.setReviewStatus(ReviewStatus.REJECTED);
        edit.setActor("lead_reviewer");

        mockMvc.perform(put("/api/v1/schemes/{schemeId}/rules/{ruleId}", schemeId, savedRule.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(edit)))
                .andExpect(status().isOk());

        // Now scheme approval succeeds!
        mockMvc.perform(post("/api/v1/schemes/{schemeId}/review/approve", schemeId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approve)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));
    }

    @Test
    void supportsRuleDeletion() throws Exception {
        CreateSchemeRequest draft = new CreateSchemeRequest();
        draft.setName("Scheme for Rule Deletion");
        draft.setDescription("testing rule deletion");
        draft.setSource("Gazette");
        draft.setSourceType(SourceType.TEXT);
        draft.setSourceUrl("https://example.gov/delete-rule");
        draft.setLastVerified(LocalDate.now());

        String createResponse = mockMvc.perform(post("/api/v1/schemes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(draft)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long schemeId = objectMapper.readTree(createResponse).get("id").asLong();

        SchemeRule rule = new SchemeRule();
        rule.setScheme(schemeRepository.findById(schemeId).orElseThrow());
        rule.setFieldName("noise_rule");
        rule.setOperator(RuleOperator.UNKNOWN);
        rule.setValue("NOISE");
        rule.setValueType(RuleValueType.UNKNOWN);
        rule.setRawTextSpan("Extraneous text span");
        rule.setConfidence(BigDecimal.valueOf(0.1));
        rule.setReviewStatus(ReviewStatus.PENDING_REVIEW);
        rule.setResolved(false);
        SchemeRule savedRule = schemeRuleRepository.save(rule);

        mockMvc.perform(delete("/api/v1/schemes/{schemeId}/rules/{ruleId}", schemeId, savedRule.getId())
                        .header("X-Actor", "admin"))
                .andExpect(status().isNoContent());

        assertThat(schemeRuleRepository.findById(savedRule.getId())).isEmpty();
    }
}
