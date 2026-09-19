package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/DAbharat/Sahayak/internal/db/sqlc"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type RefreshTokenRepository struct {
	queries *sqlc.Queries
}

func NewRefreshTokenRepository(queries *sqlc.Queries) *RefreshTokenRepository {
	return &RefreshTokenRepository{
		queries: queries,
	}
}

func (r *RefreshTokenRepository) CreateRefreshToken(ctx context.Context, accountID int64, tokenHash string, expiresAt time.Time) (sqlc.RefreshToken, error) {
	params := sqlc.CreateRefreshTokenParams{
		AccountID: accountID,
		TokenHash: tokenHash,
		ExpiresAt: pgtype.Timestamptz{
			Time:  expiresAt,
			Valid: true,
		},
	}

	token, err := r.queries.CreateRefreshToken(ctx, params)
	if err != nil {
		return sqlc.RefreshToken{}, fmt.Errorf("create refresh token: %w", err)
	}

	return token, nil
}

func (r *RefreshTokenRepository) GetRefreshTokenByHash(ctx context.Context, tokenHash string) (sqlc.RefreshToken, error) {
	token, err := r.queries.GetRefreshTokenByHash(ctx, tokenHash)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return sqlc.RefreshToken{}, ErrRefreshTokenNotFound
		}

		return sqlc.RefreshToken{}, fmt.Errorf("get refresh token by hash: %w", err)
	}

	return token, nil
}

func (r *RefreshTokenRepository) DeleteRefreshToken(ctx context.Context, tokenHash string) error {
	err := r.queries.DeleteRefreshToken(ctx, tokenHash)
	if err != nil {
		return fmt.Errorf("delete refresh token: %w", err)
	}

	return nil
}

func (r *RefreshTokenRepository) DeleteRefreshTokensByAccountID(ctx context.Context, accountID int64) error {
	err := r.queries.DeleteRefreshTokensByAccountID(ctx, accountID)
	if err != nil {
		return fmt.Errorf("delete refresh tokens by account id: %w", err)
	}

	return nil
}
