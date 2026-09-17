-- name: CreateAccount :one
INSERT INTO accounts (
    email,
    password_hash
)
VALUES (
    $1,
    $2
)
RETURNING
    id,
    email,
    password_hash,
    created_at;


-- name: GetAccountByEmail :one
SELECT
    id,
    email,
    password_hash,
    created_at
FROM accounts
WHERE email = $1;


-- name: GetAccountByID :one
SELECT
    id,
    email,
    password_hash,
    created_at
FROM accounts
WHERE id = $1;