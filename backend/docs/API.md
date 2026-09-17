# API Reference — GovScheme Navigator

Base URL: `http://localhost:8000`

---

## GET /health

Health check endpoint.

**Response 200:**
```json
{
  "status": "ok",
  "service": "GovScheme Navigator AI Backend",
  "version": "1.0.0"
}
```

---

## POST /api/profile/extract

Extract a structured user profile from free-form Hindi/Hinglish/English text.

**Request:**
```json
{
  "text": "मैं हरियाणा में रेहड़ी लगाता हूँ और पंद्रह हजार रुपये कमाता हूँ।"
}
```

**Response 200:**
```json
{
  "profile": {
    "state": "Haryana",
    "district": null,
    "occupation": "street_vendor",
    "monthly_income": 15000,
    "income_currency": "INR",
    "family_size": null,
    "children_count": null,
    "children_school_going": null,
    "age": null,
    "gender": null,
    "is_registered_worker": null,
    "caste_category": null,
    "has_bank_account": null,
    "documents_available": [],
    "missing_fields": ["age", "family_size", "has_bank_account"],
    "language": "hi",
    "confidence": {
      "state": 0.95,
      "occupation": 0.97,
      "monthly_income": 0.93
    },
    "raw_input": null
  },
  "correlation_id": "abc123def456"
}
```

**Errors:**
- `422` — Text is empty or too long (>5000 chars)
- `422` — AI failed to parse the text
- `503` — Bedrock unavailable

---

## GET /api/schemes/list

List all available government schemes.

**Response 200:**
```json
{
  "schemes": [
    {
      "scheme_id": "pm_svanidhi",
      "name_en": "PM SVANidhi — PM Street Vendor's AtmaNirbhar Nidhi",
      "name_hi": "पीएम स्वनिधि",
      "description_en": "...",
      "description_hi": "...",
      "rules": [...],
      "required_documents": ["Aadhaar card", "..."],
      "source": {
        "title": "PM SVANidhi Official Portal",
        "url": "https://pmsvanidhi.mohua.gov.in/",
        "version_or_checked_date": "2024-01-01"
      },
      "is_demo_data": true
    }
  ],
  "total": 5
}
```

---

## POST /api/schemes/evaluate

Evaluate a user profile against government schemes using the deterministic rules engine.

**⚠️ No LLM involved. Results are fully deterministic.**

**Request:**
```json
{
  "profile": {
    "state": "Haryana",
    "occupation": "street_vendor",
    "monthly_income": 15000
  },
  "scheme_ids": ["pm_svanidhi"]
}
```
> `scheme_ids` is optional. If omitted, all schemes are evaluated.

**Response 200:**
```json
{
  "results": [
    {
      "scheme_id": "pm_svanidhi",
      "scheme_name_en": "PM SVANidhi",
      "scheme_name_hi": "पीएम स्वनिधि",
      "status": "eligible",
      "matched_rules": [
        {
          "field": "occupation",
          "operator": "in",
          "expected_value": ["street_vendor", "self_employed"],
          "actual_value": "street_vendor",
          "passed": true,
          "description": "Must be a street vendor"
        }
      ],
      "failed_rules": [],
      "missing_information": [],
      "required_documents": ["Aadhaar card", "Vendor Certificate"],
      "source": {
        "title": "PM SVANidhi Official Portal",
        "url": "https://pmsvanidhi.mohua.gov.in/",
        "version_or_checked_date": "2024-01-01"
      }
    }
  ],
  "correlation_id": "abc123def456"
}
```

**Status values:**
| Status | Meaning |
|--------|---------|
| `eligible` | All rules pass |
| `not_eligible` | One or more rules fail |
| `needs_more_information` | Required profile fields are null |

---

## POST /api/explanation

Generate a simple-language explanation of an eligibility result.

**⚠️ The LLM explanation mirrors the rules engine result — it cannot change the decision.**

**Request:**
```json
{
  "profile": { "state": "Haryana", "occupation": "street_vendor", "monthly_income": 15000 },
  "eligibility": {
    "scheme_id": "pm_svanidhi",
    "scheme_name_en": "PM SVANidhi",
    "scheme_name_hi": "पीएम स्वनिधि",
    "status": "eligible",
    "matched_rules": [...],
    "failed_rules": [],
    "missing_information": [],
    "required_documents": ["Aadhaar card"],
    "source": { "title": "...", "url": "...", "version_or_checked_date": "2024-01-01" }
  },
  "language": "hi"
}
```

**Response 200:**
```json
{
  "explanation": "✅ Eligibility status: ELIGIBLE\n\nआप PM SVANidhi योजना के लिए पात्र हैं...",
  "scheme_id": "pm_svanidhi",
  "status": "eligible",
  "language": "hi",
  "correlation_id": "abc123def456"
}
```

---

## POST /api/drafts/grievance

Generate an editable grievance letter draft.

**Request:**
```json
{
  "user_text": "मेरी योजना का पैसा तीन महीने से नहीं आया।",
  "draft_type": "grievance",
  "language": "hi",
  "scheme_name": "PM SVANidhi",
  "profile_context": null
}
```

**Response 200:**
```json
{
  "draft_type": "grievance",
  "language": "hi",
  "subject": "Grievance Regarding PM SVANidhi",
  "body": "To,\nThe Competent Authority,\n[DEPARTMENT_NAME]\n[DISTRICT], [STATE]\n\n...\nI, [APPLICANT_NAME], wish to inform that...",
  "placeholders": ["DEPARTMENT_NAME", "DISTRICT", "STATE", "APPLICANT_NAME", "DATE"],
  "disclaimer": "This draft was generated as a starting point. Please review and fill in all [PLACEHOLDER] fields before submitting.",
  "correlation_id": "abc123def456"
}
```

---

## POST /api/drafts/application

Same schema as `/api/drafts/grievance` but `draft_type` is `"application"`.

---

## POST /api/voice/transcribe

Convert an uploaded audio file to text using Amazon Transcribe.

**Request:** `multipart/form-data`
- `file`: Audio file (WAV, MP3, FLAC, OGG, WebM, MP4)
- `language_code`: AWS language code (default: `hi-IN`)

**Response 200:**
```json
{
  "transcript": "मैं हरियाणा में रेहड़ी लगाता हूँ।",
  "language_code": "hi-IN",
  "job_name": "govscheme-abc123-1694000000",
  "confidence": 0.94,
  "correlation_id": "abc123def456"
}
```

**Errors:**
- `415` — Unsupported audio format
- `413` — File too large (>10 MB)
- `502` — Transcription failed or timed out

---

## POST /api/voice/synthesize

Convert text to Hindi speech using Amazon Polly.

**Request:**
```json
{
  "text": "आप PM SVANidhi के लिए पात्र हैं।",
  "language": "hi",
  "voice_id": null
}
```

**Response 200:**
```json
{
  "audio_base64": "//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA...",
  "content_type": "audio/mpeg",
  "text_fallback": "आप PM SVANidhi के लिए पात्र हैं।",
  "voice_id": "Aditi",
  "synthesis_succeeded": true,
  "correlation_id": "abc123def456"
}
```

> If synthesis fails, `audio_base64` is null and `synthesis_succeeded` is false. The `text_fallback` is always provided.

---

## POST /api/documents/extract

Extract text from a document using Amazon Textract.

**Request:** `multipart/form-data`
- `file`: Document image (JPEG, PNG, TIFF) or PDF
- `expected_fields`: (optional) JSON string for legibility check

**Response 200:**
```json
{
  "raw_text": "Name: Ramu Kumar\nDate of Birth: 01/01/1985\n...",
  "key_value_pairs": [
    { "key": "Name", "value": "Ramu Kumar", "confidence": 0.99 },
    { "key": "Date of Birth", "value": "01/01/1985", "confidence": 0.97 }
  ],
  "field_checks": [],
  "page_count": 1,
  "authenticity_disclaimer": "Document extraction is for legibility and field-reading only. This system does NOT verify document authenticity...",
  "correlation_id": "abc123def456"
}
```

---

## Error Response Format

All errors return:
```json
{
  "error": "ErrorClassName",
  "message": "User-friendly message. No AWS internals exposed."
}
```

| HTTP Code | Error Class | Meaning |
|-----------|-------------|---------|
| 422 | AIExtractionError | Profile extraction failed |
| 422 | DocumentExtractionError | Document processing failed |
| 413 | FileTooLargeError | Upload exceeds 10 MB |
| 415 | UnsupportedFileTypeError | File format not supported |
| 503 | BedrockInvocationError | Bedrock temporarily unavailable |
| 502 | InvalidModelOutputError | Bedrock returned malformed output |
| 502 | TranscriptionError | Transcribe failed |
| 502 | SpeechSynthesisError | Polly failed |
| 500 | RuleEvaluationError | Rules engine configuration error |
