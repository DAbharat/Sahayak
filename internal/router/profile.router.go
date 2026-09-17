package router

import (
	"net/http"

	"github.com/DAbharat/Sahayak/internal/handler"
	"github.com/gorilla/mux"
)

func registerProfileRoutes(r *mux.Router, profileHandler *handler.ProfileHandler) {
	r.Handle("/api/accounts/{accountID}/profile", http.HandlerFunc(profileHandler.CreateProfile)).Methods("POST")
	r.Handle("/api/accounts/{accountID}/profile", http.HandlerFunc(profileHandler.GetProfile)).Methods("GET")
	r.Handle("/api/accounts/{accountID}/profile", http.HandlerFunc(profileHandler.UpdateProfile)).Methods("PUT")
}
