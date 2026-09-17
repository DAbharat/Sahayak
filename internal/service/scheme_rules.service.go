package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/DAbharat/Sahayak/internal/db/sqlc"
	"github.com/DAbharat/Sahayak/internal/repository"
)

type SchemeRulesRepo interface {
	CreateSchemeRule(ctx context.Context, schemeID int64, field string, operator string, value []byte) (sqlc.SchemeRule, error)
	GetSchemeRuleByID(ctx context.Context, id int64) (sqlc.SchemeRule, error)
	GetSchemeRulesBySchemeID(ctx context.Context, schemeID int64) ([]sqlc.SchemeRule, error)
	DeleteSchemeRule(ctx context.Context, id int64) (int64, error)
}

type SchemeRuleService struct {
	ruleRepo SchemeRulesRepo
}

func NewSchemeRuleService(ruleRepo SchemeRulesRepo) *SchemeRuleService {
	return &SchemeRuleService{
		ruleRepo: ruleRepo,
	}
}

func (s *SchemeRuleService) GetSchemeRuleByID(ctx context.Context, id int64) (sqlc.SchemeRule, error) {

	if id <= 0 {
		return sqlc.SchemeRule{}, ErrInvalidSchemeRuleID
	}

	rule, err := s.ruleRepo.GetSchemeRuleByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrSchemeRuleNotFound) {
			return sqlc.SchemeRule{}, ErrSchemeRuleNotFound
		}

		return sqlc.SchemeRule{}, fmt.Errorf("get scheme rule: %w", err)
	}

	return rule, nil
}

func (s *SchemeRuleService) GetSchemeRulesBySchemeID(ctx context.Context, schemeID int64,
) ([]sqlc.SchemeRule, error) {

	if schemeID <= 0 {
		return nil, ErrInvalidSchemeID
	}

	rules, err := s.ruleRepo.GetSchemeRulesBySchemeID(ctx, schemeID)
	if err != nil {
		return nil, fmt.Errorf("get scheme rules: %w", err)
	}

	return rules, nil
}
