# Architecture — GovScheme Navigator

## System Overview

```
Citizen (Hindi/Hinglish/English Voice or Text)
        │
        ▼
┌─────────────────────────────────────────────────────┐
│              FastAPI AI Backend                      │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │           Text Input Path                    │  │
│  │                                              │  │
│  │  POST /api/profile/extract                   │  │
│  │    → Amazon Bedrock (Converse API)           │  │
│  │    → Pydantic UserProfile validation        │  │
│  │    → missing_fields populated               │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │           Voice Input Path                   │  │
│  │                                              │  │
│  │  POST /api/voice/transcribe                  │  │
│  │    → Audio bytes → S3 upload                │  │
│  │    → Amazon Transcribe job                  │  │
│  │    → Transcript text                        │  │
│  │    → Feed to /api/profile/extract           │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │           Eligibility Path (NO LLM)          │  │
│  │                                              │  │
│  │  POST /api/schemes/evaluate                  │  │
│  │    → UserProfile dict                       │  │
│  │    → Deterministic Rules Engine             │  │
│  │    → Compare profile fields vs scheme rules │  │
│  │    → EligibilityResult                      │  │
│  │      (eligible/not_eligible/needs_more_info)│  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │           Explanation Path                   │  │
│  │                                              │  │
│  │  POST /api/explanation                       │  │
│  │    → EligibilityResult (source of truth)    │  │
│  │    → Amazon Bedrock                         │  │
│  │    → Simple Hindi/English/Hinglish text     │  │
│  │    NOTE: LLM CANNOT override the result     │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │           Voice Output Path                  │  │
│  │                                              │  │
│  │  POST /api/voice/synthesize                  │  │
│  │    → Explanation text                       │  │
│  │    → Amazon Polly (Aditi/Kajal voice)       │  │
│  │    → Base64 MP3 audio                       │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │           Draft Generation Path              │  │
│  │                                              │  │
│  │  POST /api/drafts/grievance                  │  │
│  │  POST /api/drafts/application               │  │
│  │    → Amazon Bedrock                         │  │
│  │    → Structured draft with [PLACEHOLDER]    │  │
│  │    NOTE: No fabricated IDs or dates         │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │           Document Path                      │  │
│  │                                              │  │
│  │  POST /api/documents/extract                 │  │
│  │    → Image/PDF bytes → Amazon Textract      │  │
│  │    → Raw text + key-value pairs             │  │
│  │    NOTE: Legibility check ONLY              │  │
│  │          NOT authenticity verification      │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Critical Design Principles

### 1. LLM is NOT the eligibility authority

```
CORRECT:
  User text → Bedrock extraction → Pydantic validation
  → Deterministic rules engine → EligibilityResult
  → Bedrock explanation (mirrors result)

INCORRECT:
  User text → LLM → "eligible"
```

### 2. Never invent facts

- Unknown profile fields → `null` (never guessed)
- Unknown draft details → `[PLACEHOLDER]` (never fabricated)
- Textract → text extraction only (never authenticity claim)

### 3. Structured error hierarchy

All errors return safe user-facing messages without exposing AWS internals:
- `AIExtractionError` → 422
- `BedrockInvocationError` → 503
- `InvalidModelOutputError` → 502
- `RuleEvaluationError` → 500
- `TranscriptionError` → 502
- `SpeechSynthesisError` → 502
- `DocumentExtractionError` → 422

## Module Structure

```
backend/
  app/
    main.py             # FastAPI app, CORS, router registration
    config.py           # pydantic-settings from .env
    api/
      routes_health.py     # GET /health
      routes_profile.py    # POST /api/profile/extract
      routes_scheme.py     # GET /api/schemes/list, POST /api/schemes/evaluate
      routes_explanation.py # POST /api/explanation
      routes_draft.py      # POST /api/drafts/grievance, /application
      routes_voice.py      # POST /api/voice/transcribe, /synthesize
      routes_document.py   # POST /api/documents/extract
    schemas/
      profile.py      # UserProfile, OccupationEnum, LanguageEnum
      scheme.py       # SchemeRecord, SchemeRule, SchemeSource
      eligibility.py  # EligibilityResult, EligibilityStatus
      draft.py        # DraftRequest, DraftResponse
      voice.py        # TranscribeResponse, SynthesizeRequest/Response
      document.py     # DocumentExtractResponse, ExtractedField
    ai/
      bedrock_client.py       # Reusable Bedrock client (Converse API, retry, JSON parse)
      profile_extractor.py    # Text → UserProfile via Bedrock
      explanation_generator.py # EligibilityResult → explanation via Bedrock
      draft_generator.py       # DraftRequest → DraftResponse via Bedrock
    aws/
      transcribe_service.py   # Audio → S3 → Transcribe → transcript
      polly_service.py        # Text → Polly → base64 MP3
      textract_service.py     # Image/PDF → Textract → text + KV pairs
    rules/
      engine.py       # evaluate_profile(), evaluate_scheme()
      operators.py    # Pure operator functions (equals, lt, gt, in, ...)
      schemes.json    # Seeded scheme definitions (DEMO data)
    core/
      logging.py      # Structured JSON logging (no PII)
      errors.py       # Custom exceptions + FastAPI handlers
  tests/
    conftest.py               # Shared fixtures, mock clients
    test_profile_extraction.py
    test_rules_engine.py
    test_drafts.py
    test_api.py
  requirements.txt
  .env.example
  pyproject.toml
```
