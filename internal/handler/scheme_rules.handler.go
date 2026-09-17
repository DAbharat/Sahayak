package handler

import (
	"context"
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/DAbharat/Sahayak/internal/db/sqlc"
	"github.com/DAbharat/Sahayak/internal/httpx"
	"github.com/DAbharat/Sahayak/internal/service"

	"github.com/gorilla/mux"
)

type SchemeRuleService interface {
	GetSchemeRuleByID(ctx context.Context, id int64) (sqlc.SchemeRule, error)
	GetSchemeRulesBySchemeID(ctx context.Context, schemeID int64) ([]sqlc.SchemeRule, error)
}

type SchemeRuleHandler struct {
	schemeRuleService SchemeRuleService
}

func NewSchemeRuleHandler(schemeRuleService SchemeRuleService) *SchemeRuleHandler {
	return &SchemeRuleHandler{
		schemeRuleService: schemeRuleService,
	}
}

func (h *SchemeRuleHandler) GetSchemeRuleByID(w http.ResponseWriter, r *http.Request) {
	ruleID, err := strconv.ParseInt(
		mux.Vars(r)["ruleID"],
		10,
		64,
	)
	if err != nil {
		httpx.RespondWithError(
			w,
			http.StatusBadRequest,
			service.ErrInvalidSchemeRuleID.Error(),
		)
		return
	}

	rule, err := h.schemeRuleService.GetSchemeRuleByID(
		r.Context(),
		ruleID,
	)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidSchemeRuleID):
			httpx.RespondWithError(w, http.StatusBadRequest, err.Error())

		case errors.Is(err, service.ErrSchemeRuleNotFound):
			httpx.RespondWithError(w, http.StatusNotFound, err.Error())

		default:
			log.Printf("get scheme rule failed: %v", err)
			httpx.RespondWithError(
				w,
				http.StatusInternalServerError,
				"internal server error",
			)
		}
		return
	}

	httpx.RespondWithJSON(w, http.StatusOK, rule)
}

func (h *SchemeRuleHandler) GetSchemeRulesBySchemeID(
	w http.ResponseWriter,
	r *http.Request,
) {
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

	rules, err := h.schemeRuleService.GetSchemeRulesBySchemeID(
		r.Context(),
		schemeID,
	)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidSchemeID):
			httpx.RespondWithError(w, http.StatusBadRequest, err.Error())

		default:
			log.Printf("get scheme rules failed: %v", err)
			httpx.RespondWithError(
				w,
				http.StatusInternalServerError,
				"internal server error",
			)
		}
		return
	}

	httpx.RespondWithJSON(w, http.StatusOK, rules)
}
