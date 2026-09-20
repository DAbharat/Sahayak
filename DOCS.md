# Sahayak API & Architecture Documentation

## 1. Project Overview

Sahayak is a government-scheme assistance platform designed to help citizens (particularly construction workers, street vendors, etc.) understand which schemes they may be eligible for, and generate grievances or applications automatically. 

It is a multi-service platform that accepts natural language input (Hindi, Hinglish, English) and uses a deterministic rules engine for eligibility, combined with Amazon Bedrock for NLU profile extraction and explanation.

## 2. System Architecture

The system consists of four primary components:

1. **Go Backend (API Gateway & Core Logic)**: Handles user authentication, authorization, profile management, and orchestrates scheme eligibility and grievance workflows.
2. **Java Backend (Ingestion Service)**: Owns scheme knowledge, rules ingestion, and verification workflows.
3. **Python/FastAPI Service (AI Backend)**: Handles AI tasks, including natural language profile extraction (via Bedrock), deterministic rules evaluation, explanation generation, audio translation (Transcribe/Polly), and document OCR (Textract).
4. **React Frontend**: User-facing single-page application.

```text
HTTP Request
    ↓
Go Router (Gorilla Mux)
    ↓
Go Handler
    ↓
Go Service  <────────> Python FastAPI (AI/Rules)
    ↓
Go Repository
    ↓
sqlc
    ↓
PostgreSQL
```

## 3. Service Responsibilities

* **Go Backend**: User accounts, JWT session management, Cedar authorization, CRUD for profiles, simple scheme CRUD, and orchestrating requests to the AI service.
* **Java Backend**: Complex scheme ingestion, rules management, and verification/approval workflows.
* **Python Backend**: Pydantic validation, LLM prompting (Bedrock), AWS Transcribe/Polly integrations, document parsing, and the deterministic scheme evaluation engine.
* **PostgreSQL**: Stores accounts, profiles, schemes, rules, and refresh tokens.

## 4. Environment & Ports

| Service | Technology | Host Port | Container Port | Purpose |
| ------- | ---------- | --------: | -------------: | ------- |
| Go Backend | Go 1.21+ | 9000 | N/A | Main API Gateway |
| Python AI | FastAPI | 8000 | N/A | AI / NLP Services |
| Java Backend | Spring Boot | 8080 (assumed) | N/A | Scheme Ingestion |
| Frontend | React (Vite) | 5173 | N/A | Web Interface |
| Database | PostgreSQL 17 | 4321 | 5432 | Primary Datastore |

*(Note: Only PostgreSQL is currently containerized in `docker-compose.yml`.)*

## 5. Authentication

The system uses standard JWT authentication with a short-lived access token and a long-lived refresh token stored in the database.

**Flow:**
```text
Register (POST /api/register)
   ↓
Login (POST /api/login)
   ↓
Access Token (JWT) + Refresh Token (Database Hash)
   ↓
Authenticated Request (Header: Authorization: Bearer <token>)
   ↓
JWT Middleware (`middleware.AuthMiddleware`)
   ↓
Context: userID
   ↓
Handler
```
* **Password Hashing**: Done before DB insertion.
* **Refresh Tokens**: Hashed and stored in `refresh_tokens` table.
* **Middleware**: Validates the token signature and expiration, injecting `userID` into the HTTP request context.

## 6. Authorization

Authorization is handled entirely separately from Authentication using **Cedar Policies** (`cedar-go`). 

* **Authentication** = Who is the user? (Handled by JWT Middleware)
* **Authorization** = Is this user allowed to perform this action? (Handled by `Authorizer`)

**Cedar Schema:**
* **Principals**: `User`
* **Actions**: `ReadProfile`, `UpdateProfile`
* **Resources**: `Profile`
* **Condition**: A `User` can only read/update a `Profile` if the `User`'s ID matches the `Profile`'s `owner` attribute.

**Flow:**
When an endpoint is hit (e.g., `GET /api/accounts/{accountID}/profile`), the handler extracts the `userID` from the context (Authentication) and the `accountID` from the path parameter, then calls `authorizer.CanReadProfile(userID, accountID)`. If the Cedar engine returns `Deny`, the endpoint returns `403 Forbidden`.

## 7. API Overview

The Go backend serves as the primary entry point for all frontend requests, wrapping its own database interactions and forwarding complex AI tasks to the Python backend.

## 8. Account APIs

**POST /api/register**
* **Auth**: None
* **Request Body**:
  * `email` (string, required)
  * `password` (string, required)
* **Response (201 Created)**:
  * `id` (int64)
  * `email` (string)
* **Errors**: 
  * 400 Bad Request (Invalid email/password)
  * 409 Conflict (Duplicate email)

**POST /api/login**
* **Auth**: None
* **Request Body**:
  * `email` (string, required)
  * `password` (string, required)
* **Response (200 OK)**:
  * `id` (int64)
  * `email` (string)
  * `access_token` (string)
  * `refresh_token` (string)
* **Errors**: 401 Unauthorized

**POST /api/auth/refresh**
* **Auth**: None
* **Request Body**:
  * `refresh_token` (string, required)
* **Response (200 OK)**:
  * `access_token` (string)
* **Errors**: 401 Unauthorized (Invalid/expired token)

## 9. Profile APIs

**POST /api/accounts/{accountID}/profile/create**
* **Auth**: Bearer Token
* **Authorization**: Cedar (User must own `accountID`)
* **Request Body**: `CreateProfileRequest` (See DTO Reference)
* **Response (201 Created)**: `ProfileResponse`
* **Errors**: 400 Bad Request, 401 Unauthorized

**GET /api/accounts/{accountID}/profile**
* **Auth**: Bearer Token
* **Authorization**: Cedar (ReadProfile)
* **Response (200 OK)**: `ProfileResponse`
* **Errors**: 404 Not Found, 403 Forbidden

**PUT /api/accounts/{accountID}/profile/update**
* **Auth**: Bearer Token
* **Authorization**: Cedar (UpdateProfile)
* **Request Body**: `CreateProfileRequest`
* **Response (200 OK)**: `ProfileResponse`
* **Errors**: 404 Not Found, 403 Forbidden

## 10. Scheme APIs

**POST /api/schemes/create**
* **Auth**: None
* **Request Body**: `name`, `description`, `state`, `source_url`, `last_verified_at`
* **Response (201 Created)**: `SchemeResponse`

**GET /api/schemes**
* **Auth**: None
* **Query Params**: `state` (optional string)
* **Response (200 OK)**: Array of `SchemeResponse`

**GET /api/schemes/{schemeID}**
* **Auth**: None
* **Response (200 OK)**: `SchemeResponse`

## 11. Eligibility APIs

**POST /api/eligibility/check**
* **Auth**: Bearer Token
* **Request Body**:
  * `account_id` (int64)
  * `scheme_id` (int64)
* **Response (200 OK)**:
  * `scheme_id` (int64)
  * `scheme_name` (string)
  * `eligible` (bool)
  * `reasons` (array of strings, optional)

## 12. Grievance APIs

**POST /api/grievance/generate**
* **Auth**: Bearer Token
* **Request Body**:
  * `scheme_id` (int64)
  * `user_text` (string)
  * `draft_type` (string: "grievance" or "application")
  * `language` (string: "en", "hi", "hinglish")
  * `scheme_name` (string)
  * `profile_context` (Object containing state, occupation, monthly_income, age, gender, children_count)
* **Internal Behavior**: Go constructs this payload and forwards it to Python (`POST /api/drafts/grievance`), then returns Python's result.
* **Response (200 OK)**: `GenerateGrievanceResponse` (See DTOs)

## 13. AI/FastAPI APIs

The Python backend exposes internal APIs (called by Go or directly).

**POST /api/profile/extract**
* **Request**: `{"text": "Hindi/English text"}`
* **Response**: `ProfileExtractResponse` containing a structured `UserProfile` (all fields nullable).

**POST /api/schemes/evaluate**
* **Request**: `{"profile": UserProfile, "scheme_ids": ["1"]}`
* **Response**: `SchemeEvaluateResponse` containing `EligibilityResult` (status: eligible, not_eligible, needs_more_information).

**POST /api/drafts/grievance**
**POST /api/drafts/application**
* **Request**: `DraftRequest`
* **Response**: `DraftResponse` with letter placeholders.

## 14. Complete Route Reference

### Go Backend Routes
| Method | Path | Auth | Authorization | Request | Response | Errors | Service |
| ------ | ---- | ---- | ------------- | ------- | -------- | ------ | ------- |
| GET | `/api/health` | No | None | None | `{status: "ok"}` | 500 | Health |
| POST | `/api/register` | No | None | `CreateAccountRequest` | `CreateAccountResponse` | 400, 409 | Account |
| POST | `/api/login` | No | None | `LoginAccountRequest` | `LoginAccountResponse` | 401 | Account |
| POST | `/api/auth/refresh` | No | None | `RefreshTokenRequest`| `RefreshTokenResponse`| 400, 401 | Account |
| POST | `/api/accounts/{accountID}/profile/create` | Yes | Cedar `UpdateProfile` | `CreateProfileRequest` | `ProfileResponse` | 400, 401, 403 | Profile |
| GET | `/api/accounts/{accountID}/profile` | Yes | Cedar `ReadProfile` | None | `ProfileResponse` | 401, 403, 404 | Profile |
| PUT | `/api/accounts/{accountID}/profile/update` | Yes | Cedar `UpdateProfile` | `CreateProfileRequest` | `ProfileResponse` | 400, 401, 403, 404 | Profile |
| POST | `/api/schemes/create` | No | None | `CreateSchemeRequest`| `SchemeResponse` | 400 | Scheme |
| GET | `/api/schemes` | No | None | `?state=` | `[]SchemeResponse` | 500 | Scheme |
| GET | `/api/schemes/{schemeID}` | No | None | None | `SchemeResponse` | 400, 404 | Scheme |
| GET | `/api/schemes/{schemeID}/rules` | No | None | None | `[]SchemeRule` | 400 | SchemeRule |
| GET | `/api/scheme-rules/{ruleID}` | No | None | None | `SchemeRule` | 400, 404 | SchemeRule |
| POST | `/api/eligibility/check` | Yes | None | `EligibilityRequest` | `EligibilityResponse` | 400, 404 | Eligibility |
| POST | `/api/grievance/generate` | Yes | None | `GrievanceRequest` | `GenerateGrievanceResponse` | 400, 404, 502 | Grievance |

### Python Backend Routes (Internal)
| Method | Path | Auth | Request | Response |
| ------ | ---- | ---- | ------- | -------- |
| POST | `/api/profile/extract` | No | `ProfileExtractRequest` | `ProfileExtractResponse` |
| POST | `/api/schemes/evaluate`| No | `SchemeEvaluateRequest` | `SchemeEvaluateResponse` |
| POST | `/api/explanation` | No | JSON | JSON |
| POST | `/api/drafts/grievance`| No | `DraftRequest` | `DraftResponse` |
| POST | `/api/drafts/application`| No | `DraftRequest` | `DraftResponse` |
| POST | `/api/voice/transcribe`| No | Multipart Form | JSON |
| POST | `/api/voice/synthesize`| No | JSON | Audio |
| POST | `/api/documents/extract`| No | Multipart Form | JSON |

### Java Backend Routes (Ingestion)
| Method | Path | Auth | Request | Response |
| ------ | ---- | ---- | ------- | -------- |
| POST | `/api/v1/schemes` | No | JSON | JSON |
| GET | `/api/v1/schemes` | No | None | JSON |
| POST | `/api/v1/onboarding/ingestions` | No | Multipart (File) | JSON |

## 15. Database Schema

Reconstructed PostgreSQL 17 schema (after all migrations 1 through 6).

**`accounts`**
* `id` BIGINT PK GENERATED ALWAYS
* `email` TEXT NOT NULL UNIQUE
* `password_hash` TEXT NOT NULL
* `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**`profiles`**
* `id` BIGINT PK GENERATED ALWAYS
* `account_id` BIGINT NOT NULL UNIQUE (FK -> accounts) ON DELETE CASCADE
* `state` TEXT (Nullable)
* `district` TEXT (Nullable)
* `occupation` TEXT NOT NULL
* `monthly_income` BIGINT (Nullable)
* `income_currency` TEXT NOT NULL DEFAULT 'INR'
* `age` INT (Nullable)
* `gender` ENUM ('male', 'female', 'other', 'not_specified') (Nullable)
* `family_size` INT (Nullable)
* `children_count` INT (Nullable)
* `children_school_going` BOOLEAN (Nullable)
* `is_registered_worker` BOOLEAN (Nullable)
* `caste_category` TEXT (Nullable)
* `has_bank_account` BOOLEAN (Nullable)
* `documents_available` TEXT[] NOT NULL DEFAULT '{}'
* `language` TEXT NOT NULL DEFAULT 'en'
* `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**`schemes`**
* `id` BIGINT PK GENERATED ALWAYS
* `name` TEXT NOT NULL
* `description` TEXT NOT NULL
* `state` TEXT NOT NULL
* `source_url` TEXT NOT NULL
* `last_verified_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**`scheme_rules`**
* `id` BIGINT PK GENERATED ALWAYS
* `scheme_id` BIGINT (FK -> schemes) ON DELETE CASCADE
* `field` TEXT NOT NULL
* `operator` TEXT NOT NULL
* `value` JSONB NOT NULL

**`refresh_tokens`**
* `id` BIGINT PK GENERATED ALWAYS
* `account_id` BIGINT NOT NULL (FK -> accounts) ON DELETE CASCADE
* `token_hash` TEXT NOT NULL UNIQUE
* `expires_at` TIMESTAMPTZ NOT NULL
* `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

## 16. Inter-Service Communication

**Go ↔ Python**
* Endpoint: `POST {AI_SERVICE_URL}/api/drafts/grievance`
* Mechanism: HTTP REST
* Failure behavior: Go returns `502 Bad Gateway` if Python is unreachable or returns non-200.

**Go ↔ PostgreSQL**
* Mechanism: `pgx` pool with `sqlc` generated queries.

**Java ↔ PostgreSQL**
* Mechanism: Spring Data JPA (presumably, inferred from standard Spring Boot). *Issue*: Potential collision with Go's `schemes` table management.

## 17. Error Handling

Go backend relies on a custom `httpx.RespondWithError(w, status, message)` wrapper.
* **400 Bad Request**: Malformed JSON, missing fields, failed domain validations (e.g., `ErrInvalidSchemeID`).
* **401 Unauthorized**: Missing/invalid JWT.
* **403 Forbidden**: Cedar authorization rejected access to resource.
* **404 Not Found**: Profile/Scheme missing from DB.
* **409 Conflict**: Duplicate email on registration.
* **502 Bad Gateway**: Failed to connect to Python backend.
* **500 Internal Server Error**: Database down, panic.

## 18. DTO / Model Reference

**CreateProfileRequest & ProfileResponse** (Go)
```json
{
  "state": "Haryana",
  "district": "Ambala",
  "occupation": "street_vendor",
  "monthly_income": 15000,
  "income_currency": "INR",
  "family_size": 4,
  "children_count": 2,
  "children_school_going": true,
  "age": 35,
  "gender": "male",
  "is_registered_worker": true,
  "caste_category": "General",
  "has_bank_account": true,
  "documents_available": ["Aadhaar", "PAN"],
  "language": "hi"
}
```

*Note on Nullability: All fields except `occupation`, `income_currency`, `documents_available`, and `language` are pointers (`*type`) in Go, meaning they can be passed as `null` in JSON.*

## 19. Frontend Integration Guide

* **Base URL**: Set by `VITE_BACKEND_URL` in `.env`.
* **Authentication**: Send `Authorization: Bearer <access_token>` on protected routes.
* **Token Refresh**: When a request returns `401 Unauthorized`, the frontend must call `/api/auth/refresh` with the refresh token from `localStorage` to get a new access token, then retry the failed request.
* **Profile Management**: Use `PUT /api/accounts/{accountID}/profile/update`. Send `null` for unknown fields to avoid overwriting them with defaults.

## 20. Docker & Local Development

The project includes a `docker-compose.yml` for PostgreSQL:
```bash
docker-compose up -d
```
Ports:
- PostgreSQL: `4321` (Host) -> `5432` (Container)

Other services run on host:
- Go Backend: `go run cmd/api/main.go` (Port 9000)
- Python AI: `uvicorn app.main:app --port 8000` (Port 8000)
- React: `npm run dev` (Port 5173)

## 21. Environment Variables

**Go Backend (`.env`)**
* `PORT`: Go server port (default 9000)
* `JWT_SECRET`: Secret key for JWT signing (Required)
* `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`: Database connection (Required)
* `AI_SERVICE_URL`: URL of the Python backend (default `http://127.0.0.1:8000`)

**Python AI (`backend/.env`)**
* `AWS_REGION`, `AWS_PROFILE`: AWS Authentication
* `BEDROCK_MODEL_ID`: Claude/Gemma model ID
* `TRANSCRIBE_S3_BUCKET`, `TEXTRACT_S3_BUCKET`: S3 buckets
* `POLLY_VOICE_ID`: Amazon Polly Voice
* `CORS_ORIGINS`: Allowed origins

**Frontend (`.env`)**
* `VITE_BACKEND_URL`: Go API base URL

## 22. Implementation Issues / Inconsistencies

**1. Data Ownership Collision (Go vs Java)**
* **Location**: `internal/service/scheme.service.go` vs `JavaBackend/src/.../api`
* **Expected**: A single service owns scheme creation.
* **Actual**: Both Go and Java have endpoints to create/ingest schemes. Go writes directly to the DB, bypassing Java's provenance/validation checks.
* **Impact**: Data inconsistencies and bypassed validations.
* **Suggested Correction**: Remove scheme creation routes from Go. Make Go proxy to Java for scheme creation, or let the frontend talk directly to Java for admin tasks.

**2. Type Mismatches (Go DB vs Python)**
* **Location**: Profile schemas. Python `UserProfile` sets `monthly_income` as `Optional[float]`, while Go sets it as `*int64` (BIGINT in Postgres).
* **Impact**: Loss of precision if Python returns decimal income (e.g. 1500.50).
* **Suggested Correction**: Change Python `monthly_income` to `Optional[int]`.

**3. Incomplete Router Registrations**
* **Location**: `internal/router/router.go` calls `registerEligibilityRoutes` but the actual routes do not validate authorization using Cedar.
* **Actual**: `CheckEligibility` only requires `AuthMiddleware`, skipping Cedar ownership checks.
* **Impact**: A user could technically check eligibility using someone else's account ID if they bypassed the UI.
* **Suggested Correction**: Add `authorizer.CanReadProfile` check inside `EligibilityHandler`.

## 23. End-to-End Request Flows

**Grievance Generation Flow:**
1. Frontend sends `POST /api/grievance/generate` with scheme ID and complaint text.
2. Go router triggers JWT Auth Middleware.
3. Go handler extracts AccountID.
4. Go `GrievanceService` fetches Profile from PostgreSQL.
5. Go `GrievanceService` fetches Scheme from PostgreSQL.
6. Go maps data into a combined payload and makes an HTTP POST to Python (`http://localhost:8000/api/drafts/grievance`).
7. Python validates with Pydantic, calls Amazon Bedrock.
8. Python returns JSON draft with placeholders.
9. Go proxies the JSON back to the frontend.

## 24. Summary

* **HTTP Routes Found**: 14 (Go) + 8 (Python) + 3 (Java) = 25 Total
* **Database Tables**: 5 (accounts, profiles, schemes, scheme_rules, refresh_tokens)
* **Auth-Protected Routes**: 5
* **Cedar-Protected Routes**: 2 (Read/Update Profile)
* **Unverified Areas**: The internal implementation of the Java backend was minimally inspected (DTOs read, logic inferred) because it acts primarily as a distinct ingestion microservice.

*(End of Document)*
