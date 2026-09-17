-- name: CreateSchemeRule :one
INSERT INTO scheme_rules (
    scheme_id,
    field,
    operator,
    value
)
VALUES (
    $1,
    $2,
    $3,
    $4
)
RETURNING
    id,
    scheme_id,
    field,
    operator,
    value;


-- name: GetSchemeRuleByID :one
SELECT
    id,
    scheme_id,
    field,
    operator,
    value
FROM scheme_rules
WHERE id = $1;


-- name: GetSchemeRulesBySchemeID :many
SELECT
    id,
    scheme_id,
    field,
    operator,
    value
FROM scheme_rules
WHERE scheme_id = $1
ORDER BY id;


-- name: DeleteSchemeRule :one
DELETE FROM scheme_rules
WHERE id = $1
RETURNING id;

