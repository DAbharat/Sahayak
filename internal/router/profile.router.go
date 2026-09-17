package router

import (
	"net/http"

	"github.com/DAbharat/Sahayak/internal/handler"
	"github.com/DAbharat/Sahayak/internal/middleware"
	"github.com/gorilla/mux"
)

func registerProfileRoutes(r *mux.Router, profileHandler *handler.ProfileHandler, authMiddleware *middleware.AuthMiddleware) {
	r.Handle("/api/accounts/{accountID}/profile",
		authMiddleware.Authenticate(http.HandlerFunc(profileHandler.CreateProfile)),
	).Methods("POST")

	r.Handle("/api/accounts/{accountID}/profile",
		authMiddleware.Authenticate(http.HandlerFunc(profileHandler.GetProfile)),
	).Methods("GET")

	r.Handle("/api/accounts/{accountID}/profile",
		authMiddleware.Authenticate(http.HandlerFunc(profileHandler.UpdateProfile)),
	).Methods("PUT")
}
