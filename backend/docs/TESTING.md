# Testing Guide — GovScheme Navigator

## Test Philosophy

All tests mock AWS clients — **no live AWS calls are made**.
This means tests run offline, in CI/CD, and without AWS credentials.

## Test Coverage

| Test File | What it tests |
|-----------|---------------|
| `test_profile_extraction.py` | NLU extraction (Hindi/Hinglish/English/missing/malformed) |
| `test_rules_engine.py` | All operators + eligibility evaluation scenarios |
| `test_drafts.py` | Draft generation — no fabricated facts, placeholders |
| `test_api.py` | HTTP endpoints, validation errors, OpenAPI schema |

## Running Tests

### Full test suite:
```bash
cd backend
pytest tests/ -v
```

### With coverage:
```bash
pytest tests/ -v --cov=app --cov-report=term-missing
```

### Individual test files:
```bash
pytest tests/test_rules_engine.py -v
pytest tests/test_profile_extraction.py -v
pytest tests/test_drafts.py -v
pytest tests/test_api.py -v
```

### Run a specific test:
```bash
pytest tests/test_rules_engine.py::TestRulesEngine::test_street_vendor_is_eligible -v
```

## Mock Strategy

### Mocking Bedrock
`MockBedrockClient` in `tests/conftest.py` implements the same interface as `BedrockClient`:
```python
mock_client = make_mock_client(response_json={...})
profile = extract_profile(text="...", client=mock_client)
```

For API endpoint tests, use FastAPI `dependency_overrides`:
```python
app.dependency_overrides[get_bedrock_client] = lambda: mock_client
```

### No mock needed for rules engine
The rules engine is fully deterministic and calls no AWS services.
Pass profile dicts directly:
```python
results = evaluate_profile(profile={"occupation": "street_vendor", ...})
```

## Test Scenarios (from CODEX spec)

| # | Scenario | Test Location |
|---|----------|---------------|
| 1 | Hindi extraction: state + occupation + income | `test_profile_extraction.py::TestHindiExtraction` |
| 2 | Hinglish extraction | `test_profile_extraction.py::TestHinglishExtraction` |
| 3 | English extraction | `test_profile_extraction.py::TestEnglishExtraction` |
| 4 | Missing fields → listed, not invented | `test_profile_extraction.py::TestMissingFields` |
| 5 | Malformed LLM JSON → handled gracefully | `test_profile_extraction.py::TestMalformedLLMOutput` |
| 6 | Rule threshold equality (`lte` at boundary) | `test_rules_engine.py::TestOperators` |
| 7 | Rule below/above threshold | `test_rules_engine.py::TestRulesEngine` |
| 8 | Missing eligibility info → `needs_more_information` | `test_rules_engine.py::TestRulesEngine` |
| 9 | Explanation cannot override eligibility | `test_drafts.py` (explanation mirrors rules result) |
| 10 | Draft does not fabricate user facts | `test_drafts.py::TestGrievanceDraft` |
| 11 | API health + validation errors | `test_api.py::TestHealthEndpoint` + `TestValidationErrors` |

## Adding New Tests

### For a new scheme:
1. Add the scheme to `app/rules/schemes.json`
2. Add a test case in `test_rules_engine.py::TestRulesEngine`
3. Test eligible + not_eligible + missing_info cases

### For a new operator:
1. Add to `app/rules/operators.py` and `OPERATOR_MAP`
2. Add tests in `test_rules_engine.py::TestOperators`

### For a new extraction field:
1. Add to `app/schemas/profile.py::UserProfile`
2. Update the system prompt in `app/ai/profile_extractor.py`
3. Add test case with mocked Bedrock response

## Evaluation Fixtures

The `conftest.py` provides evaluation fixtures:
- `hindi_profile_response` — Hindi street vendor (Scenario 1)
- `hinglish_profile_response` — Hinglish auto driver
- `english_profile_response` — English construction worker
- `missing_fields_profile_response` — Nearly empty input
- `street_vendor_profile_dict` — Ready-to-evaluate profile dict
- `unbanked_profile_dict` — PMJDY eligible profile

## Smoke Test (with real AWS)

To run a manual smoke test with live AWS credentials:

```bash
# Start the server
uvicorn app.main:app --reload

# In another terminal:
# 1. Health check
curl http://localhost:8000/health

# 2. Extract profile
curl -X POST http://localhost:8000/api/profile/extract \
  -H "Content-Type: application/json" \
  -d '{"text": "मैं हरियाणा में रेहड़ी लगाता हूँ और पंद्रह हजार रुपये कमाता हूँ।"}'

# 3. Evaluate schemes (use profile from step 2)
curl -X POST http://localhost:8000/api/schemes/evaluate \
  -H "Content-Type: application/json" \
  -d '{"profile": {"occupation": "street_vendor", "monthly_income": 15000}}'

# 4. Synthesize Hindi speech
curl -X POST http://localhost:8000/api/voice/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text": "आप इस योजना के लिए पात्र हैं।", "language": "hi"}'
```
