package router

import (
	"net/http"

	"github.com/DAbharat/Sahayak/internal/handler"
	"github.com/DAbharat/Sahayak/internal/middleware"
	"github.com/gorilla/mux"
)

func registerEligibilityRoutes(r *mux.Router, eligibilityHandler *handler.EligibilityHandler, authMiddleware *middleware.AuthMiddleware) {
	r.Handle("/api/eligibility/check",
		authMiddleware.Authenticate(http.HandlerFunc(eligibilityHandler.CheckEligibility)),
	).Methods("POST")
}
