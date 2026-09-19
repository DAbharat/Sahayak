package com.sahayak.scheme.normalization;

import com.sahayak.scheme.domain.RuleOperator;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RuleExtractionServiceTest {

    private final RuleExtractionService service = new RuleExtractionService();

    @Test
    void extractsKnownRulesWithoutInventingUnknownCriteria() {
        String text = "Applicant must be an unorganized worker and monthly income must not exceed 15,000. " +
                "Applicant must provide ration card.";

        List<ExtractedRule> rules = service.extract(text);

        assertThat(rules).hasSize(3);
        assertThat(rules).anyMatch(r -> r.field().equals("occupation") && r.operator() == RuleOperator.IN);
        assertThat(rules).anyMatch(r -> r.field().equals("monthly_income") && r.operator() == RuleOperator.LTE && r.value().equals("15000"));
        assertThat(rules).anyMatch(r -> !r.resolved() && r.field().equals("manual_review"));
    }

    @Test
    void extractsRulesWithCurrencyAbbreviationsAndAgeRanges() {
        String text = "Applicant must be an unorganized worker. Monthly income must not exceed Rs. 15,000. Entry age between 18 and 40 years.";

        List<ExtractedRule> rules = service.extract(text);

        assertThat(rules).hasSize(3);
        assertThat(rules).anyMatch(r -> r.field().equals("occupation") && r.operator() == RuleOperator.IN);
        assertThat(rules).anyMatch(r -> r.field().equals("monthly_income") && r.operator() == RuleOperator.LTE && r.value().equals("15000"));
        assertThat(rules).anyMatch(r -> r.field().equals("age") && r.operator() == RuleOperator.BETWEEN && r.value().equals("[18,40]"));
    }
}
