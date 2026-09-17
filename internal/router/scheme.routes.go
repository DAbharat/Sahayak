package router

import (
	"net/http"

	"github.com/DAbharat/Sahayak/internal/handler"
	"github.com/gorilla/mux"
)

func registerSchemeRoutes(r *mux.Router, schemeHandler *handler.SchemeHandler) {
	r.Handle("/api/schemes",
		http.HandlerFunc(schemeHandler.ListSchemes),
	).Methods("GET")

	r.Handle("/api/schemes/{schemeID}",
		http.HandlerFunc(schemeHandler.GetSchemeByID),
	).Methods("GET")
}
