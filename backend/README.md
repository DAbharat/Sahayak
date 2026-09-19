# Sahayak — GovScheme Navigator

**AI-powered vernacular government scheme navigator** for citizens such as construction workers, street vendors, and rural families.

Built by **Member 3 (AI/ML)** as part of the GovScheme Navigator hackathon team.

---

## What it does

A citizen speaks or types in **Hindi, Hinglish, or English**:

> "मैं हरियाणा में रेहड़ी लगाता हूँ और पंद्रह हजार रुपये कमाता हूँ।"

The system:
1. Extracts structured facts (state, occupation, income) using **Amazon Bedrock**
2. Evaluates eligibility via a **deterministic rules engine** (NOT the LLM)
3. Generates a simple explanation via Bedrock
4. Suggests required documents
5. Creates an editable application/grievance draft
6. Supports **Hindi voice input** via Amazon Transcribe
7. Provides **Hindi voice output** via Amazon Polly
8. Extracts document text via **Amazon Textract**

---

## Architecture

```
Citizen (Voice/Text)
  → FastAPI AI Backend
      → Amazon Bedrock (Claude) — NLU extraction, explanations, drafts
      → Pydantic — Structured profile validation
      → Deterministic Rules Engine — Eligibility (NO LLM)
      → Amazon Transcribe — Voice → Text (Hindi)
      → Amazon Polly — Text → Voice (Hindi)
      → Amazon Textract — Document OCR
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full diagram.

---

## Prerequisites

- Python 3.11+
- AWS account with access to:
  - Amazon Bedrock (Claude model enabled)
  - Amazon Transcribe
  - Amazon Polly
  - Amazon Textract
  - Amazon S3 (for audio/document uploads)
- AWS CLI configured (`aws configure`)

---

## Local Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd Sahayak/backend
```

### 2. Create a virtual environment

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment

```bash
cp .env.example .env
# Edit .env with your AWS credentials and settings
```

Key settings in `.env`:
```
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=google.gemma-3-4b-it-v1:0
POLLY_VOICE_ID=Aditi
TRANSCRIBE_S3_BUCKET=your-bucket-name
TEXTRACT_S3_BUCKET=your-bucket-name
```

### 5. Verify AWS access

```bash
aws sts get-caller-identity
aws bedrock list-foundation-models --region us-east-1
```

---

## Quick Start — Streamlit Web Application

The interactive web application includes all 6 features (Profile Extraction, Eligibility Rules Engine, Multilingual Explanation, Voice I/O, Application/Grievance Drafts, and Document OCR):

```bash
cd backend
# 1. Activate virtual environment
.venv\Scripts\activate      # Windows
# or source .venv/bin/activate # Linux/macOS

# 2. Run Streamlit (Mock Mode is ON by default — 100% offline & free!)
streamlit run streamlit_app.py
```

The web app will automatically open at: **http://localhost:8501**

### Streamlit Features:
- 📋 **Tab 1: Profile Extraction** — Natural Hindi/Hinglish/English input with quick demo presets
- ✅ **Tab 2: Scheme Eligibility** — Deterministic rules evaluation with color-coded status badges
- 💬 **Tab 3: Simple Explanation** — Friendly non-technical explanation + Polly voice playback
- 🎤 **Tab 4: Voice Assistant** — Audio upload & demo transcription via Amazon Transcribe
- 📝 **Tab 5: Draft Generator** — Formal application & grievance letters with copy/download
- 📄 **Tab 6: Document OCR** — Textract key-value extraction & basic legibility check
- 🛡️ **Built-in Safety**: Mock mode by default, session budget monitor (10 requests max), and zero PII persistence.

---

## Run the FastAPI Backend (Optional / For API Consumers)

If you wish to run the standalone REST API:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The API is now available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health check**: http://localhost:8000/health

---

## Run Tests

```bash
cd backend
pytest tests/ -v
```

Tests use **mocked AWS clients** — no live AWS calls required:

```bash
# Run specific test files
pytest tests/test_rules_engine.py -v
pytest tests/test_profile_extraction.py -v
pytest tests/test_drafts.py -v
pytest tests/test_api.py -v
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/profile/extract` | Extract profile from Hindi/English text |
| GET | `/api/schemes/list` | List all available schemes |
| POST | `/api/schemes/evaluate` | Evaluate eligibility (deterministic) |
| POST | `/api/explanation` | Generate simple explanation via Bedrock |
| POST | `/api/drafts/grievance` | Generate grievance draft |
| POST | `/api/drafts/application` | Generate application draft |
| POST | `/api/voice/transcribe` | Audio → text (Amazon Transcribe) |
| POST | `/api/voice/synthesize` | Text → audio (Amazon Polly) |
| POST | `/api/documents/extract` | Document OCR (Amazon Textract) |

Full API reference: [docs/API.md](docs/API.md)

---

## Demo Scenarios

### Scenario 1: Hindi extraction
```
Input: "मैं हरियाणा में रेहड़ी लगाता हूँ और पंद्रह हजार रुपये कमाता हूँ।"
Output: state=Haryana, occupation=street_vendor, monthly_income=15000
```

### Scenario 2: Incomplete input
```
Input: "मजदूर हूँ"
Output: missing_fields=["state", "monthly_income", "age", ...]
System asks follow-up questions — never guesses.
```

### Scenario 3: Eligibility evaluation
```
Profile → Rules Engine → eligible/not_eligible/needs_more_information
LLM explains the result — cannot change the decision.
```

### Scenario 4: Grievance draft
```
Input: "मेरी योजना का पैसा तीन महीने से नहीं आया।"
Output: Editable letter with [APPLICANT_NAME], [DISTRICT] placeholders
```

---

## AWS Setup

See [docs/AWS_SETUP.md](docs/AWS_SETUP.md) for complete IAM policy and AWS configuration instructions.

---

## Seeded Schemes (DEMO DATA)

The following schemes are pre-loaded for demo:
1. **PM SVANidhi** — Street vendor micro-credit
2. **PMJDY** — Jan Dhan bank account
3. **PMAY-U** — Urban housing subsidy
4. **PM Vishwakarma** — Artisan support
5. **MGNREGA** — Rural employment guarantee

> ⚠️ Scheme eligibility criteria are marked as **DEMO/SAMPLE data**. The project team must verify all criteria against official government sources before any public claims.

---

## Security Notes

- No AWS credentials in frontend
- No secrets committed to Git
- Aadhaar/identity documents are never logged
- All uploads are size-validated (max 10 MB)
- LLM never makes final eligibility decisions
- Textract does NOT verify document authenticity

---

## Known Limitations

1. **No production database** — scheme data is file-based JSON. For production, move to DynamoDB or PostgreSQL.
2. **Transcribe requires S3** — Audio files must be uploaded to S3 before transcription.
3. **Demo scheme data** — Eligibility criteria must be verified by subject matter experts.
4. **Hindi Polly voice** — `Aditi` is standard quality. `Kajal` (neural) is available only in select regions.
5. **No authentication** — This demo has no user auth. Add API keys or Cognito for production.
