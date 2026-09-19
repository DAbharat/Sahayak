CREATE TABLE scheme_rules (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    scheme_id BIGINT REFERENCES schemes(id) ON DELETE CASCADE,
    field TEXT NOT NULL,
    operator TEXT NOT NULL,
    value JSONB NOT NULL
);

CREATE INDEX idx_scheme_rules_scheme_id
ON scheme_rules(scheme_id);