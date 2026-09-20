package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/DAbharat/Sahayak/internal/dto"
	"github.com/DAbharat/Sahayak/internal/httpx"
	"github.com/DAbharat/Sahayak/internal/middleware"
	"github.com/DAbharat/Sahayak/internal/service"
)

type GrievanceService interface {
	PrepareRequest(ctx context.Context, accountID int64, req dto.GrievanceRequest) (dto.GenerateGrievanceResponse, error)
}

type GrievanceHandler struct {
	grievanceService GrievanceService
	httpClient       *http.Client
	aiServiceURL     string
}

func NewGrienvanceHandler(grievanceService GrievanceService) *GrievanceHandler {
	aiServiceURL := os.Getenv("AI_SERVICE_URL")
	if aiServiceURL == "" {
		aiServiceURL = "http://127.0.0.1:8000"
	}

	return &GrievanceHandler{
		grievanceService: grievanceService,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
		aiServiceURL: aiServiceURL,
	}
}

func (h *GrievanceHandler) Generate(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		httpx.RespondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req dto.GrievanceRequest

	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&req); err != nil {
		httpx.RespondWithError(w, http.StatusBadRequest, "invalid or oversized request body")
		return
	}
	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		httpx.RespondWithError(w, http.StatusBadRequest, "request body must contain a single json object")
		return
	}

	preparedRequest, err := h.grievanceService.PrepareRequest(r.Context(), accountID, req)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidSchemeID),
			errors.Is(err, service.ErrInvalidUserText):
			httpx.RespondWithError(w, http.StatusBadRequest, err.Error())
		case errors.Is(err, service.ErrProfileNotFound),
			errors.Is(err, service.ErrSchemeNotFound):
			httpx.RespondWithError(w, http.StatusNotFound, err.Error())
		default:
			log.Printf("generate request failed: %v", err)
			httpx.RespondWithError(w, http.StatusInternalServerError, "internal server error")
		}
		return
	}

	aiRequest := dto.GrievanceRequest{
		SchemeID:       req.SchemeID,
		UserText:       req.UserText,
		DraftType:      req.DraftType,
		Language:       req.Language,
		ProfileContext: preparedRequest.ProfileContext,
		SchemeName:     req.SchemeName,
		DepartmentName: preparedRequest.DepartmentName,
	}
	//log.Printf("AI REQUEST: %+v", aiRequest)
	log.Printf("DEPARTMENT FROM PREPARED REQUEST: %q", preparedRequest.DepartmentName)

	body, err := json.Marshal(aiRequest)
	if err != nil {
		httpx.RespondWithError(w, http.StatusInternalServerError, "failed to prepare AI request")
		return
	}

	aiURL := h.aiServiceURL + "/api/drafts/grievance"

	aiReq, err := http.NewRequestWithContext(r.Context(), http.MethodPost, aiURL, bytes.NewReader(body))
	if err != nil {
		httpx.RespondWithError(w, http.StatusInternalServerError, "failed to create AI request")
		return
	}

	aiReq.Header.Set("Content-Type", "application/json")

	aiResp, err := h.httpClient.Do(aiReq)
	if err != nil {
		httpx.RespondWithError(w, http.StatusBadGateway, "AI service unavailable")
		return
	}
	defer aiResp.Body.Close()

	if aiResp.StatusCode < 200 || aiResp.StatusCode >= 300 {
		httpx.RespondWithError(w, http.StatusBadGateway, fmt.Sprintf("AI service returned status %d", aiResp.StatusCode))
		return
	}

	var draft dto.DraftResponse
	if err := json.NewDecoder(aiResp.Body).Decode(&draft); err != nil {
		httpx.RespondWithError(w, http.StatusBadGateway, "invalid response from AI service")
		return
	}

	response := dto.GenerateGrievanceResponse{
		UserText:       preparedRequest.UserText,
		DraftType:      draft.DraftType,
		Language:       draft.Language,
		ProfileContext: preparedRequest.ProfileContext,
		Subject:        draft.Subject,
		Body:           draft.Body,
		Placeholders:   draft.Placeholders,
		Disclaimer:     draft.Disclaimer,
		CorrelationID:  draft.CorrelationID,
		SchemeName:     preparedRequest.SchemeName,
		DepartmentName: preparedRequest.DepartmentName,
	}

	httpx.RespondWithJSON(w, http.StatusOK, response)
}
