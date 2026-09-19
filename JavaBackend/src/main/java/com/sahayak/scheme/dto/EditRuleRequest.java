package com.sahayak.scheme.dto;

import com.sahayak.scheme.domain.ReviewStatus;
import com.sahayak.scheme.domain.RuleOperator;
import com.sahayak.scheme.domain.RuleValueType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class EditRuleRequest {
    @NotBlank
    private String fieldName;
    @NotNull
    private RuleOperator operator;
    @NotBlank
    private String value;
    @NotNull
    private RuleValueType valueType;
    @NotBlank
    private String rawTextSpan;
    @NotNull
    private ReviewStatus reviewStatus;
    @NotBlank
    private String actor;

    public String getFieldName() { return fieldName; }
    public void setFieldName(String fieldName) { this.fieldName = fieldName; }
    public RuleOperator getOperator() { return operator; }
    public void setOperator(RuleOperator operator) { this.operator = operator; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
    public RuleValueType getValueType() { return valueType; }
    public void setValueType(RuleValueType valueType) { this.valueType = valueType; }
    public String getRawTextSpan() { return rawTextSpan; }
    public void setRawTextSpan(String rawTextSpan) { this.rawTextSpan = rawTextSpan; }
    public ReviewStatus getReviewStatus() { return reviewStatus; }
    public void setReviewStatus(ReviewStatus reviewStatus) { this.reviewStatus = reviewStatus; }
    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }
}
