package router

import (
	"net/http"

	"github.com/DAbharat/Sahayak/internal/handler"
	"github.com/gorilla/mux"
)

func registerEligibilityRoutes(r *mux.Router, eligibilityHandler *handler.EligibilityHandler) {
	r.Handle("/api/eligibility/check", http.HandlerFunc(eligibilityHandler.CheckEligibility)).Methods("POST")
}
