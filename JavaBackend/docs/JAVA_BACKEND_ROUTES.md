# Java Backend API Routes

This document describes the HTTP routes exposed by the Sahayak Java Spring Boot scheme-ingestion service.

## Service Basics

- Base URL: `http://localhost:9090`
- API prefix: `/api/v1`
- Content type for JSON requests and responses: `application/json`
- Authentication: no authentication middleware is currently configured. Reviewer identity is supplied through `X-Actor` headers or request body fields.
- Health and actuator endpoints are exposed separately by Spring Boot, including `/actuator/health`.

## Domain Values

### Source types

`PDF`, `WEBPAGE`, `TEXT`

### Scheme status

`DRAFT`, `PUBLISHED`, `ARCHIVED`

### Review status

`PENDING_REVIEW`, `APPROVED`, `REJECTED`

### Ingestion state

`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`

### Rule operators

`IN`, `LTE`, `GTE`, `EQ`, `BETWEEN`, `UNKNOWN`

### Rule value types

`STRING`, `NUMBER`, `LIST`, `BOOLEAN`, `UNKNOWN`

## Route Summary

| Method | Route | Purpose | Success |
| --- | --- | --- | --- |
| `POST` | `/api/v1/schemes` | Create a draft scheme manually | `201 Created` |
| `GET` | `/api/v1/schemes` | List schemes, optionally filtered | `200 OK` |
| `GET` | `/api/v1/schemes/{schemeId}` | Read one scheme | `200 OK` |
| `GET` | `/api/v1/schemes/{schemeId}/rules` | List extracted or edited rules | `200 OK` |
| `GET` | `/api/v1/schemes/{schemeId}/source` | Read source metadata | `200 OK` |
| `PUT` | `/api/v1/schemes/{schemeId}/rules/{ruleId}` | Edit a rule during review | `200 OK` |
| `DELETE` | `/api/v1/schemes/{schemeId}/rules/{ruleId}` | Delete a rule | `204 No Content` |
| `POST` | `/api/v1/schemes/{schemeId}/review/approve` | Publish a reviewed scheme | `200 OK` |
| `POST` | `/api/v1/schemes/{schemeId}/review/archive` | Archive a scheme | `200 OK` |
| `POST` | `/api/v1/onboarding/ingestions` | Start asynchronous ingestion | `202 Accepted` |
| `GET` | `/api/v1/onboarding/ingestions/{runId}` | Check ingestion status | `200 OK` |

## Scheme Routes

### Create a scheme

`POST /api/v1/schemes`

Creates a scheme with `DRAFT` status and `PENDING_REVIEW` review status. Source provenance is mandatory.

Headers:

- `Content-Type: application/json`
- `X-Actor` optional; defaults to `system`

Request body:

```json
{
  "name": "Education Support Scheme",
  "description": "Support for eligible students",
  "source": "Ministry of Education",
  "sourceType": "WEBPAGE",
  "sourceUrl": "https://example.gov/scheme",
  "lastVerified": "2026-09-20"
}
```

Required fields: `name`, `source`, `sourceType`, `sourceUrl`, and `lastVerified`.

Response body:

```json
{
  "id": 1,
  "name": "Education Support Scheme",
  "description": "Support for eligible students",
  "source": "Ministry of Education",
  "sourceType": "WEBPAGE",
  "sourceUrl": "https://example.gov/scheme",
  "lastVerified": "2026-09-20",
  "status": "DRAFT",
  "reviewStatus": "PENDING_REVIEW"
}
```

### List schemes

`GET /api/v1/schemes`

Returns all schemes unless filters are supplied.

Optional query parameters:

- `status`: exact `SchemeStatus` value, for example `DRAFT` or `PUBLISHED`
- `name`: case-insensitive partial name match

Examples:

```text
GET /api/v1/schemes?status=PUBLISHED
GET /api/v1/schemes?name=education
GET /api/v1/schemes?status=DRAFT&name=student
```

### Get one scheme

`GET /api/v1/schemes/{schemeId}`

Returns the scheme summary shown in the create response. A missing ID returns `404 Not Found`.

### Get scheme rules

`GET /api/v1/schemes/{schemeId}/rules`

Returns every rule belonging to the scheme.

Response example:

```json
[
  {
    "id": 10,
    "field": "age",
    "operator": "LTE",
    "value": "18",
    "valueType": "NUMBER",
    "rawTextSpan": "Applicants must be 18 years old or younger.",
    "confidence": 0.98,
    "reviewStatus": "PENDING_REVIEW",
    "resolved": true
  }
]
```

`rawTextSpan` preserves the source text used for the rule. `resolved` indicates whether the eligibility clause could be represented with a known rule operator.

### Get source metadata

`GET /api/v1/schemes/{schemeId}/source`

Returns only provenance fields:

```json
{
  "source": "Ministry of Education",
  "sourceType": "WEBPAGE",
  "sourceUrl": "https://example.gov/scheme",
  "lastVerified": "2026-09-20"
}
```

### Edit a rule

`PUT /api/v1/schemes/{schemeId}/rules/{ruleId}`

Updates the rule and records a review audit entry. The rule must belong to the supplied scheme.

Request body:

```json
{
  "fieldName": "age",
  "operator": "LTE",
  "value": "18",
  "valueType": "NUMBER",
  "rawTextSpan": "Applicants must be 18 years old or younger.",
  "reviewStatus": "APPROVED",
  "actor": "reviewer@example.com"
}
```

All fields are required. When `operator` is not `UNKNOWN`, the service marks the rule as resolved and sets confidence to `1`. An `UNKNOWN` operator leaves the rule unresolved.

A rule from another scheme returns `400 Bad Request`; an unknown rule or scheme returns `404 Not Found`.

### Delete a rule

`DELETE /api/v1/schemes/{schemeId}/rules/{ruleId}`

Headers:

- `X-Actor` optional; defaults to `system`

Returns no body with `204 No Content`. Related rule audit records are removed before the rule is deleted, and the deletion is then recorded in the scheme audit history.

### Approve and publish a scheme

`POST /api/v1/schemes/{schemeId}/review/approve`

Request body:

```json
{
  "actor": "reviewer@example.com",
  "notes": "Verified against the official source."
}
```

`actor` is required; `notes` is optional.

On success:

- `reviewStatus` becomes `APPROVED`
- `status` becomes `PUBLISHED`
- `lastVerified` is set to the current server date
- an approval audit record is created

Approval fails with `400 Bad Request` when any rule is unresolved and not `REJECTED`.

### Archive a scheme

`POST /api/v1/schemes/{schemeId}/review/archive`

Uses the same request body as approval. On success:

- `status` becomes `ARCHIVED`
- `reviewStatus` becomes `REJECTED`
- an archive audit record is created

## Onboarding and Ingestion Routes

### Submit an ingestion

`POST /api/v1/onboarding/ingestions`

Starts asynchronous document ingestion. The request must be `multipart/form-data` with:

- `request`: required JSON part containing `OnboardingIngestionRequest`
- `file`: optional uploaded file, normally used for PDF ingestion

The JSON part should be sent with `Content-Type: application/json`.

Example using `curl`:

```bash
curl -X POST http://localhost:9090/api/v1/onboarding/ingestions \
  -F 'request={"schemeName":"Education Support Scheme","description":"Student support","source":"Ministry of Education","sourceType":"PDF","actor":"reviewer@example.com"};type=application/json' \
  -F 'file=@scheme.pdf;type=application/pdf'
```

Request fields:

| Field | Required | Description |
| --- | --- | --- |
| `schemeName` | yes | Name for the new scheme |
| `description` | no | Scheme description |
| `source` | yes | Source authority or publisher |
| `sourceType` | yes | `PDF`, `WEBPAGE`, or `TEXT` |
| `sourceUrl` | no | Explicit source URL or reference |
| `textContent` | no | Inline text used by text ingestion |
| `actor` | no | Audit actor; defaults to `system` |
| `lastVerified` | no | Verification date; defaults to the current date |

Source reference resolution:

- An explicit `sourceUrl` is used when supplied.
- PDF uploads without a URL use `uploaded://<filename>`.
- Text ingestion without a URL uses `inline://text`.

The endpoint creates the scheme and ingestion run, then dispatches processing after the database transaction commits. It returns immediately with `202 Accepted`:

```json
{
  "runId": 25,
  "schemeId": 1,
  "state": "PENDING"
}
```

### Get ingestion status

`GET /api/v1/onboarding/ingestions/{runId}`

Poll this endpoint using the returned `runId` until the state is `COMPLETED` or `FAILED`.

Response example:

```json
{
  "id": 25,
  "schemeId": 1,
  "documentId": 7,
  "state": "COMPLETED",
  "errors": null,
  "createdAt": "2026-09-20T10:15:30Z",
  "updatedAt": "2026-09-20T10:15:36Z"
}
```

When processing fails, `state` is `FAILED` and `errors` contains the recorded failure message. A successful run stores the normalized document and extracted rules atomically.

## Typical Workflow

1. Submit `POST /api/v1/onboarding/ingestions` or create a scheme with `POST /api/v1/schemes`.
2. For ingestion, poll `GET /api/v1/onboarding/ingestions/{runId}` until processing completes.
3. Read the scheme and rules with `GET /api/v1/schemes/{schemeId}` and `GET /api/v1/schemes/{schemeId}/rules`.
4. Edit unresolved rules with `PUT /api/v1/schemes/{schemeId}/rules/{ruleId}`, or delete rules that should not be retained.
5. Publish with `POST /api/v1/schemes/{schemeId}/review/approve` after all required rules are resolved or explicitly rejected.
6. Use the archive route when the scheme should no longer be active.

## Error Responses

Errors use the following JSON shape:

```json
{
  "timestamp": "2026-09-20T10:20:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Cannot publish scheme with unresolved eligibility clauses"
}
```

Common statuses:

| Status | Meaning |
| --- | --- |
| `400` | Invalid request, validation failure, invalid rule relationship, or blocked approval |
| `404` | Scheme, rule, or ingestion run does not exist |
| `409` | Database constraint violation, such as a uniqueness conflict |
| `500` | Unexpected server-side failure |

Validation errors combine field names and validation messages in the `message` field.

## Implementation References

- Controllers: `src/main/java/com/sahayak/scheme/api/SchemeController.java` and `OnboardingController.java`
- DTOs: `src/main/java/com/sahayak/scheme/dto/`
- Business rules: `src/main/java/com/sahayak/scheme/service/SchemeService.java` and `IngestionService.java`
- Async processing: `src/main/java/com/sahayak/scheme/service/IngestionProcessor.java`
- Error mapping: `src/main/java/com/sahayak/scheme/exception/GlobalExceptionHandler.java`
