package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/DAbharat/Sahayak/internal/db/sqlc"
	"github.com/DAbharat/Sahayak/internal/dto"
	"github.com/DAbharat/Sahayak/internal/repository"
)

type GrievanceService struct {
	profileRepo *repository.ProfileRepository
	schemeRepo  *repository.SchemeRepository
}

func NewGrievanceService(
	profileRepo *repository.ProfileRepository,
	schemeRepo *repository.SchemeRepository,
) *GrievanceService {
	return &GrievanceService{
		profileRepo: profileRepo,
		schemeRepo:  schemeRepo,
	}
}

func (s *GrievanceService) PrepareRequest(
	ctx context.Context,
	accountID int64,
	req dto.GrievanceRequest,
) (dto.GenerateGrievanceResponse, error) {

	if req.SchemeID <= 0 {
		return dto.GenerateGrievanceResponse{}, ErrInvalidSchemeID
	}

	if strings.TrimSpace(req.UserText) == "" {
		return dto.GenerateGrievanceResponse{}, ErrInvalidUserText
	}

	profileContext := req.ProfileContext
	profile, err := s.profileRepo.GetProfileByAccountID(ctx, accountID)
	log.Printf("PROFILE FROM DB: %+v", profile)
	if err != nil {
		if !errors.Is(err, repository.ErrProfileNotFound) {
			return dto.GenerateGrievanceResponse{}, fmt.Errorf("get profile: %w", err)
		}
	} else {
		log.Printf("PROFILE FROM DB: %+v", profile)
		profileContext = getProfileContext(profile)
	}

	scheme, err := s.schemeRepo.GetSchemeByID(ctx, req.SchemeID)
	if err != nil {
		if errors.Is(err, repository.ErrSchemeNotFound) {
			return dto.GenerateGrievanceResponse{}, ErrSchemeNotFound
		}

		return dto.GenerateGrievanceResponse{}, fmt.Errorf("get scheme: %w", err)
	}

	return dto.GenerateGrievanceResponse{
		UserText:       req.UserText,
		DraftType:      "grievance",
		Language:       req.Language,
		ProfileContext: profileContext,
		SchemeName:     scheme.Name,
		DepartmentName: scheme.DepartmentName.String,
	}, nil
}

func getGender(profile sqlc.Profile) string {
	if !profile.Gender.Valid {
		return ""
	}

	return string(profile.Gender.Gender)
}

func getProfileContext(profile sqlc.Profile) dto.ProfileContext {
	var state string
	if profile.State.Valid {
		state = profile.State.String
	}

	var monthlyIncome int64
	if profile.MonthlyIncome.Valid {
		monthlyIncome = profile.MonthlyIncome.Int64
	}

	var age int32
	if profile.Age.Valid {
		age = profile.Age.Int32
	}

	var childrenCount int32
	if profile.ChildrenCount.Valid {
		childrenCount = profile.ChildrenCount.Int32
	}

	var gender string
	if profile.Gender.Valid {
		gender = string(profile.Gender.Gender)
	}

	var district string
	if profile.District.Valid {
		district = profile.District.String
	}

	return dto.ProfileContext{
		Name:          profile.Name,
		State:         state,
		District:      district,
		Occupation:    profile.Occupation,
		MonthlyIncome: monthlyIncome,
		Age:           age,
		Gender:        gender,
		ChildrenCount: childrenCount,
	}
}
