package com.sahayak.scheme.normalization;

import com.sahayak.scheme.domain.RuleOperator;
import com.sahayak.scheme.domain.RuleValueType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class RuleExtractionService {

    private static final Pattern INCOME_MAX_PATTERN = Pattern.compile("(?:monthly\\s+)?income[^\\d]{0,40}(?:not\\s+exceed|up\\s+to|<=|less\\s+than)\\s*(?:rs\\.?|₹)?\\s*([0-9][0-9,]*)", Pattern.CASE_INSENSITIVE);
    private static final Pattern AGE_MAX_PATTERN = Pattern.compile("age[^\\d]{0,20}(?:not\\s+more\\s+than|<=|up\\s+to|less\\s+than)\\s*([0-9]{1,3})", Pattern.CASE_INSENSITIVE);
    private static final Pattern AGE_MIN_PATTERN = Pattern.compile("age[^\\d]{0,20}(?:at\\s+least|>=|more\\s+than)\\s*([0-9]{1,3})", Pattern.CASE_INSENSITIVE);

    public List<ExtractedRule> extract(String rawText) {
        String cleaned = rawText == null ? "" : rawText.replaceAll("\\s+", " ").trim();
        String[] clauses = cleaned.split("(?<=[.;:])|(?i)\\band\\b");

        List<ExtractedRule> rules = new ArrayList<>();
        for (String c : clauses) {
            String clause = c.trim();
            if (clause.isBlank()) {
                continue;
            }
            String lower = clause.toLowerCase(Locale.ROOT);
            boolean eligibilityLike = lower.contains("must") || lower.contains("eligible") || lower.contains("income")
                    || lower.contains("age") || lower.contains("worker") || lower.contains("resident");
            if (!eligibilityLike) {
                continue;
            }

            ExtractedRule rule = tryExtractKnownRule(clause, lower);
            if (rule != null) {
                rules.add(rule);
            } else {
                rules.add(new ExtractedRule(
                        "manual_review",
                        RuleOperator.UNKNOWN,
                        "UNRESOLVED",
                        RuleValueType.UNKNOWN,
                        clause,
                        BigDecimal.valueOf(0.15),
                        false
                ));
            }
        }
        return rules;
    }

    private ExtractedRule tryExtractKnownRule(String clause, String lower) {
        if (lower.contains("unorganized worker")) {
            return new ExtractedRule(
                    "occupation",
                    RuleOperator.IN,
                    "[\"unorganized_worker\"]",
                    RuleValueType.LIST,
                    clause,
                    BigDecimal.valueOf(0.92),
                    true
            );
        }

        Matcher incomeMatcher = INCOME_MAX_PATTERN.matcher(clause);
        if (incomeMatcher.find()) {
            String value = incomeMatcher.group(1).replace(",", "");
            return new ExtractedRule(
                    "monthly_income",
                    RuleOperator.LTE,
                    value,
                    RuleValueType.NUMBER,
                    clause,
                    BigDecimal.valueOf(0.90),
                    true
            );
        }

        Matcher ageMaxMatcher = AGE_MAX_PATTERN.matcher(clause);
        if (ageMaxMatcher.find()) {
            return new ExtractedRule(
                    "age",
                    RuleOperator.LTE,
                    ageMaxMatcher.group(1),
                    RuleValueType.NUMBER,
                    clause,
                    BigDecimal.valueOf(0.82),
                    true
            );
        }

        Matcher ageMinMatcher = AGE_MIN_PATTERN.matcher(clause);
        if (ageMinMatcher.find()) {
            return new ExtractedRule(
                    "age",
                    RuleOperator.GTE,
                    ageMinMatcher.group(1),
                    RuleValueType.NUMBER,
                    clause,
                    BigDecimal.valueOf(0.82),
                    true
            );
        }

        return null;
    }
}
