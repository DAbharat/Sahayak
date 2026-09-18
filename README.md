# Sahayak Go Backend Documentation

This document provides a complete developer and API reference for the Sahayak Go backend implementation. It is designed to act as a contract for frontend developers and a comprehensive guide for anyone working on the Go codebase.

> **Note:** `backend/` is the separate AI/ML FastAPI service and is intentionally outside the scope of this Go backend developer reference.

---

## 1. Project Overview

The Go backend serves as the core API for the Sahayak application. It handles user authentication, profile management, scheme definitions, deterministic scheme eligibility checks, and acts as a gateway to the FastAPI AI service for grievance generation.

### Responsibilities
- **Authentication:** Secure user registration, login, and JWT/refresh token lifecycle management.
- **Profile Management:** Storing user demographic and occupational data.
- **Scheme & Rule Management:** Maintaining government schemes and their eligibility rules.
- **Eligibility Engine:** Deterministically evaluating user profiles against scheme rules.
- **AI Gateway:** Augmenting user requests with profile and scheme context before delegating draft generation to the AI/ML FastAPI service.

### Technology Stack
- **Language:** Go
- **Routing:** Gorilla Mux (`github.com/gorilla/mux`)
- **Database:** PostgreSQL
- **DB Access:** sqlc (`github.com/sqlc-dev/sqlc`) and pgx/v5
- **Security:** bcrypt (`golang.org/x/crypto/bcrypt`), JWT (`github.com/golang-jwt/jwt/v5`)

### High-Level Architecture Flow

```text
Frontend/Client
      │ (HTTP/JSON)
      ▼
Gorilla Mux Router
      │
      ├─► Auth Middleware (JWT Validation & Context injection)
      │
      ▼
Handler Layer (JSON Decoding, Request Validation, HTTP Response Formatting)
      │
      ▼
Service Layer (Business logic, standard Go values)
      │
      ▼
Repository Layer (Database / sqlc / pgx abstractions)
      │
      ▼
PostgreSQL Database
```

---

## 2. Complete Project Structure

```text
d:\CodeFiles\Sahayak
├── cmd/
│   └── api/
│       └── main.go                 # Entry point, dependency injection, server startup
├── internal/
│   ├── auth/                       # JWT generation/parsing, Refresh token hashing
│   ├── db/
│   │   ├── migrations/             # Raw SQL up/down migration files
│   │   ├── queries/                # Raw SQL query files used by sqlc
│   │   └── sqlc/                   # Auto-generated code from sqlc
│   ├── dto/                        # Data Transfer Objects (Request/Response JSON structs)
│   ├── handler/                    # HTTP handlers mapping endpoints to services
│   ├── httpx/                      # HTTP utilities (e.g., JSON response formatters)
│   ├── middleware/                 # HTTP middlewares (e.g., AuthMiddleware)
│   ├── repository/                 # Database abstraction layer wrapping sqlc queries
│   ├── router/                     # Gorilla Mux route registration
│   └── service/                    # Core business logic and validation
├── .env                            # Environment variables (excluded from version control)
├── docker-compose.yml              # PostgreSQL container configuration
├── go.mod / go.sum                 # Go module dependencies
└── sqlc.yaml                       # Configuration for the sqlc code generator
```

---

## 3. Architecture

The backend strictly adheres to a layered architecture pattern:

1. **Router (`internal/router`):** Registers endpoints and attaches middlewares. Does not handle logic.
2. **Middleware (`internal/middleware`):** Intercepts requests (e.g., `AuthMiddleware` verifies JWTs and injects `accountID` into the request context).
3. **Handler (`internal/handler`):** Parses URL parameters and JSON bodies (using a 1MB `http.MaxBytesReader` limit), delegates to the Service layer using standard Go values/DTOs, and formats the JSON response/HTTP status codes.
4. **Service (`internal/service`):** Contains business logic. Operates entirely on standard Go types and Domain concepts (not `pgtype` or `sqlc` directly where it intersects handlers).
5. **Repository (`internal/repository`):** Acts as an interface to the database. It wraps the auto-generated `sqlc` methods (which use `pgx`), converting standard Go types to `pgtype` and translating raw database errors (like unique constraint violations) into standardized Go domain errors (e.g., `ErrDuplicateEmail`).

### Initialization & Dependency Injection
`main.go` wires the application together:
1. Loads `.env` via `godotenv`.
2. Initializes PostgreSQL connection pool (`pgxpool`).
3. Instantiates `sqlc.New(pool)`.
4. Injects `queries` into Repositories.
5. Injects Repositories (and JWT secret) into Services.
6. Injects Services into Handlers.
7. Passes Handlers to `router.New()` to configure the Gorilla Mux router.
8. Starts the `http.Server`.

---

## 4. Complete API Documentation

### 4.1. Account Registration

**Route:** `POST /api/register`
**Authentication:** Public

**Purpose:** Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
| Field | Type | Required | Validation | Description |
| --- | --- | --- | --- | --- |
| email | string | Yes | Valid email format (`mail.ParseAddress`) | User's email |
| password | string | Yes | Min 8, Max 72 chars | User's plaintext password |

**Success Response:** `201 Created`
```json
{
  "id": 1,
  "email": "user@example.com"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid email format or password length.
- `409 Conflict`: Email already exists.
- `500 Internal Server Error`

---

### 4.2. Account Login

**Route:** `POST /api/login`
**Authentication:** Public

**Purpose:** Authenticates user and issues JWT & Refresh Token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "access_token": "eyJhbGci...",
  "refresh_token": "a1b2c3d4e5..."
}
```

**Error Responses:**
- `400 Bad Request`: Invalid JSON body.
- `401 Unauthorized`: Invalid credentials.
- `500 Internal Server Error`

---

### 4.3. Refresh Access Token

**Route:** `POST /api/auth/refresh`
**Authentication:** Public (requires refresh token in body)

**Request Body:**
```json
{
  "refresh_token": "a1b2c3d4e5..."
}
```

**Success Response:** `200 OK`
```json
{
  "access_token": "eyJhbGci..."
}
```

**Error Responses:**
- `400 Bad Request`: Invalid JSON body or empty token.
- `401 Unauthorized`: Invalid or expired refresh token.

---

### 4.4. Create Profile

**Route:** `POST /api/accounts/{accountID}/profile/create`
**Authentication:** JWT Required

**Purpose:** Creates a profile for the user.

**Path Parameters:**
| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| accountID | int | Yes (in URL) | Account ID. **Current Implementation Note:** The handler completely ignores the `{accountID}` value passed in the URL. It relies solely on the authenticated user's ID extracted from the JWT context. |

**Request Body:**
```json
{
  "state": "Maharashtra",
  "occupation": "street_vendor",
  "monthly_income": 15000,
  "age": 35,
  "gender": "MALE",
  "children_count": 2
}
```
| Field | Type | Required | Validation (Currently implemented) |
| --- | --- | --- | --- |
| state | string | Yes | Cannot be empty/spaces |
| occupation | string | Yes | Cannot be empty/spaces |
| monthly_income | int64 | Yes | Must be >= 0 |
| age | int32 | Yes | Must be >= 0 |
| gender | string | Yes | ENUM ('MALE', 'FEMALE', 'OTHER') |
| children_count | int32 | Yes | Must be >= 0 |

**Success Response:** `201 Created`
```json
{
  "id": 1,
  "account_id": 1,
  "state": "Maharashtra",
  "occupation": "street_vendor",
  "monthly_income": 15000,
  "age": 35,
  "gender": "MALE",
  "children_count": 2,
  "created_at": "2026-09-18T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Validation failure for fields (e.g. invalid age).
- `500 Internal Server Error`

---

### 4.5. Get Profile

**Route:** `GET /api/accounts/{accountID}/profile`
**Authentication:** JWT Required

**Purpose:** Retrieves an existing profile.
*(Note: `{accountID}` in the URL is ignored; relies exclusively on the JWT context for the authenticated user).*

**Success Response:** `200 OK` (Same JSON as Create Profile Response)

**Error Responses:**
- `400 Bad Request`: Invalid Account ID logic.
- `404 Not Found`: Profile does not exist.
- `500 Internal Server Error`

---

### 4.6. Update Profile

**Route:** `PUT /api/accounts/{accountID}/profile/update`
**Authentication:** JWT Required

**Purpose:** Updates an existing profile.
*(Note: `{accountID}` in the URL is ignored; relies exclusively on the JWT context for the authenticated user).*

**Request Body:** Same as Create Profile request.
**Success Response:** `200 OK` (Updated Profile JSON)
**Error Responses:**
- `400 Bad Request`: Field validation failure.
- `404 Not Found`: Profile does not exist.
- `500 Internal Server Error`

---

### 4.7. Create Scheme

**Route:** `POST /api/schemes/create`
**Authentication:** Public (No auth middleware attached in current implementation)
**Implemetation note:** This endpoint is currently exposed without authentication and appears intended for scheme setup/administrative use rather than normal end-user interaction.

**Purpose:** Creates a new government scheme.

**Request Body:**
```json
{
  "name": "PM SVANidhi",
  "description": "Micro-credit facility for street vendors",
  "state": "National",
  "source_url": "https://pmsvanidhi.mohua.gov.in/",
  "last_verified_at": "2026-09-18T00:00:00Z"
}
```

**Success Response:** `201 Created`
```json
{
  "id": 1,
  "name": "PM SVANidhi",
  "description": "Micro-credit facility for street vendors",
  "state": "National",
  "source_url": "https://pmsvanidhi.mohua.gov.in/",
  "last_verified_at": "2026-09-18T00:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Missing fields or invalid body.
- `500 Internal Server Error`

---

### 4.8. List Schemes

**Route:** `GET /api/schemes`
**Authentication:** Public

**Success Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "PM SVANidhi",
    "description": "...",
    "state": "National",
    "source_url": "...",
    "last_verified_at": "..."
  }
]
```
**Error Responses:** `500 Internal Server Error`

---

### 4.9. Get Scheme By ID

**Route:** `GET /api/schemes/{schemeID}`
**Authentication:** Public

**Path Parameters:**
| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| schemeID | int | Yes | Scheme ID |

**Success Response:** `200 OK` (Single Scheme JSON)
**Error Responses:** 
- `400 Bad Request`: Invalid ID format.
- `404 Not Found`: Scheme not found.
- `500 Internal Server Error`

---

### 4.10. Get Scheme Rules by Scheme ID

**Route:** `GET /api/schemes/{schemeID}/rules`
**Authentication:** Public

**Success Response:** `200 OK`
```json
[
  {
    "id": 1,
    "scheme_id": 1,
    "field": "occupation",
    "operator": "eq",
    "value": "\"street_vendor\""
  }
]
```

**Error Responses:**
- `400 Bad Request`: Invalid scheme ID.
- `500 Internal Server Error`

---

### 4.11. Get Scheme Rule By ID

**Route:** `GET /api/scheme-rules/{ruleID}`
**Authentication:** Public

**Success Response:** `200 OK` (Single SchemeRule JSON)

**Error Responses:**
- `400 Bad Request`: Invalid rule ID.
- `404 Not Found`: Rule not found.
- `500 Internal Server Error`

---

### 4.12. Check Eligibility

**Route:** `POST /api/eligibility/check`
**Authentication:** JWT Required

**Purpose:** Evaluates the authenticated user's profile against the rules of a specific scheme.

**Request Body:**
```json
{
  "account_id": 1,
  "scheme_id": 1
}
```
**Current Implementation Note:** While the `EligibilityRequest` DTO accepts an `account_id`, the handler deliberately ignores it. The backend exclusively uses the authenticated user's ID obtained from the JWT context to fetch the profile. 

**Success Response:** `200 OK`
```json
{
  "scheme_id": 1,
  "scheme_name": "PM SVANidhi",
  "eligible": false,
  "reasons": [
    "Profile does not satisfy rule: occupation eq \"street_vendor\""
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Invalid Scheme ID format or empty request body.
- `404 Not Found`: Profile or Scheme not found.
- `500 Internal Server Error`

---

### 4.13. Generate Grievance

**Route:** `POST /api/grievance/generate`
**Authentication:** JWT Required

**Purpose:** Fetches the user's profile and requested scheme, structures a request for the AI service, calls the FastAPI service, and returns the generated grievance draft.

**Request Body:**
```json
{
  "scheme_id": 1,
  "user_text": "Maine is scheme ke liye apply kiya tha lekin mujhe benefit nahi mila",
  "draft_type": "grievance",
  "language": "hi",
  "profile_context": {},
  "scheme_name": ""
}
```
*Note: The client does not need to supply actual profile values or the scheme name in `profile_context` and `scheme_name`. The Go backend populates these automatically using the authenticated user's profile from the database based on the provided `scheme_id`.*
*The `language` field should be one of `hi`, `en`, or `hinglish` as supported by the FastAPI AI service contract.*

**Internal AI Flow:**
1. **GrievanceHandler**: Decodes the JSON request.
2. **GrievanceService.PrepareRequest()**: Validates the request and fetches the authenticated user's profile and requested scheme, returning the contextual data required by the handler.
3. **GrievanceHandler**: Makes an HTTP POST request to the external FastAPI service (`AI_SERVICE_URL/api/drafts/grievance`) with a strict 15-second timeout, forwarding the JSON request.
4. **FastAPI AI Service**: Generates the draft (via AWS Bedrock).
5. **GrievanceHandler**: Decodes the `DraftResponse` from FastAPI and maps it into the final `GenerateGrievanceResponse` for the client.

**Success Response:** `200 OK`
```json
{
  "user_text": "Maine is scheme ke liye apply kiya tha lekin mujhe benefit nahi mila",
  "draft_type": "grievance",
  "language": "hi",
  "profile_context": {
    "state": "Maharashtra",
    "occupation": "street_vendor",
    "monthly_income": 15000,
    "age": 35,
    "gender": "MALE",
    "children_count": 2
  },
  "subject": "Grievance regarding loan denial",
  "body": "Dear Sir/Madam...",
  "placeholders": ["[Vending Certificate ID]", "[Bank Name]"],
  "disclaimer": "AI generated draft.",
  "correlation_id": "uuid-1234",
  "scheme_name": "PM SVANidhi"
}
```

**Error Responses:**
- `400 Bad Request`: Missing user text or invalid scheme ID.
- `404 Not Found`: Profile or Scheme not found.
- `502 Bad Gateway`: AI service unavailable or returned non-200 status.
- `500 Internal Server Error`

---

## 5. Authentication System

- **Password Hashing:** Uses `bcrypt` with default cost (10).
- **JWT (Access Tokens):**
  - Library: `github.com/golang-jwt/jwt/v5`
  - Expiration: 15 minutes.
  - Claims: Standard claims + `user_id` (mapped to Account ID).
  - Algorithm: HMAC SHA-256 (`HS256`).
- **Refresh Tokens:**
  - Generation: 32 bytes of secure random data, hex encoded.
  - Storage: A SHA-256 hash of the refresh token is stored in the `refresh_tokens` database table.
  - Expiration: 7 days.
  - Validation: Client sends plaintext token, server hashes it and compares it to the database record.
- **Middleware:** `AuthMiddleware` parses the `Authorization: Bearer <token>` header, validates the signature and expiration, extracts `user_id`, and injects it into the request Context (`r.Context()`) as an `int64`. Handlers use `middleware.GetUserFromContext` to retrieve it.

---

## 6. Profile System

Profiles are 1-to-1 mapped with Accounts (`account_id` is a `UNIQUE` foreign key).

**Database Structure:**
- `id` (BIGINT)
- `account_id` (BIGINT, Unique)
- `state` (TEXT)
- `occupation` (TEXT)
- `monthly_income` (BIGINT)
- `age` (INT)
- `gender` (ENUM: 'MALE', 'FEMALE', 'OTHER')
- `children_count` (INT)

Profiles supply the critical demographic context used by both the deterministic Eligibility Engine and the AI Grievance Generator.

---

## 7. Scheme System

Schemes represent government programs. The system includes a `source_url` and `last_verified_at` timestamp. These exist to establish credibility and traceability back to official government sources, which provides a transparent grounding layer for generated AI responses. Currently, the backend exposes them but does not actively perform automated verification or updates of the timestamp.

**Database Structure:**
- `id`, `name`, `description`, `state`, `source_url`, `last_verified_at`

---

## 8. Scheme Rules

Rules are attached to Schemes (`scheme_id` foreign key) and dictate eligibility.

**Database Structure:**
- `field` (TEXT) - e.g., "age", "occupation"
- `operator` (TEXT) - e.g., "eq", "gt", "lt"
- `value` (JSONB) - Stored as a raw JSON literal (e.g., `"street_vendor"` or `15000`)

By using `JSONB` for the value, the database natively supports mixed data types (strings for state/occupation, numbers for age/income) without needing separate columns.

---

## 9. Eligibility Engine

The Go backend implements an eligibility engine that strictly evaluates rules. The AI/LLM is NOT involved in deciding eligibility.

**Process:**
1. Fetches User Profile and Scheme Rules.
2. Iterates through every rule.
3. Maps the rule's `field` to the struct field in `sqlc.Profile`.
4. Parses the rule's JSONB `value` into either a `StringValue` or `NumberValue`.
5. Compares the Profile value against the Rule value using the specified `operator`.

**Supported Operators:**
- **Numeric Fields (age, monthly_income, children_count):** `eq`, `neq`, `gt`, `gte`, `lt`, `lte`.
- **String Fields (state, occupation, gender):** `eq`, `neq` (case-insensitive string comparison).

If *any* rule fails, the engine flags `eligible: false` and records the exact reason.

---

## 10. Grievance Generation (AI Integration)

The Go backend acts as an orchestrator and contextual gateway for the FastAPI service:

```text
Go Backend (:9000)
       ↓  (HTTP POST JSON)
FastAPI Service (:8000)
       ↓
AWS Bedrock (LLM)
```
The Go `GrievanceHandler` prepares the payload and invokes the Python FastAPI endpoint. Python specific AI behaviors are intentionally excluded from this documentation scope.

---

## 11. DTO Reference

Every Data Transfer Object used by the Go API:

| Struct | Field | JSON Key | Go Type | Required | Purpose |
| --- | --- | --- | --- | --- | --- |
| `CreateAccountRequest` | Email | `email` | `string` | Yes | User email for signup |
|  | Password | `password` | `string` | Yes | User plaintext password |
| `CreateAccountResponse` | ID | `id` | `int64` | - | DB generated ID |
|  | Email | `email` | `string` | - | Registered email |
| `LoginAccountRequest` | Email | `email` | `string` | Yes | Login email |
|  | Password | `password` | `string` | Yes | Login password |
| `LoginAccountResponse` | ID | `id` | `int64` | - | User ID |
|  | Email | `email` | `string` | - | User email |
|  | AccessToken | `access_token` | `string` | - | JWT Token |
|  | RefreshToken | `refresh_token` | `string` | - | Opaque Refresh Token |
| `AccountResponse` | ID, Email, CreatedAt | `id`, `email`, `created_at` | `int64`, `string`, `time.Time` | - | General account info |
| `RefreshTokenRequest` | RefreshToken | `refresh_token` | `string` | Yes | Passed token |
| `RefreshTokenResponse` | AccessToken | `access_token` | `string` | - | New JWT token |
| `EligibilityRequest` | AccountID | `account_id` | `int64` | Passed | Exists in DTO, ignored by handler |
|  | SchemeID | `scheme_id` | `int64` | Yes | The target scheme to check |
| `EligibilityResponse` | SchemeID | `scheme_id` | `int64` | - | Targeted scheme ID |
|  | SchemeName | `scheme_name` | `string` | - | Targeted scheme Name |
|  | Eligible | `eligible` | `bool` | - | Boolean eligibility result |
|  | Reasons | `reasons` | `[]string` | - | Array of failure causes (omitempty) |
| `CreateProfileRequest` | State | `state` | `string` | Yes | State of residence |
|  | Occupation | `occupation` | `string` | Yes | Current job |
|  | MonthlyIncome | `monthly_income` | `int64` | Yes | Income |
|  | Age | `age` | `int32` | Yes | Age |
|  | Gender | `gender` | `string` | Yes | "MALE", "FEMALE", or "OTHER" |
|  | ChildrenCount | `children_count` | `int32` | Yes | Children count |
| `ProfileResponse` | ID, AccountID, etc. | `id`, `account_id`... | Various | - | All DB profile fields including `created_at` |
| `CreateSchemeRequest` | Name, Description, State, SourceURL, LastVerifiedAt | `name`... | `string`, `time.Time` | Yes | Scheme creation details |
| `SchemeResponse` | ID, Name, etc. | `id`, `name`... | Various | - | Extracted scheme info |

### Exact Grievance DTOs

The Go backend uses `dto.GrievanceRequest` for the incoming API request and then updates its `ProfileContext`, `SchemeName`, and `DraftType` fields before sending the payload to FastAPI.

**`dto.GrievanceRequest`**
| Field | Go Type | JSON Key | Required | Purpose |
| --- | --- | --- | --- | --- |
| SchemeID | `int64` | `scheme_id` | Yes | Target scheme |
| UserText | `string` | `user_text` | Yes | Prompt intent |
| DraftType | `string` | `draft_type` | Yes | Type of draft |
| Language | `string` | `language` | Yes | Desired language |
| ProfileContext | `ProfileContext` | `profile_context` | Populated | User demographics |
| SchemeName | `string` | `scheme_name` | Populated | Display scheme name |

**`dto.ProfileContext`**
| Field | Go Type | JSON Key | Purpose |
| --- | --- | --- | --- |
| State | `string` | `state` | User State |
| Occupation | `string` | `occupation` | User Occupation |
| MonthlyIncome | `int64` | `monthly_income` | User Income |
| Age | `int32` | `age` | User Age |
| Gender | `string` | `gender` | User Gender |
| ChildrenCount | `int32` | `children_count` | User Children Count |

**`dto.DraftResponse`** (Received from FastAPI AI)
| Field | Go Type | JSON Key | Purpose |
| --- | --- | --- | --- |
| DraftType | `string` | `draft_type` | Document category |
| Language | `string` | `language` | Generated language |
| Subject | `string` | `subject` | Draft title |
| Body | `string` | `body` | The AI text content |
| Placeholders | `[]string` | `placeholders` | Values for the user to fill |
| Disclaimer | `string` | `disclaimer` | AI disclaimer |
| CorrelationID | `string` | `correlation_id` | Audit trace ID |

**`dto.GenerateGrievanceResponse`** (Returned to the Frontend)
| Field | Go Type | JSON Key | Purpose |
| --- | --- | --- | --- |
| UserText | `string` | `user_text` | The original prompt |
| DraftType | `string` | `draft_type` | Document category |
| Language | `string` | `language` | Generated language |
| ProfileContext | `ProfileContext` | `profile_context` | The DB-fetched profile context |
| Subject | `string` | `subject` | Draft title |
| Body | `string` | `body` | AI generated content |
| Placeholders | `[]string` | `placeholders` | Values to fill |
| Disclaimer | `string` | `disclaimer` | AI disclaimer |
| CorrelationID | `string` | `correlation_id` | Audit trace ID |
| SchemeName | `string` | `scheme_name` | The DB-fetched scheme name |

---

## 12. Database Schema (PostgreSQL)

**`accounts` Table**
- `id` (BIGINT) - GENERATED ALWAYS AS IDENTITY PRIMARY KEY
- `email` (TEXT) - NOT NULL, UNIQUE Constraint
- `password_hash` (TEXT) - NOT NULL
- `created_at` (TIMESTAMPTZ) - NOT NULL, DEFAULT NOW()

**`profiles` Table**
- `id` (BIGINT) - GENERATED ALWAYS AS IDENTITY PRIMARY KEY
- `account_id` (BIGINT) - NOT NULL, UNIQUE Constraint, FOREIGN KEY -> accounts(id) ON DELETE CASCADE
- `state` (TEXT) - NOT NULL
- `occupation` (TEXT) - NOT NULL
- `monthly_income` (BIGINT) - NOT NULL, DEFAULT 0
- `age` (INT) - NOT NULL
- `gender` (`gender` ENUM: 'MALE', 'FEMALE', 'OTHER') - NOT NULL
- `children_count` (INT) - NOT NULL, DEFAULT 0
- `created_at` (TIMESTAMPTZ) - NOT NULL, DEFAULT NOW()
- *Index:* `idx_profiles_account_id` on `account_id`

**`schemes` Table**
- `id` (BIGINT) - GENERATED ALWAYS AS IDENTITY PRIMARY KEY
- `name` (TEXT) - NOT NULL
- `description` (TEXT) - NOT NULL
- `state` (TEXT) - NOT NULL
- `source_url` (TEXT) - NOT NULL
- `last_verified_at` (TIMESTAMPTZ) - NOT NULL, DEFAULT NOW()

**`scheme_rules` Table**
- `id` (BIGINT) - GENERATED ALWAYS AS IDENTITY PRIMARY KEY
- `scheme_id` (BIGINT) - FOREIGN KEY -> schemes(id) ON DELETE CASCADE
- `field` (TEXT) - NOT NULL
- `operator` (TEXT) - NOT NULL
- `value` (JSONB) - NOT NULL
- *Index:* `idx_scheme_rules_scheme_id` on `scheme_id`

**`refresh_tokens` Table**
- `id` (BIGINT) - GENERATED ALWAYS AS IDENTITY PRIMARY KEY
- `account_id` (BIGINT) - NOT NULL, FOREIGN KEY -> accounts(id) ON DELETE CASCADE
- `token_hash` (TEXT) - NOT NULL, UNIQUE Constraint
- `expires_at` (TIMESTAMPTZ) - NOT NULL
- `created_at` (TIMESTAMPTZ) - NOT NULL, DEFAULT NOW()
- *Index:* `idx_refresh_tokens_account_id` on `account_id`

---

## 13. SQL / sqlc

The project leverages `sqlc` for type-safe database access.
- **Config:** `sqlc.yaml` points to `internal/db/queries` for SQL inputs and generates Go code in `internal/db/sqlc`.
- **Driver:** Uses `pgx/v5`.
- **Role:** Replaces standard ORMs. Developers write raw SQL in `.sql` files, and `sqlc` generates Go interfaces and structs perfectly mirroring the DB schema.

---

## 14. Service Layer Reference

Services encapsulate the domain business logic, taking validated input from handlers, interacting with repositories, and generating business errors.

- **`AccountService`:** Handles account registration, validates email format and password length, hashes passwords using bcrypt, verifies credentials during login, generates access JWT tokens, and manages refresh token lifecycles and validation.
- **`ProfileService`:** Validates incoming profile demographics (e.g. ensuring age/income are positive) and orchestrates Profile repository logic for creating, fetching, and updating records.
- **`SchemeService`:** Orchestrates logic for creating and retrieving basic metadata and definitions of schemes.
- **`SchemeRuleService`:** Retrieves logic and criteria rules attached to schemes for external consumption.
- **`EligibilityService`:** Provides the deterministic logic parser (`evaluateRule`) to decode JSONB profile rules and map them against fetched user records without external API or AI components.
- **`GrievanceService`:** Prepares the payload data by joining the User Profile and Scheme repositories. Validates the basic `user_text` bounds before formatting the data for the Handler's AI API call.

---

## 15. Security Implementations

- **Passwords:** Hashed via `bcrypt`.
- **Stateless Auth:** Short-lived (15m) JWTs minimize compromise windows.
- **Token Hashing:** Refresh tokens are hashed (SHA-256) in the DB. If the DB is compromised, active refresh tokens cannot be trivially stolen.
- **Payload Limits:** 1MB limit on all JSON HTTP bodies (`http.MaxBytesReader`).
- **Strict Decoding:** Unknown JSON fields are explicitly rejected by the Go JSON decoder.
- **SQL Mitigation:** Database queries are executed through `sqlc`-generated parameterized queries using `pgx` rather than constructing SQL strings from user input.

---

## 16. Configuration

| Environment Variable | Required | Example/Default | Purpose |
| --- | --- | --- | --- |
| `POSTGRES_USER` | Yes | `postgres` | DB username |
| `POSTGRES_PASSWORD` | Yes | `secret` | DB password |
| `POSTGRES_DB` | Yes | `sahayak` | DB name |
| `PORT` | No | `9000` | HTTP Server port |
| `JWT_SECRET` | Yes | `supersecret` | HMAC secret for signing JWTs |
| `AI_SERVICE_URL` | No | `http://127.0.0.1:8000` | URL of the FastAPI AI service |

---

## 17. Running the Backend

**1. Start PostgreSQL (via Docker):**
```bash
docker-compose up -d
```

**2. Setup Environment Variables:**
Ensure a `.env` file exists in the root directory mirroring the required variables.

**3. Run the Server:**
```bash
go run cmd/api/main.go
```
The server will automatically load the `.env` file, connect to the DB, and start listening on port 9000.

---

## 18. API Testing Examples (cURL)

**Register:**
```bash
curl -X POST http://localhost:9000/api/register \
-H "Content-Type: application/json" \
-d '{"email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:9000/api/login \
-H "Content-Type: application/json" \
-d '{"email":"test@example.com","password":"password123"}'
```

**Check Eligibility (Requires Token):**
```bash
curl -X POST http://localhost:9000/api/eligibility/check \
-H "Authorization: Bearer <ACCESS_TOKEN>" \
-H "Content-Type: application/json" \
-d '{"account_id":1,"scheme_id":1}'
```

---

## 19. API Quick Reference

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | System health check |
| `POST` | `/api/register` | Public | Create new account |
| `POST` | `/api/login` | Public | Authenticate user |
| `POST` | `/api/auth/refresh` | Public | Refresh JWT |
| `POST` | `/api/accounts/{accountID}/profile/create` | JWT | Create demographic profile |
| `GET` | `/api/accounts/{accountID}/profile` | JWT | Retrieve profile |
| `PUT` | `/api/accounts/{accountID}/profile/update` | JWT | Update profile |
| `POST` | `/api/schemes/create` | Public | Create new scheme |
| `GET` | `/api/schemes` | Public | List all schemes |
| `GET` | `/api/schemes/{schemeID}` | Public | Get single scheme |
| `GET` | `/api/schemes/{schemeID}/rules` | Public | Get rules for a scheme |
| `GET` | `/api/scheme-rules/{ruleID}` | Public | Get single rule |
| `POST` | `/api/eligibility/check` | JWT | Deterministic eligibility check |
| `POST` | `/api/grievance/generate` | JWT | Generate AI grievance draft |
