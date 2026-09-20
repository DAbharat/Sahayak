-- name: CreateProfile :one
INSERT INTO profiles (
    name,
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
    $9, $10, $11, $12, $13, $14, $15, $16, $17
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
    name = $2,
    state = $3,
    district = $4,
    occupation = $5,
    monthly_income = $6,
    income_currency = $7,
    family_size = $8,
    children_count = $9,
    children_school_going = $10,
    age = $11,
    gender = $12,
    is_registered_worker = $13,
    caste_category = $14,
    has_bank_account = $15,
    documents_available = $16,
    language = $17
WHERE account_id = $1
RETURNING *;