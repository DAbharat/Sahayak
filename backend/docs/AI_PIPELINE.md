# AI Pipeline — GovScheme Navigator

## Overview

The AI pipeline converts free-form citizen text into structured, verifiable government scheme guidance.

## Critical Architectural Rule

> **The LLM is NEVER the eligibility decision maker.**

```
User text
  → [STEP 1] Bedrock extraction (LLM)
  → [STEP 2] Pydantic validation (deterministic)
  → [STEP 3] Rules engine (deterministic — NO LLM)
  → EligibilityResult (source of truth)
  → [STEP 4] Bedrock explanation (LLM — mirrors result only)
```

---

## Step 1: Profile Extraction

**Module:** `app/ai/profile_extractor.py`
**AWS Service:** Amazon Bedrock (Converse API)

### Input
Free-form text in Hindi, Hinglish, or English.

### System Prompt Rules
The extraction prompt enforces:
1. Never invent facts
2. Unknown values → `null`
3. Convert Indian numeric expressions (`पंद्रह हजार` → 15000)
4. Normalize state names to English
5. Normalize occupation to controlled enum
6. Detect language
7. List missing fields
8. Assign per-field confidence scores

### Bedrock Configuration
- Temperature: **0.1** (low, for determinism)
- Max tokens: 1024
- JSON output enforced via prompt + Pydantic validation

### Output
```python
UserProfile(
    state="Haryana",
    occupation=OccupationEnum.street_vendor,
    monthly_income=15000.0,
    language=LanguageEnum.hi,
    missing_fields=["age", "family_size"],
    confidence={"state": 0.95, "occupation": 0.97, "monthly_income": 0.93}
)
```

### Error Handling
- `InvalidModelOutputError` → JSON parse fail → wrapped as `AIExtractionError`
- `BedrockInvocationError` → throttling/timeout → retry with exponential backoff
- Malformed JSON → code fence stripping → regex fallback → error

---

## Step 2: Deterministic Rules Engine

**Module:** `app/rules/engine.py`, `app/rules/operators.py`
**NO AWS SERVICE CALLED**

### How it works

Each scheme has a list of `SchemeRule` objects:
```json
{
  "field": "monthly_income",
  "operator": "lte",
  "value": 50000,
  "description": "Monthly income ≤ ₹50,000"
}
```

The engine:
1. Extracts `profile[field]` → `actual_value`
2. If `actual_value` is `None` → `missing_information`
3. Applies `operator(actual_value, rule.value)` → `True/False`
4. Aggregates: all passed → `eligible`, any failed → `not_eligible`, any missing → `needs_more_information`

### Operators
| Operator | Function |
|----------|----------|
| `equals` | Case-insensitive string or value equality |
| `not_equals` | Negation of equals |
| `lt` / `less_than` | actual < expected |
| `lte` / `less_than_or_equal` | actual ≤ expected |
| `gt` / `greater_than` | actual > expected |
| `gte` / `greater_than_or_equal` | actual ≥ expected |
| `in` | actual in collection (case-insensitive for strings) |
| `bool_equals` | Boolean equality |

---

## Step 3: Explanation Generation

**Module:** `app/ai/explanation_generator.py`
**AWS Service:** Amazon Bedrock (Converse API)

### Critical Constraint
The system prompt pins the eligibility status in the instruction:
```
"Eligibility decision (do NOT change this): {status}"
```

The explanation always starts with a pinned status line:
```
✅ Eligibility status: ELIGIBLE

आप PM SVANidhi योजना के लिए पात्र हैं। आपकी मासिक आय ₹15,000 है जो
₹50,000 की सीमा से कम है, और आप एक रेहड़ी लगाने वाले हैं जो इस
योजना के लिए पात्र व्यवसाय है।
```

### Bedrock Configuration
- Temperature: **0.3** (slightly higher for natural language)
- No PII/raw identity data sent to Bedrock
- Profile summary is anonymized (no Aadhaar, ration card, etc.)

---

## Step 4: Draft Generation

**Module:** `app/ai/draft_generator.py`
**AWS Service:** Amazon Bedrock (Converse API)

### Key Rules in System Prompt
1. Use `[PLACEHOLDER_NAME]` for missing details
2. Never fabricate IDs, Aadhaar, dates, payment references
3. Only include scheme name if explicitly provided
4. Only include user details explicitly mentioned

### Placeholder Extraction
After generation, the system extracts all `[PLACEHOLDER_KEY]` patterns from the body and returns them as the `placeholders` list for frontend rendering.

---

## Step 5: Voice Pipeline (Transcribe + Polly)

### Hindi Voice Input (Transcribe)
```
Audio file
  → Validate format (WAV/MP3/FLAC/OGG/WebM/MP4)
  → Upload to S3 (govscheme-navigator-audio bucket)
  → Start Transcribe job (language: hi-IN)
  → Poll every 5s (max 120s timeout)
  → Fetch transcript JSON from result URI
  → Extract text + average confidence
  → Feed to profile extraction
```

### Hindi Voice Output (Polly)
```
Explanation text
  → Truncate to 3000 chars if needed
  → Call Polly.synthesize_speech (voice: Aditi/Kajal, format: MP3)
  → Read audio stream bytes
  → Base64 encode
  → Return in response (frontend plays it)
  → On failure: return null audio, text_fallback always provided
```

---

## Bedrock Client Implementation

**Module:** `app/ai/bedrock_client.py`

### Retry Logic
```python
for attempt in range(1, max_retries + 1):
    try:
        response = client.converse(...)
        return text
    except ClientError as exc:
        if error_code in RETRYABLE_CODES and attempt < max_retries:
            time.sleep(2 ** attempt)  # Exponential backoff
            continue
        raise BedrockInvocationError(...)
```

### JSON Parsing Pipeline
```python
raw_text
  → strip markdown code fences (```json...```)
  → json.loads()
  → fallback: regex for first {...} block
  → fallback: raise InvalidModelOutputError
```

### Safe Logging
```python
# LOGGED: model_id, attempt, correlation_id, operation name, latency, error category
# NOT LOGGED: user text content, profile data, Aadhaar numbers, document contents
```

---

## Language Detection

The model detects language from the input text:
- `hi` — Pure Hindi (Devanagari script)
- `en` — Pure English
- `hinglish` — Mixed Hindi vocabulary in Latin script ("mujhe chahiye", "main ek auto driver hoon")
- `other` — Neither of the above (graceful fallback)

For `other` language, the system:
1. Still attempts extraction
2. Returns what it can
3. Populates `missing_fields` for all uncertain fields
4. Frontend/API consumer should ask the user to try in Hindi or English
