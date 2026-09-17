CREATE TYPE gender AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);

CREATE TABLE profiles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id BIGINT NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
    state TEXT NOT NULL,
    occupation TEXT NOT NULL,
    monthly_income BIGINT NOT NULL DEFAULT 0,
    age INT NOT NULL,
    gender gender NOT NULL,
    children_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_account_id
ON profiles(account_id);