-- name: CreateScheme :one

INSERT INTO schemes (
    name,
    description,
    state,
    source_url,
    last_verified_at,
    department_name
)
VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
)
RETURNING
    id,
    name,
    description,
    state,
    source_url,
    last_verified_at,
    department_name;


-- name: GetSchemeByID :one

SELECT
    id,
    name,
    description,
    state,
    source_url,
    last_verified_at,
    department_name
FROM schemes
WHERE id = $1;


-- name: ListSchemes :many

SELECT
    id,
    name,
    description,
    state,
    source_url,
    last_verified_at,
    department_name
FROM schemes
ORDER BY id;


-- name: ListSchemesByState :many

SELECT
    id,
    name,
    description,
    state,
    source_url,
    last_verified_at,
    department_name
FROM schemes
WHERE state = $1
ORDER BY id;


-- name: UpdateScheme :one

UPDATE schemes
SET
    name = $2,
    description = $3,
    state = $4,
    source_url = $5,
    last_verified_at = $6,
    department_name = $7
WHERE id = $1
RETURNING
    id,
    name,
    description,
    state,
    source_url,
    last_verified_at,
    department_name;


-- name: DeleteScheme :one

DELETE FROM schemes
WHERE id = $1
RETURNING id;