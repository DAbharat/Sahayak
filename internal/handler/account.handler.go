package handler

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"

	"github.com/DAbharat/Sahayak/internal/dto"
	"github.com/DAbharat/Sahayak/internal/httpx"
	"github.com/DAbharat/Sahayak/internal/repository"
	"github.com/DAbharat/Sahayak/internal/service"
)

type AccountService interface {
	CreateAccount(ctx context.Context, req dto.CreateAccountRequest) (dto.CreateAccountResponse, error)
	Login(ctx context.Context, req dto.LoginAccountRequest) (dto.LoginAccountResponse, error)
	GetAccountByID(ctx context.Context, id int64) (dto.AccountResponse, error)
}

type AccountHandler struct {
	accountService AccountService
}

func NewAccountHandler(accountService AccountService) *AccountHandler {
	return &AccountHandler{
		accountService: accountService,
	}
}

func decodeJSONBody(w http.ResponseWriter, r *http.Request, dst interface{}) error {
	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(dst); err != nil {
		return err
	}

	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		return errors.New("request body must contain a single JSON object")
	}

	return nil
}

func (h *AccountHandler) Signup(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateAccountRequest

	if err := decodeJSONBody(w, r, &req); err != nil {
		httpx.RespondWithError(
			w,
			http.StatusBadRequest,
			"invalid or oversized request body",
		)
		return
	}

	account, err := h.accountService.CreateAccount(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidEmail),
			errors.Is(err, service.ErrInvalidPassword):
			httpx.RespondWithError(w, http.StatusBadRequest, err.Error())

		case errors.Is(err, service.ErrDuplicateEmail),
			errors.Is(err, repository.ErrDuplicateEmail):
			httpx.RespondWithError(w, http.StatusConflict, err.Error())

		default:
			log.Printf("account signup failed: %v", err)
			httpx.RespondWithError(
				w,
				http.StatusInternalServerError,
				"internal server error",
			)
		}
		return
	}

	httpx.RespondWithJSON(w, http.StatusCreated, account)
}

func (h *AccountHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginAccountRequest

	if err := decodeJSONBody(w, r, &req); err != nil {
		httpx.RespondWithError(
			w,
			http.StatusBadRequest,
			"invalid or oversized request body",
		)
		return
	}

	account, err := h.accountService.Login(r.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidCredentials):
			httpx.RespondWithError(w, http.StatusUnauthorized, err.Error())

		default:
			log.Printf("account login failed: %v", err)
			httpx.RespondWithError(
				w,
				http.StatusInternalServerError,
				"internal server error",
			)
		}
		return
	}

	httpx.RespondWithJSON(w, http.StatusOK, account)
}
