# Sahayak

Spring Boot Scheme Knowledge / Ingestion Service.

## Run

```bash
mvn spring-boot:run
```

## Test

```bash
mvn test
```

## Key APIs

- `POST /api/v1/schemes` - create scheme with mandatory source metadata
- `GET /api/v1/schemes` - list schemes (filter by `status`, `name`)
- `GET /api/v1/schemes/{id}` - get scheme
- `GET /api/v1/schemes/{id}/rules` - get extracted rules
- `GET /api/v1/schemes/{id}/source` - get source and verification metadata
- `POST /api/v1/onboarding/ingestions` (multipart, `request` + optional `file`) - submit ingestion
- `GET /api/v1/onboarding/ingestions/{runId}` - check async ingestion status
- `POST /api/v1/schemes/{id}/review/approve` - publish scheme (requires no unresolved rules)
- `POST /api/v1/schemes/{id}/review/archive` - archive scheme

## Design constraints implemented

- Source/provenance required for scheme creation.
- Extracted rules keep exact raw text span.
- Unresolved eligibility clauses are stored for manual review; no inferred criteria are invented.
- Review/audit workflow tracks approvals and edits.
