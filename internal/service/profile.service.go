package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/DAbharat/Sahayak/internal/db/sqlc"
	"github.com/DAbharat/Sahayak/internal/dto"
	"github.com/DAbharat/Sahayak/internal/repository"
)

type ProfileRepo interface {
	CreateProfile(
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
	) (sqlc.Profile, error)

	GetProfileByAccountID(ctx context.Context, accountID int64) (sqlc.Profile, error)

	GetProfileByID(ctx context.Context, id int64) (sqlc.Profile, error)

	UpdateProfile(
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
	) (sqlc.Profile, error)
}

type ProfileService struct {
	profileRepo ProfileRepo
}

func NewProfileService(profileRepo ProfileRepo) *ProfileService {
	return &ProfileService{
		profileRepo: profileRepo,
	}
}

func (s *ProfileService) validateProfile(req dto.CreateProfileRequest) error {
	if strings.TrimSpace(req.Occupation) == "" {
		return ErrInvalidOccupation
	}

	if req.MonthlyIncome != nil && *req.MonthlyIncome < 0 {
		return ErrInvalidMonthlyIncome
	}

	if req.Age != nil && (*req.Age < 0 || *req.Age > 150) {
		return ErrInvalidAge
	}

	if req.FamilySize != nil && *req.FamilySize < 1 {
		return ErrInvalidFamilySize
	}

	if req.ChildrenCount != nil && *req.ChildrenCount < 0 {
		return ErrInvalidChildrenCount
	}

	if req.Gender != nil {
		switch *req.Gender {
		case "male", "female", "other", "not_specified":
		default:
			return ErrInvalidGender
		}
	}

	return nil
}

func (s *ProfileService) CreateProfile(
	ctx context.Context,
	accountID int64,
	req dto.CreateProfileRequest,
) (dto.ProfileResponse, error) {

	if accountID <= 0 {
		return dto.ProfileResponse{}, ErrInvalidAccountID
	}

	if err := s.validateProfile(req); err != nil {
		return dto.ProfileResponse{}, err
	}

	profile, err := s.profileRepo.CreateProfile(
		ctx,
		accountID,
		req.State,
		req.District,
		strings.TrimSpace(req.Occupation),
		req.MonthlyIncome,
		req.IncomeCurrency,
		req.FamilySize,
		req.ChildrenCount,
		req.ChildrenSchoolGoing,
		req.Age,
		req.Gender,
		req.IsRegisteredWorker,
		req.CasteCategory,
		req.HasBankAccount,
		req.DocumentsAvailable,
		req.Language,
	)
	if err != nil {
		return dto.ProfileResponse{}, fmt.Errorf("create profile: %w", err)
	}

	return mapProfile(profile), nil
}

func (s *ProfileService) GetProfileByAccountID(
	ctx context.Context,
	accountID int64,
) (dto.ProfileResponse, error) {

	if accountID <= 0 {
		return dto.ProfileResponse{}, ErrInvalidAccountID
	}

	profile, err := s.profileRepo.GetProfileByAccountID(ctx, accountID)
	if err != nil {
		if errors.Is(err, repository.ErrProfileNotFound) {
			return dto.ProfileResponse{}, ErrProfileNotFound
		}

		return dto.ProfileResponse{}, fmt.Errorf("get profile: %w", err)
	}

	return mapProfile(profile), nil
}

func (s *ProfileService) GetProfileByID(
	ctx context.Context,
	id int64,
) (dto.ProfileResponse, error) {

	if id <= 0 {
		return dto.ProfileResponse{}, ErrInvalidProfileID
	}

	profile, err := s.profileRepo.GetProfileByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrProfileNotFound) {
			return dto.ProfileResponse{}, ErrProfileNotFound
		}

		return dto.ProfileResponse{}, fmt.Errorf("get profile by id: %w", err)
	}

	return mapProfile(profile), nil
}

func (s *ProfileService) UpdateProfile(
	ctx context.Context,
	accountID int64,
	req dto.CreateProfileRequest,
) (dto.ProfileResponse, error) {

	if accountID <= 0 {
		return dto.ProfileResponse{}, ErrInvalidAccountID
	}

	if err := s.validateProfile(req); err != nil {
		return dto.ProfileResponse{}, err
	}

	profile, err := s.profileRepo.UpdateProfile(
		ctx,
		accountID,
		req.State,
		req.District,
		strings.TrimSpace(req.Occupation),
		req.MonthlyIncome,
		req.IncomeCurrency,
		req.FamilySize,
		req.ChildrenCount,
		req.ChildrenSchoolGoing,
		req.Age,
		req.Gender,
		req.IsRegisteredWorker,
		req.CasteCategory,
		req.HasBankAccount,
		req.DocumentsAvailable,
		req.Language,
	)
	if err != nil {
		if errors.Is(err, repository.ErrProfileNotFound) {
			return dto.ProfileResponse{}, ErrProfileNotFound
		}

		return dto.ProfileResponse{}, fmt.Errorf("update profile: %w", err)
	}

	return mapProfile(profile), nil
}

func mapProfile(profile sqlc.Profile) dto.ProfileResponse {
	var state *string
	if profile.State.Valid {
		state = &profile.State.String
	}

	var district *string
	if profile.District.Valid {
		district = &profile.District.String
	}

	var monthlyIncome *int64
	if profile.MonthlyIncome.Valid {
		monthlyIncome = &profile.MonthlyIncome.Int64
	}

	var familySize *int32
	if profile.FamilySize.Valid {
		familySize = &profile.FamilySize.Int32
	}

	var childrenCount *int32
	if profile.ChildrenCount.Valid {
		childrenCount = &profile.ChildrenCount.Int32
	}

	var childrenSchoolGoing *bool
	if profile.ChildrenSchoolGoing.Valid {
		childrenSchoolGoing = &profile.ChildrenSchoolGoing.Bool
	}

	var age *int32
	if profile.Age.Valid {
		age = &profile.Age.Int32
	}

	var gender *string
	if profile.Gender.Valid {
		value := string(profile.Gender.Gender)
		gender = &value
	}

	var isRegisteredWorker *bool
	if profile.IsRegisteredWorker.Valid {
		isRegisteredWorker = &profile.IsRegisteredWorker.Bool
	}

	var casteCategory *string
	if profile.CasteCategory.Valid {
		casteCategory = &profile.CasteCategory.String
	}

	var hasBankAccount *bool
	if profile.HasBankAccount.Valid {
		hasBankAccount = &profile.HasBankAccount.Bool
	}

	return dto.ProfileResponse{
		ID:                  profile.ID,
		AccountID:           profile.AccountID,
		State:               state,
		District:            district,
		Occupation:          profile.Occupation,
		MonthlyIncome:       monthlyIncome,
		IncomeCurrency:      profile.IncomeCurrency,
		FamilySize:          familySize,
		ChildrenCount:       childrenCount,
		ChildrenSchoolGoing: childrenSchoolGoing,
		Age:                 age,
		Gender:              gender,
		IsRegisteredWorker:  isRegisteredWorker,
		CasteCategory:       casteCategory,
		HasBankAccount:      hasBankAccount,
		DocumentsAvailable:  profile.DocumentsAvailable,
		Language:            profile.Language,
		CreatedAt:           profile.CreatedAt.Time,
	}
}
