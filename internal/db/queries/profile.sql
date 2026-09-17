-- name: CreateProfile :one
INSERT INTO profiles (
    state,
    occupation,
    monthly_income,
    age,
    gender,
    children_count
)
VALUES (
    $1, $2, $3, $4, $5, $6
)
RETURNING
    id,
    state,
    occupation,
    monthly_income,
    age,
    gender,
    children_count;