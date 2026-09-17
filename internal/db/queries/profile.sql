-- name: CreateProfile :one
INSERT INTO profiles (
    account_id,
    state,
    occupation,
    monthly_income,
    age,
    gender,
    children_count
)
VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7
)
RETURNING
    id,
    account_id,
    state,
    occupation,
    monthly_income,
    age,
    gender,
    children_count,
    created_at;


-- name: GetProfileByAccountID :one
SELECT
    id,
    account_id,
    state,
    occupation,
    monthly_income,
    age,
    gender,
    children_count,
    created_at
FROM profiles
WHERE account_id = $1;


-- name: GetProfileByID :one
SELECT
    id,
    account_id,
    state,
    occupation,
    monthly_income,
    age,
    gender,
    children_count,
    created_at
FROM profiles
WHERE id = $1;


-- name: UpdateProfile :one
UPDATE profiles
SET
    state = $2,
    occupation = $3,
    monthly_income = $4,
    age = $5,
    gender = $6,
    children_count = $7
WHERE account_id = $1
RETURNING
    id,
    account_id,
    state,
    occupation,
    monthly_income,
    age,
    gender,
    children_count,
    created_at;

