# CODEX IMPLEMENTATION CONTEXT — GOVSCHEME NAVIGATOR

## ROLE
You are the primary coding agent responsible for implementing the AI/ML layer of an existing GovScheme Navigator hackathon application.

The human developer is Member 3 — AI/ML.

## PROJECT DEADLINE
Less than one week. Optimize for a reliable, demonstrable MVP first. Do not introduce unnecessary complexity.

## EXISTING APPLICATION
- Frontend already exists.
- Inspect the repository before modifying it.
- Preserve existing frontend behavior and styling.
- Integrate with the existing backend if one exists.
- If no AI backend exists, create a clean Python FastAPI service under an appropriate backend/ai directory without destroying existing code.

## REQUIRED AWS SERVICES
These are compulsory:
1. Amazon Bedrock — mandatory
2. Amazon Transcribe — mandatory
3. Amazon Polly — mandatory
4. Amazon Textract — optional/stretch, but implement a basic document extraction path if the core is stable

Supporting:
- IAM
- CloudWatch

Do not replace these with unrelated providers.

## BUSINESS GOAL
Build a vernacular, voice-first/WhatsApp-style scheme navigator for citizens such as construction workers, street vendors, and rural families.

User example:
“मैं हरियाणा में रेहड़ी लगाता हूँ और पंद्रह हजार रुपये कमाता हूँ।”

Expected structured facts:
{
  "state": "Haryana",
  "occupation": "street_vendor",
  "monthly_income": 15000
}

Support:
- Hindi
- Hinglish
- English
- graceful fallback for unsupported language

## THREE PRIMARY AI RESPONSIBILITIES

### A. Natural language understanding
Convert free-form user text into validated structured user-profile data.

Rules:
- Never invent facts.
- Unknown values must be null.
- Detect missing fields.
- Normalize occupation.
- Convert Indian numeric expressions to numbers where possible.
- Preserve uncertainty.
- Do not make eligibility decisions.

### B. Simple-language scheme explanations
The LLM receives a deterministic eligibility result and verified scheme facts.

It must:
- explain in simple Hindi/Hinglish/English
- state what matched/failed/missing
- list only verified required documents
- never invent criteria
- never change the rules-engine decision
- never promise approval, payment, or government action

### C. Application/grievance drafts
Generate structured, editable drafts.

Example complaint:
“मेरी योजना का पैसा तीन महीने से नहीं आया।”

Draft should contain:
- subject
- beneficiary/applicant information only when supplied
- scheme name only when known
- issue
- period only when supplied
- requested action
- placeholders for missing information

Never fabricate IDs, dates, payment references, addresses, registration numbers, or submission status.

## CRITICAL ARCHITECTURAL RULE
DO NOT use the LLM as the final eligibility decision maker.

Correct:
User text
-> Bedrock extraction
-> Pydantic validation
-> deterministic rules engine
-> eligibility result
-> Bedrock explanation

Incorrect:
User text
-> LLM
-> “eligible”

## RECOMMENDED STACK
- Python
- FastAPI
- boto3
- Pydantic / pydantic-settings
- pytest
- AWS Bedrock Converse API where supported
- existing frontend technology unchanged

## RECOMMENDED STRUCTURE
Adapt to the existing repository, but aim for:

backend/
  app/
    main.py
    config.py
    api/
      routes_profile.py
      routes_scheme.py
      routes_voice.py
      routes_draft.py
      routes_document.py
    schemas/
      profile.py
      scheme.py
      eligibility.py
      draft.py
      voice.py
      document.py
    ai/
      bedrock_client.py
      profile_extractor.py
      explanation_generator.py
      draft_generator.py
    aws/
      transcribe_service.py
      polly_service.py
      textract_service.py
    rules/
      engine.py
      operators.py
      schemes.json
    core/
      logging.py
      errors.py
    tests/
      test_profile_extraction.py
      test_rules_engine.py
      test_drafts.py
      test_api.py
  requirements.txt
  .env.example

If the repository already has a backend, integrate these responsibilities into its conventions instead of duplicating services.

## CONFIGURATION
Never hard-code credentials.

Create `.env.example` with:
AWS_REGION=
BEDROCK_MODEL_ID=
AWS_PROFILE=

Do not commit `.env`.

Support standard boto3 credential resolution. Local development may use:
aws configure
aws sts get-caller-identity

Production should support IAM roles/temporary credentials.

## BEDROCK IMPLEMENTATION
Create a reusable client around boto3 `bedrock-runtime`.

Use `converse()` where supported.

Use low temperature for extraction.

Implement:
- timeout/error handling
- malformed JSON handling
- bounded retry for transient/model-format errors
- safe logging
- no sensitive data in logs

Prefer structured output. If the selected model/API does not support a particular structured-output feature, implement strict JSON prompting plus Pydantic validation and robust parsing.

Model ID must be configurable.

## USER PROFILE SCHEMA
Implement a validated model with fields similar to:

state: str | None
district: str | None
occupation: controlled enum
monthly_income: float | None
income_currency: INR
family_size: int | None
children_count: int | None
children_school_going: bool | None
age: int | None
gender: str | None
is_registered_worker: bool | None
documents_available: list[str]
missing_fields: list[str]
language: hi | en | hinglish | other
confidence: dict[str, float]

Keep schemas extensible.

## RULES ENGINE
Implement deterministic, testable operators such as:
- equals
- not_equals
- less_than
- less_than_or_equal
- greater_than
- greater_than_or_equal
- in
- boolean equals

Output:
{
  "scheme_id": "...",
  "status": "eligible | not_eligible | needs_more_information",
  "matched_rules": [],
  "failed_rules": [],
  "missing_information": [],
  "required_documents": [],
  "source": {
    "title": "...",
    "url": "...",
    "version_or_checked_date": "..."
  }
}

Do not invent official scheme rules.

Seed the demo with clearly marked sample/verified scheme records. If the repository already contains scheme data, inspect and preserve it. Government scheme data must include source metadata and should be verified by the project team before demo claims.

## EXPLANATION GENERATOR
Input:
- profile
- scheme metadata
- eligibility result

Output:
- simple Hindi/English/Hinglish explanation
- no unsupported claims

Use the rules result as the source of truth.

## DRAFT GENERATOR
Implement separate application/grievance generation functions or templates.

Return structured JSON such as:
{
  "language": "en",
  "subject": "...",
  "body": "...",
  "placeholders": []
}

Allow frontend editing.

## AMAZON TRANSCRIBE
Implement an endpoint/service for Hindi voice input.

Support the practical architecture required by the chosen implementation:
audio upload -> storage/job -> Transcribe -> text.

Do not expose AWS secrets to frontend.

Handle:
- unsupported file types
- job failures
- timeout
- empty transcription

If synchronous browser audio handling is too complex for the deadline, implement a clean upload/job endpoint and document the integration.

## AMAZON POLLY
Implement:
text -> Polly -> audio bytes or stored audio reference.

Use a Hindi voice supported by the selected AWS region.

Provide text fallback when voice synthesis fails.

## AMAZON TEXTRACT
Implement a basic endpoint:
document upload -> Textract -> extracted text/fields.

Do NOT claim Textract verifies authenticity.

For demo validation, compare extracted fields only when the user supplied the expected values and mark results as extraction/legibility checks.

Use synthetic/redacted documents for tests.

## API
Expose at minimum:

GET /health

POST /api/profile/extract

POST /api/schemes/evaluate

POST /api/explanation

POST /api/drafts/grievance

POST /api/drafts/application

POST /api/voice/transcribe

POST /api/voice/synthesize

POST /api/documents/extract

Use Pydantic request/response schemas.

Return useful HTTP errors without leaking AWS internals.

## FRONTEND INTEGRATION
Inspect the existing frontend first.

Connect it to the implemented API without replacing the existing UI unnecessarily.

The demo flow should be:
1. Text or Hindi voice input
2. Extract profile
3. Show extracted fields for user confirmation/editing
4. Evaluate schemes
5. Show simple explanation
6. Show required documents
7. Generate editable grievance/application
8. Optional voice playback
9. Optional document extraction

## SECURITY
- No AWS credentials in frontend.
- No secrets in Git.
- Do not log Aadhaar/ration-card contents.
- Avoid persisting raw identity documents unless required.
- Validate upload size/type.
- Use environment variables.
- Apply least-privilege IAM guidance.
- Do not send unnecessary identity data to the LLM.

## TESTING
Create automated tests for:
1. Hindi profile extraction parsing/validation using mocked Bedrock responses.
2. Hinglish extraction.
3. English extraction.
4. Missing fields.
5. Malformed LLM JSON.
6. Rule threshold equality.
7. Rule below/above threshold.
8. Missing eligibility information.
9. Explanation cannot override eligibility.
10. Draft does not fabricate user facts.
11. API health and validation errors.

Do not make unit tests depend on live AWS calls. Mock AWS clients.

Add a small evaluation fixture with representative Hindi/Hinglish/English examples.

## OBSERVABILITY
Use structured logging.
Never log raw identity documents or sensitive personal fields.
Log:
- request/correlation ID
- operation name
- latency
- AWS operation success/failure
- model ID (not credentials)
- error category

## ERROR HANDLING
Use application-specific errors:
- AIExtractionError
- BedrockInvocationError
- InvalidModelOutputError
- RuleEvaluationError
- TranscriptionError
- SpeechSynthesisError
- DocumentExtractionError

Return safe user-facing messages.

## PERFORMANCE
- Avoid unnecessary sequential LLM calls.
- Do not call the LLM for deterministic rule comparisons.
- Reuse AWS clients where appropriate.
- Bound prompts and outputs.
- Use async/background jobs where required for Transcribe/Textract.

## DOCUMENTATION TO CREATE
At minimum:
- README.md
- docs/ARCHITECTURE.md
- docs/AWS_SETUP.md
- docs/API.md
- docs/AI_PIPELINE.md
- docs/TESTING.md
- .env.example

README must contain exact local setup commands, AWS configuration prerequisites, run commands, test commands, and frontend/backend integration instructions.

## DEMO ACCEPTANCE CRITERIA

### Scenario 1
Input:
“मैं हरियाणा में रेहड़ी लगाता हूँ और पंद्रह हजार रुपये कमाता हूँ।”

System extracts:
state=Haryana
occupation=street_vendor
monthly_income=15000

### Scenario 2
User provides insufficient information.
System asks a concise follow-up instead of guessing.

### Scenario 3
Eligibility is evaluated by the rules engine.
LLM explanation exactly reflects the engine result.

### Scenario 4
User says:
“मेरी योजना का पैसा तीन महीने से नहीं आया।”

System creates an editable grievance draft with placeholders for missing details.

### Scenario 5
Hindi voice:
Transcribe -> profile extraction -> rules -> explanation -> Polly audio.

### Scenario 6
Document:
Textract -> extracted text -> basic field/legibility check.

## EXECUTION ORDER
Follow this order:
1. Inspect repository and existing frontend/backend.
2. Identify current APIs, environment setup, and package manager.
3. Create/extend backend architecture.
4. Implement schemas.
5. Implement Bedrock client.
6. Implement profile extraction.
7. Implement deterministic rules engine.
8. Implement explanation generator.
9. Implement draft generator.
10. Integrate Transcribe.
11. Integrate Polly.
12. Implement Textract if core is stable.
13. Integrate frontend.
14. Add tests.
15. Run lint/type/test/build checks.
16. Fix failures.
17. Produce documentation and `.env.example`.

## DO NOT
- Do not rewrite the whole existing frontend without need.
- Do not invent official government scheme rules.
- Do not use the LLM as an eligibility authority.
- Do not add unnecessary agents.
- Do not add a vector database/RAG unless existing project requirements genuinely require it.
- Do not hard-code AWS secrets.
- Do not claim document authenticity from OCR.
- Do not claim government portal submission unless a real submission integration exists.
- Do not leave core features as TODO placeholders.

## FINAL DELIVERABLE
When implementation is complete:
1. Ensure the repository runs.
2. Ensure tests pass.
3. Ensure frontend can invoke the AI APIs.
4. Ensure AWS configuration is documented.
5. Ensure `.env.example` exists.
6. Summarize changed files.
7. Summarize implemented AI/AWS features.
8. Give exact commands to run locally.
9. List any genuinely remaining limitations.

## IMPORTANT AGENT BEHAVIOR
Do not stop after creating a plan. Inspect, implement, test, debug, and finish the working code.

When an existing implementation conflicts with this context, preserve working application behavior and integrate cleanly. Ask for clarification only when a required secret, repository dependency, or genuinely ambiguous product requirement makes implementation impossible; otherwise make the safest reasonable engineering decision and document it.
