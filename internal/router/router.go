package router

import (
	"github.com/DAbharat/Sahayak/internal/handler"
	"github.com/DAbharat/Sahayak/internal/middleware"
	"github.com/gorilla/mux"
)

func New(accountHandler *handler.AccountHandler, profileHandler *handler.ProfileHandler, schemeHandler *handler.SchemeHandler, schemeRuleHandler *handler.SchemeRuleHandler, eligibilityHandler *handler.EligibilityHandler, grievanceHandler *handler.GrievanceHandler, authMiddleware *middleware.AuthMiddleware) *mux.Router {
	r := mux.NewRouter()

	registerHealthRoutes(r)
	registerAccountRoutes(r, accountHandler)
	registerProfileRoutes(r, profileHandler, authMiddleware)
	registerSchemeRoutes(r, schemeHandler)
	registerSchemeRulesRoutes(r, schemeRuleHandler)
	registerEligibilityRoutes(r, eligibilityHandler, authMiddleware)
	registerGrievanceRoutes(r, grievanceHandler, authMiddleware)

	return r
}
