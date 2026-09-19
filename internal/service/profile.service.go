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
	CreateProfile(ctx context.Context, accountID int64, state string, occupation string, monthlyIncome int64, age int32, gender sqlc.Gender, childrenCount int32) (sqlc.Profile, error)
	GetProfileByAccountID(ctx context.Context, accountID int64) (sqlc.Profile, error)
	GetProfileByID(ctx context.Context, id int64) (sqlc.Profile, error)
	UpdateProfile(ctx context.Context, accountID int64, state string, occupation string, monthlyIncome int64, age int32, gender sqlc.Gender, childrenCount int32) (sqlc.Profile, error)
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
	if strings.TrimSpace(req.State) == "" {
		return ErrInvalidState
	}

	if strings.TrimSpace(req.Occupation) == "" {
		return ErrInvalidOccupation
	}

	if req.MonthlyIncome < 0 {
		return ErrInvalidMonthlyIncome
	}

	if req.Age <= 0 || req.Age > 120 {
		return ErrInvalidAge
	}

	if req.ChildrenCount < 0 {
		return ErrInvalidChildrenCount
	}

	switch req.Gender {
	case "MALE", "FEMALE", "OTHER":
		// valid
	default:
		return ErrInvalidGender
	}

	return nil
}

func (s *ProfileService) CreateProfile(ctx context.Context, accountID int64, req dto.CreateProfileRequest) (dto.ProfileResponse, error) {

	if accountID <= 0 {
		return dto.ProfileResponse{}, ErrInvalidAccountID
	}

	if err := s.validateProfile(req); err != nil {
		return dto.ProfileResponse{}, err
	}

	profile, err := s.profileRepo.CreateProfile(
		ctx,
		accountID,
		strings.TrimSpace(req.State),
		strings.TrimSpace(req.Occupation),
		req.MonthlyIncome,
		req.Age,
		sqlc.Gender(req.Gender),
		req.ChildrenCount,
	)
	if err != nil {
		return dto.ProfileResponse{}, fmt.Errorf("create profile: %w", err)
	}

	return mapProfile(profile), nil
}

func (s *ProfileService) GetProfileByAccountID(ctx context.Context, accountID int64) (dto.ProfileResponse, error) {

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

func (s *ProfileService) GetProfileByID(ctx context.Context, id int64) (dto.ProfileResponse, error) {

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

func (s *ProfileService) UpdateProfile(ctx context.Context, accountID int64, req dto.CreateProfileRequest) (dto.ProfileResponse, error) {

	if accountID <= 0 {
		return dto.ProfileResponse{}, ErrInvalidAccountID
	}

	if err := s.validateProfile(req); err != nil {
		return dto.ProfileResponse{}, err
	}

	profile, err := s.profileRepo.UpdateProfile(
		ctx,
		accountID,
		strings.TrimSpace(req.State),
		strings.TrimSpace(req.Occupation),
		req.MonthlyIncome,
		req.Age,
		sqlc.Gender(req.Gender),
		req.ChildrenCount,
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
	return dto.ProfileResponse{
		ID:            profile.ID,
		AccountID:     profile.AccountID,
		State:         profile.State,
		Occupation:    profile.Occupation,
		MonthlyIncome: profile.MonthlyIncome,
		Age:           profile.Age,
		Gender:        string(profile.Gender),
		ChildrenCount: profile.ChildrenCount,
		CreatedAt:     profile.CreatedAt.Time,
	}
}
