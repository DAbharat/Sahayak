package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/DAbharat/Sahayak/internal/db/sqlc"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type AccountsRepository struct {
	queries *sqlc.Queries
}

func NewAccountsRepository(queries *sqlc.Queries) *AccountsRepository {
	return &AccountsRepository{
		queries: queries,
	}
}

func (r *AccountsRepository) CreateAccount(
	ctx context.Context,
	email string,
	passwordHash string,
) (sqlc.Account, error) {

	params := sqlc.CreateAccountParams{
		Email:        email,
		PasswordHash: passwordHash,
	}

	account, err := r.queries.CreateAccount(ctx, params)
	if err != nil {
		var pgErr *pgconn.PgError

		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" {
				if pgErr.ConstraintName == "accounts_email_key" {
					return sqlc.Account{}, ErrDuplicateEmail
				}
			}
		}

		return sqlc.Account{}, fmt.Errorf("create account: %w", err)
	}

	return account, nil
}

func (r *AccountsRepository) GetAccountByEmail(
	ctx context.Context,
	email string,
) (sqlc.Account, error) {

	account, err := r.queries.GetAccountByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return sqlc.Account{}, ErrAccountNotFound
		}

		return sqlc.Account{}, fmt.Errorf("get account by email: %w", err)
	}

	return account, nil
}

func (r *AccountsRepository) GetAccountByID(
	ctx context.Context,
	id int64,
) (sqlc.Account, error) {

	account, err := r.queries.GetAccountByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return sqlc.Account{}, ErrAccountNotFound
		}

		return sqlc.Account{}, fmt.Errorf("get account by id: %w", err)
	}

	return account, nil
}
