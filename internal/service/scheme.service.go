package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/DAbharat/Sahayak/internal/db/sqlc"
	"github.com/DAbharat/Sahayak/internal/dto"
	"github.com/DAbharat/Sahayak/internal/repository"
	"github.com/jackc/pgx/v5/pgtype"
)

type SchemeRepo interface {
	CreateScheme(ctx context.Context, name string, description string, state string, sourceURL string, lastVerifiedAt time.Time) (sqlc.Scheme, error)
	GetSchemeByID(ctx context.Context, id int64) (sqlc.Scheme, error)
	ListSchemes(ctx context.Context) ([]sqlc.Scheme, error)
	ListSchemesByState(ctx context.Context, state string) ([]sqlc.Scheme, error)
	UpdateScheme(ctx context.Context, id int64, name string, description string, state string, sourceURL string, lastVerifiedAt pgtype.Timestamptz) (sqlc.Scheme, error)
	DeleteScheme(ctx context.Context, id int64) (int64, error)
}

type SchemeService struct {
	schemeRepo SchemeRepo
}

func NewSchemeService(schemeRepo SchemeRepo) *SchemeService {
	return &SchemeService{
		schemeRepo: schemeRepo,
	}
}

func (s *SchemeService) CreateScheme(
	ctx context.Context,
	req dto.CreateSchemeRequest,
) (dto.SchemeResponse, error) {
	if strings.TrimSpace(req.Name) == "" {
		return dto.SchemeResponse{}, ErrInvalidSchemeName
	}

	if strings.TrimSpace(req.Description) == "" {
		return dto.SchemeResponse{}, ErrInvalidSchemeDescription
	}

	if strings.TrimSpace(req.State) == "" {
		return dto.SchemeResponse{}, ErrInvalidState
	}

	scheme, err := s.schemeRepo.CreateScheme(
		ctx,
		req.Name,
		req.Description,
		req.State,
		req.SourceURL,
		req.LastVerifiedAt,
	)
	if err != nil {
		return dto.SchemeResponse{}, fmt.Errorf("create scheme: %w", err)
	}

	return dto.SchemeResponse{
		ID:             scheme.ID,
		Name:           scheme.Name,
		Description:    scheme.Description,
		State:          scheme.State,
		SourceURL:      scheme.SourceUrl,
		LastVerifiedAt: scheme.LastVerifiedAt.Time,
	}, nil
}

func (s *SchemeService) GetSchemeByID(ctx context.Context, id int64) (dto.SchemeResponse, error) {

	if id <= 0 {
		return dto.SchemeResponse{}, ErrInvalidSchemeID
	}

	scheme, err := s.schemeRepo.GetSchemeByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrSchemeNotFound) {
			return dto.SchemeResponse{}, ErrSchemeNotFound
		}

		return dto.SchemeResponse{}, fmt.Errorf("get scheme: %w", err)
	}

	return mapScheme(scheme), nil
}

func (s *SchemeService) ListSchemes(ctx context.Context) ([]dto.SchemeResponse, error) {

	schemes, err := s.schemeRepo.ListSchemes(ctx)
	if err != nil {
		return nil, fmt.Errorf("list schemes: %w", err)
	}

	return mapSchemes(schemes), nil
}

func (s *SchemeService) ListSchemesByState(ctx context.Context, state string) ([]dto.SchemeResponse, error) {

	state = strings.TrimSpace(state)

	if state == "" {
		return nil, ErrInvalidState
	}

	schemes, err := s.schemeRepo.ListSchemesByState(ctx, state)
	if err != nil {
		return nil, fmt.Errorf("list schemes by state: %w", err)
	}

	return mapSchemes(schemes), nil
}

func mapScheme(scheme sqlc.Scheme) dto.SchemeResponse {
	return dto.SchemeResponse{
		ID:             scheme.ID,
		Name:           scheme.Name,
		Description:    scheme.Description,
		State:          scheme.State,
		SourceURL:      scheme.SourceUrl,
		LastVerifiedAt: scheme.LastVerifiedAt.Time,
	}
}

func mapSchemes(schemes []sqlc.Scheme) []dto.SchemeResponse {
	result := make([]dto.SchemeResponse, 0, len(schemes))

	for _, scheme := range schemes {
		result = append(result, mapScheme(scheme))
	}

	return result
}
