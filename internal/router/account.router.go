package router

import (
	"net/http"

	"github.com/DAbharat/Sahayak/internal/handler"
	"github.com/gorilla/mux"
)

func registerAccountRoutes(r *mux.Router, accountHandler *handler.AccountHandler) {
	r.Handle("/api/register", http.HandlerFunc(accountHandler.Signup)).Methods("POST")
	r.Handle("/api/login", http.HandlerFunc(accountHandler.Login)).Methods("POST")
	r.Handle("/api/auth/refresh", http.HandlerFunc(accountHandler.RefreshAccessToken))
}
