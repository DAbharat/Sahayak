package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/DAbharat/Sahayak/internal/db/sqlc"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type SchemeRepository struct {
	queries *sqlc.Queries
}

func NewSchemeRepository(queries *sqlc.Queries) *SchemeRepository {
	return &SchemeRepository{
		queries: queries,
	}
}

func (r *SchemeRepository) CreateScheme(
	ctx context.Context,
	name string,
	description string,
	state string,
	sourceURL string,
	lastVerifiedAt pgtype.Timestamptz,
) (sqlc.Scheme, error) {

	params := sqlc.CreateSchemeParams{
		Name:           name,
		Description:    description,
		State:          state,
		SourceUrl:      sourceURL,
		LastVerifiedAt: lastVerifiedAt,
	}

	scheme, err := r.queries.CreateScheme(ctx, params)
	if err != nil {
		return sqlc.Scheme{}, fmt.Errorf("create scheme: %w", err)
	}

	return scheme, nil
}

func (r *SchemeRepository) GetSchemeByID(
	ctx context.Context,
	id int64,
) (sqlc.Scheme, error) {

	scheme, err := r.queries.GetSchemeByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return sqlc.Scheme{}, ErrSchemeNotFound
		}

		return sqlc.Scheme{}, fmt.Errorf("get scheme by id: %w", err)
	}

	return scheme, nil
}

func (r *SchemeRepository) ListSchemes(
	ctx context.Context,
) ([]sqlc.Scheme, error) {

	schemes, err := r.queries.ListSchemes(ctx)
	if err != nil {
		return nil, fmt.Errorf("list schemes: %w", err)
	}

	return schemes, nil
}

func (r *SchemeRepository) ListSchemesByState(
	ctx context.Context,
	state string,
) ([]sqlc.Scheme, error) {

	schemes, err := r.queries.ListSchemesByState(ctx, state)
	if err != nil {
		return nil, fmt.Errorf("list schemes by state: %w", err)
	}

	return schemes, nil
}

func (r *SchemeRepository) UpdateScheme(
	ctx context.Context,
	id int64,
	name string,
	description string,
	state string,
	sourceURL string,
	lastVerifiedAt pgtype.Timestamptz,
) (sqlc.Scheme, error) {

	params := sqlc.UpdateSchemeParams{
		ID:             id,
		Name:           name,
		Description:    description,
		State:          state,
		SourceUrl:      sourceURL,
		LastVerifiedAt: lastVerifiedAt,
	}

	scheme, err := r.queries.UpdateScheme(ctx, params)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return sqlc.Scheme{}, ErrSchemeNotFound
		}

		return sqlc.Scheme{}, fmt.Errorf("update scheme: %w", err)
	}

	return scheme, nil
}

func (r *SchemeRepository) DeleteScheme(
	ctx context.Context,
	id int64,
) (int64, error) {

	deletedID, err := r.queries.DeleteScheme(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return 0, ErrSchemeNotFound
		}

		return 0, fmt.Errorf("delete scheme: %w", err)
	}

	return deletedID, nil
}
