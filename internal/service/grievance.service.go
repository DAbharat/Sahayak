package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/DAbharat/Sahayak/internal/dto"
	"github.com/DAbharat/Sahayak/internal/repository"
)

type GrievanceService struct {
	profileRepo *repository.ProfileRepository
	schemeRepo  *repository.SchemeRepository
}

func NewGrievanceService(profileRepo *repository.ProfileRepository, schemeRepo *repository.SchemeRepository) *GrievanceService {
	return &GrievanceService{
		profileRepo: profileRepo,
		schemeRepo:  schemeRepo,
	}
}

func (s *GrievanceService) PrepareRequest(ctx context.Context, accountID int64, req dto.GrievanceRequest) (dto.GenerateGrievanceResponse, error) {
	if req.SchemeID <= 0 {
		return dto.GenerateGrievanceResponse{}, ErrInvalidSchemeID
	}

	if strings.TrimSpace(req.UserText) == "" {
		return dto.GenerateGrievanceResponse{}, ErrInvalidUserText
	}

	profile, err := s.profileRepo.GetProfileByAccountID(ctx, accountID)
	if err != nil {
		if errors.Is(err, repository.ErrProfileNotFound) {
			return dto.GenerateGrievanceResponse{}, ErrProfileNotFound
		}
		return dto.GenerateGrievanceResponse{}, fmt.Errorf("get profile: %w", err)
	}

	scheme, err := s.schemeRepo.GetSchemeByID(ctx, req.SchemeID)
	if err != nil {
		if errors.Is(err, repository.ErrSchemeNotFound) {
			return dto.GenerateGrievanceResponse{}, ErrSchemeNotFound
		}
		return dto.GenerateGrievanceResponse{}, fmt.Errorf("get scheme: %w", err)
	}

	return dto.GenerateGrievanceResponse{
		UserText:  req.UserText,
		DraftType: "grievance",
		Language:  req.Language,
		ProfileContext: dto.ProfileContext{
			State:         profile.State,
			Occupation:    profile.Occupation,
			MonthlyIncome: profile.MonthlyIncome,
			Age:           profile.Age,
			Gender:        string(profile.Gender),
			ChildrenCount: profile.ChildrenCount,
		},
		SchemeName: scheme.Name,
	}, nil
}
