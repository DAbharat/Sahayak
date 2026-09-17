package service

import "errors"

var (
	// Account
	ErrInvalidEmail       = errors.New("invalid email")
	ErrInvalidPassword    = errors.New("invalid password")
	ErrDuplicateEmail     = errors.New("email already exists")
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrAccountNotFound    = errors.New("account not found")
	ErrInvalidAccountID   = errors.New("invalid account id")

	// Profile
	ErrInvalidState         = errors.New("invalid state")
	ErrInvalidOccupation    = errors.New("invalid occupation")
	ErrInvalidMonthlyIncome = errors.New("invalid monthly income")
	ErrInvalidAge           = errors.New("invalid age")
	ErrInvalidGender        = errors.New("invalid gender")
	ErrInvalidChildrenCount = errors.New("invalid children count")
	ErrProfileNotFound      = errors.New("profile not found")
	ErrInvalidProfileID     = errors.New("invalid profile id")

	// Scheme
	ErrSchemeNotFound  = errors.New("scheme not found")
	ErrInvalidSchemeID = errors.New("invalid scheme id")

	// Scheme Rule
	ErrSchemeRuleNotFound  = errors.New("scheme rule not found")
	ErrInvalidSchemeRuleID = errors.New("invalid scheme rule id")
)
