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

    private static final Pattern INCOME_MAX_PATTERN = Pattern.compile(
            "(?:monthly\\s+)?income[^\\d]{0,40}(?:not\\s+exceed|up\\s+to|<=|less\\s+than)\\s*(?:rs\\.?|₹)?\\s*([0-9][0-9,]*)",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern AGE_BETWEEN_PATTERN = Pattern.compile(
            "age[^\\d]{0,20}(?:between|from)?\\s*([0-9]{1,3})\\s*(?:and|to|-)\\s*([0-9]{1,3})",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern AGE_MAX_PATTERN = Pattern.compile(
            "age[^\\d]{0,20}(?:not\\s+more\\s+than|<=|up\\s+to|less\\s+than)\\s*([0-9]{1,3})",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern AGE_MIN_PATTERN = Pattern.compile(
            "age[^\\d]{0,20}(?:at\\s+least|>=|more\\s+than)\\s*([0-9]{1,3})",
            Pattern.CASE_INSENSITIVE);

    // Sentence splitting regex that does NOT break on common abbreviations like Rs., No., etc.
    private static final Pattern SENTENCE_SPLIT_PATTERN = Pattern.compile(
            "(?<=[;:])|(?<=[.!?])(?<!\\b(?:Rs|No|Dr|Mr|Mrs|e\\.g|i\\.e)\\.)\\s+(?=[A-Z0-9])|\\R+"
    );

    // Clause split on 'and' only when followed by another clause/rule keyword
    private static final Pattern CLAUSE_AND_PATTERN = Pattern.compile(
            "(?i)\\s*\\band\\b\\s*(?=(?:monthly\\s+)?income|age|must|applicant|resident|occupation)"
    );

    public List<ExtractedRule> extract(String rawText) {
        String cleaned = rawText == null ? "" : rawText.replaceAll("\\s+", " ").trim();
        if (cleaned.isBlank()) {
            return List.of();
        }

        String[] sentences = SENTENCE_SPLIT_PATTERN.split(cleaned);
        List<String> rawClauses = new ArrayList<>();
        for (String sentence : sentences) {
            String s = sentence.trim();
            if (s.isBlank()) {
                continue;
            }
            String[] subClauses = CLAUSE_AND_PATTERN.split(s);
            for (String sub : subClauses) {
                String trimmed = sub.trim();
                if (!trimmed.isBlank()) {
                    rawClauses.add(trimmed);
                }
            }
        }

        List<ExtractedRule> rules = new ArrayList<>();
        for (String clause : rawClauses) {
            String lower = clause.toLowerCase(Locale.ROOT);
            boolean eligibilityLike = lower.contains("must") || lower.contains("eligible") || lower.contains("income")
                    || lower.contains("age") || lower.contains("worker") || lower.contains("resident")
                    || lower.contains("farmer") || lower.contains("land");
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

        Matcher ageBetweenMatcher = AGE_BETWEEN_PATTERN.matcher(clause);
        if (ageBetweenMatcher.find()) {
            String min = ageBetweenMatcher.group(1);
            String max = ageBetweenMatcher.group(2);
            return new ExtractedRule(
                    "age",
                    RuleOperator.BETWEEN,
                    "[" + min + "," + max + "]",
                    RuleValueType.LIST,
                    clause,
                    BigDecimal.valueOf(0.88),
                    true
            );
        }

        Matcher ageMinMatcher = AGE_MIN_PATTERN.matcher(clause);
        Matcher ageMaxMatcher = AGE_MAX_PATTERN.matcher(clause);
        boolean hasMin = ageMinMatcher.find();
        boolean hasMax = ageMaxMatcher.find();

        if (hasMin && hasMax) {
            return new ExtractedRule(
                    "age",
                    RuleOperator.BETWEEN,
                    "[" + ageMinMatcher.group(1) + "," + ageMaxMatcher.group(1) + "]",
                    RuleValueType.LIST,
                    clause,
                    BigDecimal.valueOf(0.88),
                    true
            );
        }
        if (hasMax) {
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
        if (hasMin) {
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
