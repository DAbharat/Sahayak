ALTER TABLE profiles
    DROP COLUMN language,
    DROP COLUMN documents_available,
    DROP COLUMN has_bank_account,
    DROP COLUMN caste_category,
    DROP COLUMN is_registered_worker,
    DROP COLUMN children_school_going,
    DROP COLUMN family_size,
    DROP COLUMN income_currency,
    DROP COLUMN district;

ALTER TABLE profiles
    ALTER COLUMN state SET NOT NULL,
    ALTER COLUMN monthly_income SET NOT NULL,
    ALTER COLUMN age SET NOT NULL,
    ALTER COLUMN children_count SET NOT NULL;

CREATE TYPE gender_old AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);

ALTER TABLE profiles
    ALTER COLUMN gender TYPE gender_old
    USING (
        CASE gender::TEXT
            WHEN 'male' THEN 'MALE'
            WHEN 'female' THEN 'FEMALE'
            WHEN 'other' THEN 'OTHER'
        END
    )::gender_old;

DROP TYPE gender;

ALTER TYPE gender_old RENAME TO gender;

ALTER TABLE profiles
    ALTER COLUMN gender SET NOT NULL;