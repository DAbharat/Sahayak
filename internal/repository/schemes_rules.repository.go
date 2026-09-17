package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/DAbharat/Sahayak/internal/db/sqlc"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type SchemeRulesRepository struct {
	queries *sqlc.Queries
}

func NewSchemeRulesRepository(queries *sqlc.Queries) *SchemeRulesRepository {
	return &SchemeRulesRepository{
		queries: queries,
	}
}

func (r *SchemeRulesRepository) CreateSchemeRule(
	ctx context.Context,
	schemeID int64,
	field string,
	operator string,
	value []byte,
) (sqlc.SchemeRule, error) {

	params := sqlc.CreateSchemeRuleParams{
		SchemeID: pgtype.Int8{
			Int64: schemeID,
			Valid: true,
		},
		Field:    field,
		Operator: operator,
		Value:    value,
	}

	rule, err := r.queries.CreateSchemeRule(ctx, params)
	if err != nil {
		return sqlc.SchemeRule{}, fmt.Errorf("create scheme rule: %w", err)
	}

	return rule, nil
}

func (r *SchemeRulesRepository) GetSchemeRuleByID(
	ctx context.Context,
	id int64,
) (sqlc.SchemeRule, error) {

	rule, err := r.queries.GetSchemeRuleByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return sqlc.SchemeRule{}, ErrSchemeRuleNotFound
		}

		return sqlc.SchemeRule{}, fmt.Errorf("get scheme rule by id: %w", err)
	}

	return rule, nil
}

func (r *SchemeRulesRepository) GetSchemeRulesBySchemeID(
	ctx context.Context,
	schemeID int64,
) ([]sqlc.SchemeRule, error) {

	rules, err := r.queries.GetSchemeRulesBySchemeID(ctx, pgtype.Int8{
		Int64: schemeID,
		Valid: true,
	})

	if err != nil {
		return nil, fmt.Errorf("get scheme rules by scheme id: %w", err)
	}

	return rules, nil
}

func (r *SchemeRulesRepository) DeleteSchemeRule(
	ctx context.Context,
	id int64,
) (int64, error) {

	deletedID, err := r.queries.DeleteSchemeRule(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return 0, ErrSchemeRuleNotFound
		}

		return 0, fmt.Errorf("delete scheme rule: %w", err)
	}

	return deletedID, nil
}
