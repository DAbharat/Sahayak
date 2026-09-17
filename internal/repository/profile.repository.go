package repository

import (
	"context"

	"github.com/DAbharat/Sahayak/internal/db/sqlc"
)

type ProfileRepository struct {
	queries *sqlc.Queries
}

func NewProfileRepository(queries *sqlc.Queries) *ProfileRepository {
	return &ProfileRepository{
		queries: queries,
	}
}

func (r *ProfileRepository) CreateProfile(ctx context.Context, state, occupation string, monthlyIncome int64, age int32, gender sqlc.Gender, childrenCount int32) (sqlc.CreateProfileRow, error) {
	params := sqlc.CreateProfileParams{
		State:         state,
		Occupation:    occupation,
		MonthlyIncome: monthlyIncome,
		Age:           age,
		Gender:        gender,
		ChildrenCount: childrenCount,
	}

	profile, err := r.queries.CreateProfile(ctx, params)
	if err != nil {
		return sqlc.CreateProfileRow{}, err
	}

	return profile, nil
}
