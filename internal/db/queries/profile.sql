-- name: CreateProfile :one
INSERT INTO profiles (
    account_id,
    state,
    district,
    occupation,
    monthly_income,
    income_currency,
    family_size,
    children_count,
    children_school_going,
    age,
    gender,
    is_registered_worker,
    caste_category,
    has_bank_account,
    documents_available,
    language
)
VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8,
    $9, $10, $11, $12, $13, $14, $15, $16
)
RETURNING *;


-- name: GetProfileByAccountID :one
SELECT *
FROM profiles
WHERE account_id = $1;


-- name: GetProfileByID :one
SELECT *
FROM profiles
WHERE id = $1;


-- name: UpdateProfile :one
UPDATE profiles
SET
    state = $2,
    district = $3,
    occupation = $4,
    monthly_income = $5,
    income_currency = $6,
    family_size = $7,
    children_count = $8,
    children_school_going = $9,
    age = $10,
    gender = $11,
    is_registered_worker = $12,
    caste_category = $13,
    has_bank_account = $14,
    documents_available = $15,
    language = $16
WHERE account_id = $1
RETURNING *;