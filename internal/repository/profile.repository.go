package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/DAbharat/Sahayak/internal/db/sqlc"
	"github.com/jackc/pgx/v5"
)

type ProfileRepository struct {
	queries *sqlc.Queries
}

func NewProfileRepository(queries *sqlc.Queries) *ProfileRepository {
	return &ProfileRepository{
		queries: queries,
	}
}

func (r *ProfileRepository) CreateProfile(
	ctx context.Context,
	accountID int64,
	state string,
	occupation string,
	monthlyIncome int64,
	age int32,
	gender sqlc.Gender,
	childrenCount int32,
) (sqlc.Profile, error) {

	params := sqlc.CreateProfileParams{
		AccountID:     accountID,
		State:         state,
		Occupation:    occupation,
		MonthlyIncome: monthlyIncome,
		Age:           age,
		Gender:        gender,
		ChildrenCount: childrenCount,
	}

	profile, err := r.queries.CreateProfile(ctx, params)
	if err != nil {
		return sqlc.Profile{}, fmt.Errorf("create profile: %w", err)
	}

	return profile, nil
}

func (r *ProfileRepository) GetProfileByAccountID(
	ctx context.Context,
	accountID int64,
) (sqlc.Profile, error) {

	profile, err := r.queries.GetProfileByAccountID(ctx, accountID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return sqlc.Profile{}, ErrProfileNotFound
		}

		return sqlc.Profile{}, fmt.Errorf("get profile by account id: %w", err)
	}

	return profile, nil
}

func (r *ProfileRepository) GetProfileByID(
	ctx context.Context,
	id int64,
) (sqlc.Profile, error) {

	profile, err := r.queries.GetProfileByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return sqlc.Profile{}, ErrProfileNotFound
		}

		return sqlc.Profile{}, fmt.Errorf("get profile by id: %w", err)
	}

	return profile, nil
}

func (r *ProfileRepository) UpdateProfile(
	ctx context.Context,
	accountID int64,
	state string,
	occupation string,
	monthlyIncome int64,
	age int32,
	gender sqlc.Gender,
	childrenCount int32,
) (sqlc.Profile, error) {

	params := sqlc.UpdateProfileParams{
		AccountID:     accountID,
		State:         state,
		Occupation:    occupation,
		MonthlyIncome: monthlyIncome,
		Age:           age,
		Gender:        gender,
		ChildrenCount: childrenCount,
	}

	profile, err := r.queries.UpdateProfile(ctx, params)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return sqlc.Profile{}, ErrProfileNotFound
		}

		return sqlc.Profile{}, fmt.Errorf("update profile: %w", err)
	}

	return profile, nil
}
