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

type SchemeService interface {
	GetSchemeByID(ctx context.Context, id int64) (dto.SchemeResponse, error)
	ListSchemes(ctx context.Context) ([]dto.SchemeResponse, error)
	ListSchemesByState(ctx context.Context, state string) ([]dto.SchemeResponse, error)
}

type SchemeHandler struct {
	schemeService SchemeService
}

func NewSchemeHandler(schemeService SchemeService) *SchemeHandler {
	return &SchemeHandler{
		schemeService: schemeService,
	}
}

func (h *SchemeHandler) GetSchemeByID(w http.ResponseWriter, r *http.Request) {
	schemeID, err := strconv.ParseInt(
		mux.Vars(r)["schemeID"],
		10,
		64,
	)
	if err != nil {
		httpx.RespondWithError(
			w,
			http.StatusBadRequest,
			service.ErrInvalidSchemeID.Error(),
		)
		return
	}

	scheme, err := h.schemeService.GetSchemeByID(
		r.Context(),
		schemeID,
	)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidSchemeID):
			httpx.RespondWithError(w, http.StatusBadRequest, err.Error())

		case errors.Is(err, service.ErrSchemeNotFound):
			httpx.RespondWithError(w, http.StatusNotFound, err.Error())

		default:
			log.Printf("get scheme failed: %v", err)
			httpx.RespondWithError(
				w,
				http.StatusInternalServerError,
				"internal server error",
			)
		}
		return
	}

	httpx.RespondWithJSON(w, http.StatusOK, scheme)
}

func (h *SchemeHandler) ListSchemes(w http.ResponseWriter, r *http.Request) {
	state := r.URL.Query().Get("state")

	var (
		schemes []dto.SchemeResponse
		err     error
	)

	if state != "" {
		schemes, err = h.schemeService.ListSchemesByState(
			r.Context(),
			state,
		)
	} else {
		schemes, err = h.schemeService.ListSchemes(
			r.Context(),
		)
	}

	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidState):
			httpx.RespondWithError(w, http.StatusBadRequest, err.Error())

		default:
			log.Printf("list schemes failed: %v", err)
			httpx.RespondWithError(
				w,
				http.StatusInternalServerError,
				"internal server error",
			)
		}
		return
	}

	httpx.RespondWithJSON(w, http.StatusOK, schemes)
}
