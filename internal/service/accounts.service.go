package service

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"strings"

	"github.com/DAbharat/Sahayak/internal/db/sqlc"
	"github.com/DAbharat/Sahayak/internal/dto"
	"github.com/DAbharat/Sahayak/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

const passwordHashCost = bcrypt.DefaultCost

type AccountRepo interface {
	CreateAccount(
		ctx context.Context,
		email string,
		passwordHash string,
	) (sqlc.Account, error)

	GetAccountByEmail(
		ctx context.Context,
		email string,
	) (sqlc.Account, error)

	GetAccountByID(
		ctx context.Context,
		id int64,
	) (sqlc.Account, error)
}

type AccountService struct {
	accountRepo AccountRepo
}

func NewAccountService(accountRepo AccountRepo) *AccountService {
	return &AccountService{
		accountRepo: accountRepo,
	}
}

func (s *AccountService) validateCreateAccount(
	req dto.CreateAccountRequest,
) error {

	email := strings.TrimSpace(req.Email)

	if _, err := mail.ParseAddress(email); err != nil {
		return ErrInvalidEmail
	}

	if len(req.Password) < 8 || len(req.Password) > 72 {
		return ErrInvalidPassword
	}

	return nil
}

func (s *AccountService) CreateAccount(
	ctx context.Context,
	req dto.CreateAccountRequest,
) (dto.CreateAccountResponse, error) {

	req.Email = strings.TrimSpace(req.Email)

	if err := s.validateCreateAccount(req); err != nil {
		return dto.CreateAccountResponse{}, err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(req.Password),
		passwordHashCost,
	)
	if err != nil {
		return dto.CreateAccountResponse{},
			fmt.Errorf("hash password: %w", err)
	}

	account, err := s.accountRepo.CreateAccount(
		ctx,
		req.Email,
		string(hashedPassword),
	)
	if err != nil {
		if errors.Is(err, repository.ErrDuplicateEmail) {
			return dto.CreateAccountResponse{}, ErrDuplicateEmail
		}

		return dto.CreateAccountResponse{},
			fmt.Errorf("create account: %w", err)
	}

	return dto.CreateAccountResponse{
		ID:    account.ID,
		Email: account.Email,
	}, nil
}

func (s *AccountService) Login(
	ctx context.Context,
	req dto.LoginAccountRequest,
) (dto.LoginAccountResponse, error) {

	email := strings.TrimSpace(req.Email)

	if email == "" || req.Password == "" {
		return dto.LoginAccountResponse{}, ErrInvalidCredentials
	}

	account, err := s.accountRepo.GetAccountByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, repository.ErrAccountNotFound) {
			return dto.LoginAccountResponse{}, ErrInvalidCredentials
		}

		return dto.LoginAccountResponse{},
			fmt.Errorf("get account for login: %w", err)
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(account.PasswordHash),
		[]byte(req.Password),
	)
	if err != nil {
		return dto.LoginAccountResponse{}, ErrInvalidCredentials
	}

	return dto.LoginAccountResponse{
		ID:    account.ID,
		Email: account.Email,
	}, nil
}

func (s *AccountService) GetAccountByID(
	ctx context.Context,
	id int64,
) (dto.AccountResponse, error) {

	if id <= 0 {
		return dto.AccountResponse{}, ErrInvalidAccountID
	}

	account, err := s.accountRepo.GetAccountByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrAccountNotFound) {
			return dto.AccountResponse{}, ErrAccountNotFound
		}

		return dto.AccountResponse{},
			fmt.Errorf("get account by id: %w", err)
	}

	return dto.AccountResponse{
		ID:        account.ID,
		Email:     account.Email,
		CreatedAt: account.CreatedAt.Time,
	}, nil
}
