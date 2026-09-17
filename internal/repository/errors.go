package repository

import "errors"

var (
	ErrDuplicateEmail     = errors.New("email already exists")
	ErrAccountNotFound    = errors.New("account not found")
	ErrProfileNotFound    = errors.New("profile not found")
	ErrSchemeNotFound     = errors.New("scheme not found")
	ErrSchemeRuleNotFound = errors.New("scheme rule not found")
)
