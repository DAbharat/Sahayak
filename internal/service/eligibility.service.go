package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/DAbharat/Sahayak/internal/db/sqlc"
	"github.com/DAbharat/Sahayak/internal/dto"
)

type EligibilityProfileRepo interface {
	GetProfileByAccountID(ctx context.Context, accountID int64) (sqlc.Profile, error)
}

type EligibilitySchemeRepo interface {
	GetSchemeByID(ctx context.Context, id int64) (sqlc.Scheme, error)
}

type EligibilityRuleRepo interface {
	GetSchemeRulesBySchemeID(ctx context.Context, schemeID int64) ([]sqlc.SchemeRule, error)
}

type EligibilityService struct {
	profileRepo EligibilityProfileRepo
	schemeRepo  EligibilitySchemeRepo
	ruleRepo    EligibilityRuleRepo
}

func NewEligibilityService(profileRepo EligibilityProfileRepo, schemeRepo EligibilitySchemeRepo, ruleRepo EligibilityRuleRepo) *EligibilityService {
	return &EligibilityService{
		profileRepo: profileRepo,
		schemeRepo:  schemeRepo,
		ruleRepo:    ruleRepo,
	}
}

type eligibilityRuleValue struct {
	StringValue *string
	NumberValue *float64
}

func parseRuleValue(value []byte) (eligibilityRuleValue, error) {
	var raw interface{}

	if err := json.Unmarshal(value, &raw); err != nil {
		return eligibilityRuleValue{}, fmt.Errorf("parse rule value: %w", err)
	}

	switch v := raw.(type) {
	case string:
		return eligibilityRuleValue{
			StringValue: &v,
		}, nil

	case float64:
		return eligibilityRuleValue{
			NumberValue: &v,
		}, nil

	default:
		return eligibilityRuleValue{}, fmt.Errorf("unsupported rule value")
	}
}

func getProfileField(profile sqlc.Profile, field string) (interface{}, error) {

	switch field {
	case "age":
		return profile.Age, nil

	case "monthly_income":
		return profile.MonthlyIncome, nil

	case "children_count":
		return profile.ChildrenCount, nil

	case "state":
		return profile.State, nil

	case "occupation":
		return profile.Occupation, nil

	case "gender":
		return string(profile.Gender), nil

	default:
		return nil, fmt.Errorf("unsupported eligibility field: %s", field)
	}
}

func evaluateRule(profile sqlc.Profile, rule sqlc.SchemeRule) (bool, error) {

	fieldValue, err := getProfileField(profile, rule.Field)
	if err != nil {
		return false, err
	}

	ruleValue, err := parseRuleValue(rule.Value)
	if err != nil {
		return false, err
	}

	switch value := fieldValue.(type) {

	case int64:
		if ruleValue.NumberValue == nil {
			return false, fmt.Errorf(
				"rule value for %s must be numeric",
				rule.Field,
			)
		}

		target := *ruleValue.NumberValue

		switch rule.Operator {
		case "eq":
			return float64(value) == target, nil
		case "neq":
			return float64(value) != target, nil
		case "gt":
			return float64(value) > target, nil
		case "gte":
			return float64(value) >= target, nil
		case "lt":
			return float64(value) < target, nil
		case "lte":
			return float64(value) <= target, nil
		default:
			return false, fmt.Errorf(
				"unsupported operator: %s",
				rule.Operator,
			)
		}

	case string:
		if ruleValue.StringValue == nil {
			return false, fmt.Errorf(
				"rule value for %s must be a string",
				rule.Field,
			)
		}

		target := strings.TrimSpace(*ruleValue.StringValue)

		switch rule.Operator {
		case "eq":
			return strings.EqualFold(value, target), nil
		case "neq":
			return !strings.EqualFold(value, target), nil
		default:
			return false, fmt.Errorf(
				"operator %s is not supported for string field %s",
				rule.Operator,
				rule.Field,
			)
		}

	default:
		return false, fmt.Errorf("unsupported profile field type")
	}
}

func (s *EligibilityService) CheckEligibility(ctx context.Context, accountID int64, schemeID int64) (dto.EligibilityResponse, error) {

	if accountID <= 0 {
		return dto.EligibilityResponse{}, ErrInvalidAccountID
	}

	if schemeID <= 0 {
		return dto.EligibilityResponse{}, ErrInvalidSchemeID
	}

	profile, err := s.profileRepo.GetProfileByAccountID(ctx, accountID)
	if err != nil {
		return dto.EligibilityResponse{},
			fmt.Errorf("get profile for eligibility: %w", err)
	}

	scheme, err := s.schemeRepo.GetSchemeByID(ctx, schemeID)
	if err != nil {
		return dto.EligibilityResponse{},
			fmt.Errorf("get scheme for eligibility: %w", err)
	}

	rules, err := s.ruleRepo.GetSchemeRulesBySchemeID(ctx, schemeID)
	if err != nil {
		return dto.EligibilityResponse{},
			fmt.Errorf("get scheme rules for eligibility: %w", err)
	}

	result := dto.EligibilityResponse{
		SchemeID:   scheme.ID,
		SchemeName: scheme.Name,
		Eligible:   true,
	}

	for _, rule := range rules {
		matched, err := evaluateRule(profile, rule)
		if err != nil {
			return dto.EligibilityResponse{},
				fmt.Errorf("evaluate scheme rule %d: %w", rule.ID, err)
		}

		if !matched {
			result.Eligible = false
			result.Reasons = append(
				result.Reasons,
				fmt.Sprintf(
					"Profile does not satisfy rule: %s %s %s",
					rule.Field,
					rule.Operator,
					string(rule.Value),
				),
			)
		}
	}

	return result, nil
}
