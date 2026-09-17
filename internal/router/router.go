package router

import (
	"github.com/DAbharat/Sahayak/internal/handler"
	"github.com/gorilla/mux"
)

func New(accountHandler *handler.AccountHandler, profileHandler *handler.ProfileHandler, schemeHandler *handler.SchemeHandler, schemeRuleHandler *handler.SchemeRuleHandler, eligibilityHandler *handler.EligibilityHandler) *mux.Router {
	r := mux.NewRouter()

	registerHealthRoutes(r)
	registerAccountRoutes(r, accountHandler)
	registerProfileRoutes(r, profileHandler)
	registerSchemeRoutes(r, schemeHandler)
	registerSchemeRulesRoutes(r, schemeRuleHandler)
	registerEligibilityRoutes(r, eligibilityHandler)

	return r
}
