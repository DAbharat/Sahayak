package router

import (
	"net/http"

	"github.com/DAbharat/Sahayak/internal/handler"
	"github.com/gorilla/mux"
)

func registerSchemeRulesRoutes(r *mux.Router, schemeRulesHandler *handler.SchemeRuleHandler) {
	r.Handle("/api/schemes/{schemeID}/rules",
		http.HandlerFunc(schemeRulesHandler.GetSchemeRulesBySchemeID),
	).Methods("GET")

	r.Handle("/api/scheme-rules/{ruleID}",
		http.HandlerFunc(schemeRulesHandler.GetSchemeRuleByID),
	).Methods("GET")
}
