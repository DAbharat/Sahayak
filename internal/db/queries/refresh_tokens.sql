-- name: CreateRefreshToken :one
INSERT INTO refresh_tokens (
    account_id,
    token_hash,
    expires_at
)
VALUES (
    $1,
    $2,
    $3
)
RETURNING
    id,
    account_id,
    token_hash,
    expires_at,
    created_at;


-- name: GetRefreshTokenByHash :one
SELECT
    id,
    account_id,
    token_hash,
    expires_at,
    created_at
FROM refresh_tokens
WHERE token_hash = $1;


-- name: DeleteRefreshToken :exec
DELETE FROM refresh_tokens
WHERE token_hash = $1;


-- name: DeleteRefreshTokensByAccountID :exec
DELETE FROM refresh_tokens
WHERE account_id = $1;