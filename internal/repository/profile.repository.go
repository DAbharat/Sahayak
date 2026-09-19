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
	state *string,
	district *string,
	occupation string,
	monthlyIncome *int64,
	incomeCurrency string,
	familySize *int32,
	childrenCount *int32,
	childrenSchoolGoing *bool,
	age *int32,
	gender *string,
	isRegisteredWorker *bool,
	casteCategory *string,
	hasBankAccount *bool,
	documentsAvailable []string,
	language string,
) (sqlc.Profile, error) {

	params := sqlc.CreateProfileParams{
		AccountID:           accountID,
		State:               pgtypeText(state),
		District:            pgtypeText(district),
		Occupation:          occupation,
		MonthlyIncome:       pgtypeInt8(monthlyIncome),
		IncomeCurrency:      incomeCurrency,
		FamilySize:          pgtypeInt4FromInt32(familySize),
		ChildrenCount:       pgtypeInt4FromInt32(childrenCount),
		ChildrenSchoolGoing: pgtypeBool(childrenSchoolGoing),
		Age:                 pgtypeInt4FromInt32(age),
		Gender:              nullGender(gender),
		IsRegisteredWorker:  pgtypeBool(isRegisteredWorker),
		CasteCategory:       pgtypeText(casteCategory),
		HasBankAccount:      pgtypeBool(hasBankAccount),
		DocumentsAvailable:  documentsAvailable,
		Language:            language,
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
	state *string,
	district *string,
	occupation string,
	monthlyIncome *int64,
	incomeCurrency string,
	familySize *int32,
	childrenCount *int32,
	childrenSchoolGoing *bool,
	age *int32,
	gender *string,
	isRegisteredWorker *bool,
	casteCategory *string,
	hasBankAccount *bool,
	documentsAvailable []string,
	language string,
) (sqlc.Profile, error) {

	params := sqlc.UpdateProfileParams{
		AccountID:           accountID,
		State:               pgtypeText(state),
		District:            pgtypeText(district),
		Occupation:          occupation,
		MonthlyIncome:       pgtypeInt8(monthlyIncome),
		IncomeCurrency:      incomeCurrency,
		FamilySize:          pgtypeInt4FromInt32(familySize),
		ChildrenCount:       pgtypeInt4FromInt32(childrenCount),
		ChildrenSchoolGoing: pgtypeBool(childrenSchoolGoing),
		Age:                 pgtypeInt4FromInt32(age),
		Gender:              nullGender(gender),
		IsRegisteredWorker:  pgtypeBool(isRegisteredWorker),
		CasteCategory:       pgtypeText(casteCategory),
		HasBankAccount:      pgtypeBool(hasBankAccount),
		DocumentsAvailable:  documentsAvailable,
		Language:            language,
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
