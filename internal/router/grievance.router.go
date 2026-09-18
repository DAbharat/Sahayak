package router

import (
	"net/http"

	"github.com/DAbharat/Sahayak/internal/handler"
	"github.com/DAbharat/Sahayak/internal/middleware"
	"github.com/gorilla/mux"
)

func registerGrievanceRoutes(r *mux.Router, grievanceHandler *handler.GrievanceHandler, authMiddleware *middleware.AuthMiddleware) {
	r.Handle("/api/grievance/generate",
		authMiddleware.Authenticate(http.HandlerFunc(grievanceHandler.Generate)),
	).Methods("POST")
}
