package com.sahayak.scheme.service;

import com.sahayak.scheme.domain.IngestionRun;
import com.sahayak.scheme.domain.Scheme;
import com.sahayak.scheme.domain.SchemeRule;
import com.sahayak.scheme.dto.*;
import org.springframework.stereotype.Component;

@Component
public class SchemeMapper {

    public SchemeResponse toSchemeResponse(Scheme scheme) {
        return new SchemeResponse(
                scheme.getId(),
                scheme.getName(),
                scheme.getDescription(),
                scheme.getSource(),
                scheme.getSourceType(),
                scheme.getSourceUrl(),
                scheme.getLastVerified(),
                scheme.getStatus(),
                scheme.getReviewStatus()
        );
    }

    public RuleResponse toRuleResponse(SchemeRule rule) {
        return new RuleResponse(
                rule.getId(),
                rule.getFieldName(),
                rule.getOperator(),
                rule.getValue(),
                rule.getValueType(),
                rule.getRawTextSpan(),
                rule.getConfidence(),
                rule.getReviewStatus(),
                rule.isResolved()
        );
    }

    public SourceMetadataResponse toSourceMetadata(Scheme scheme) {
        return new SourceMetadataResponse(
                scheme.getSource(),
                scheme.getSourceType(),
                scheme.getSourceUrl(),
                scheme.getLastVerified()
        );
    }

    public IngestionRunResponse toIngestionRunResponse(IngestionRun run) {
        return new IngestionRunResponse(
                run.getId(),
                run.getScheme() == null ? null : run.getScheme().getId(),
                run.getDocument() == null ? null : run.getDocument().getId(),
                run.getState(),
                run.getErrors(),
                run.getCreatedAt(),
                run.getUpdatedAt()
        );
    }
}
