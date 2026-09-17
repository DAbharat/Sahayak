package router

import (
	"github.com/DAbharat/Sahayak/internal/handler"
	"github.com/gorilla/mux"
)

func registerHealthRoutes(r *mux.Router) {
	r.HandleFunc("/api/health", handler.HealthCheckHandler).Methods("GET")
}
