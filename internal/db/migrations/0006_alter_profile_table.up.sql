ALTER TYPE gender RENAME TO gender_old;

CREATE TYPE gender AS ENUM (
    'male',
    'female',
    'other',
    'not_specified'
);

ALTER TABLE profiles
    ALTER COLUMN state DROP NOT NULL,
    ALTER COLUMN monthly_income DROP NOT NULL,
    ALTER COLUMN age DROP NOT NULL,
    ALTER COLUMN children_count DROP NOT NULL,
    ALTER COLUMN gender DROP NOT NULL;

ALTER TABLE profiles
    ALTER COLUMN gender TYPE gender
    USING (
        CASE gender::TEXT
            WHEN 'MALE' THEN 'male'
            WHEN 'FEMALE' THEN 'female'
            WHEN 'OTHER' THEN 'other'
        END
    )::gender;

DROP TYPE gender_old;

ALTER TABLE profiles
    ADD COLUMN district TEXT,
    ADD COLUMN income_currency TEXT NOT NULL DEFAULT 'INR',
    ADD COLUMN family_size INT,
    ADD COLUMN children_school_going BOOLEAN,
    ADD COLUMN is_registered_worker BOOLEAN,
    ADD COLUMN caste_category TEXT,
    ADD COLUMN has_bank_account BOOLEAN,
    ADD COLUMN documents_available TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN language TEXT NOT NULL DEFAULT 'en';