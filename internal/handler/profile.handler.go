package handler

import (
	"context"
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/DAbharat/Sahayak/internal/dto"
	"github.com/DAbharat/Sahayak/internal/httpx"
	"github.com/DAbharat/Sahayak/internal/service"

	"github.com/gorilla/mux"
)

type ProfileService interface {
	CreateProfile(
		ctx context.Context,
		accountID int64,
		req dto.CreateProfileRequest,
	) (dto.ProfileResponse, error)

	GetProfileByAccountID(
		ctx context.Context,
		accountID int64,
	) (dto.ProfileResponse, error)

	UpdateProfile(
		ctx context.Context,
		accountID int64,
		req dto.CreateProfileRequest,
	) (dto.ProfileResponse, error)
}

type ProfileHandler struct {
	profileService ProfileService
}

func NewProfileHandler(profileService ProfileService) *ProfileHandler {
	return &ProfileHandler{
		profileService: profileService,
	}
}

func parseAccountID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	accountID, err := strconv.ParseInt(
		mux.Vars(r)["accountID"],
		10,
		64,
	)
	if err != nil {
		httpx.RespondWithError(
			w,
			http.StatusBadRequest,
			service.ErrInvalidAccountID.Error(),
		)
		return 0, false
	}

	return accountID, true
}

func (h *ProfileHandler) CreateProfile(w http.ResponseWriter, r *http.Request) {
	accountID, ok := parseAccountID(w, r)
	if !ok {
		return
	}

	var req dto.CreateProfileRequest

	if err := decodeJSONBody(w, r, &req); err != nil {
		httpx.RespondWithError(
			w,
			http.StatusBadRequest,
			"invalid or oversized request body",
		)
		return
	}

	profile, err := h.profileService.CreateProfile(
		r.Context(),
		accountID,
		req,
	)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidAccountID),
			errors.Is(err, service.ErrInvalidState),
			errors.Is(err, service.ErrInvalidOccupation),
			errors.Is(err, service.ErrInvalidMonthlyIncome),
			errors.Is(err, service.ErrInvalidAge),
			errors.Is(err, service.ErrInvalidGender),
			errors.Is(err, service.ErrInvalidChildrenCount):
			httpx.RespondWithError(w, http.StatusBadRequest, err.Error())

		default:
			log.Printf("create profile failed: %v", err)
			httpx.RespondWithError(
				w,
				http.StatusInternalServerError,
				"internal server error",
			)
		}
		return
	}

	httpx.RespondWithJSON(w, http.StatusCreated, profile)
}

func (h *ProfileHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	accountID, ok := parseAccountID(w, r)
	if !ok {
		return
	}

	profile, err := h.profileService.GetProfileByAccountID(
		r.Context(),
		accountID,
	)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidAccountID):
			httpx.RespondWithError(w, http.StatusBadRequest, err.Error())

		case errors.Is(err, service.ErrProfileNotFound):
			httpx.RespondWithError(w, http.StatusNotFound, err.Error())

		default:
			log.Printf("get profile failed: %v", err)
			httpx.RespondWithError(
				w,
				http.StatusInternalServerError,
				"internal server error",
			)
		}
		return
	}

	httpx.RespondWithJSON(w, http.StatusOK, profile)
}

func (h *ProfileHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	accountID, ok := parseAccountID(w, r)
	if !ok {
		return
	}

	var req dto.CreateProfileRequest

	if err := decodeJSONBody(w, r, &req); err != nil {
		httpx.RespondWithError(
			w,
			http.StatusBadRequest,
			"invalid or oversized request body",
		)
		return
	}

	profile, err := h.profileService.UpdateProfile(
		r.Context(),
		accountID,
		req,
	)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidAccountID),
			errors.Is(err, service.ErrInvalidState),
			errors.Is(err, service.ErrInvalidOccupation),
			errors.Is(err, service.ErrInvalidMonthlyIncome),
			errors.Is(err, service.ErrInvalidAge),
			errors.Is(err, service.ErrInvalidGender),
			errors.Is(err, service.ErrInvalidChildrenCount):
			httpx.RespondWithError(w, http.StatusBadRequest, err.Error())

		case errors.Is(err, service.ErrProfileNotFound):
			httpx.RespondWithError(w, http.StatusNotFound, err.Error())

		default:
			log.Printf("update profile failed: %v", err)
			httpx.RespondWithError(
				w,
				http.StatusInternalServerError,
				"internal server error",
			)
		}
		return
	}

	httpx.RespondWithJSON(w, http.StatusOK, profile)
}
