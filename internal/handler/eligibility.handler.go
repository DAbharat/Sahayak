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
	"github.com/DAbharat/Sahayak/internal/service"
)

type EligibilityService interface {
	CheckEligibility(ctx context.Context, accountID int64, schemeID int64) (dto.EligibilityResponse, error)
}

type EligibilityHandler struct {
	eligibilityService EligibilityService
}

func NewEligibilityHandler(eligibilityService EligibilityService) *EligibilityHandler {
	return &EligibilityHandler{
		eligibilityService: eligibilityService,
	}
}

func (h *EligibilityHandler) CheckEligibility(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	var req dto.EligibilityRequest

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&req); err != nil {
		httpx.RespondWithError(
			w,
			http.StatusBadRequest,
			"invalid or oversized request body",
		)
		return
	}

	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		httpx.RespondWithError(
			w,
			http.StatusBadRequest,
			"request body must contain a single JSON object",
		)
		return
	}

	if req.AccountID <= 0 {
		httpx.RespondWithError(
			w,
			http.StatusBadRequest,
			service.ErrInvalidAccountID.Error(),
		)
		return
	}

	if req.SchemeID <= 0 {
		httpx.RespondWithError(
			w,
			http.StatusBadRequest,
			service.ErrInvalidSchemeID.Error(),
		)
		return
	}

	result, err := h.eligibilityService.CheckEligibility(
		r.Context(),
		req.AccountID,
		req.SchemeID,
	)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidAccountID),
			errors.Is(err, service.ErrInvalidSchemeID):
			httpx.RespondWithError(w, http.StatusBadRequest, err.Error())

		case errors.Is(err, service.ErrProfileNotFound):
			httpx.RespondWithError(w, http.StatusNotFound, err.Error())

		case errors.Is(err, service.ErrSchemeNotFound):
			httpx.RespondWithError(w, http.StatusNotFound, err.Error())

		default:
			log.Printf("check eligibility failed: %v", err)
			httpx.RespondWithError(
				w,
				http.StatusInternalServerError,
				"internal server error",
			)
		}
		return
	}

	httpx.RespondWithJSON(w, http.StatusOK, result)
}
