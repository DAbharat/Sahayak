package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/DAbharat/Sahayak/internal/db"
	"github.com/DAbharat/Sahayak/internal/db/sqlc"
	"github.com/DAbharat/Sahayak/internal/handler"
	"github.com/DAbharat/Sahayak/internal/repository"
	"github.com/DAbharat/Sahayak/internal/router"
	"github.com/DAbharat/Sahayak/internal/service"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system env vars")
	}

	cfg, err := db.Load()
	if err != nil {
		log.Fatalf("load configuration: %v", err)
	}
	log.Println("configuration load successfully.")

	pool, err := db.New(cfg)
	if err != nil {
		log.Fatalf("load postgres: %v", err)
	}
	defer pool.Close()

	fmt.Println("DB connected successfully!")

	// SQLC
	queries := sqlc.New(pool)

	// Repositories
	accountRepo := repository.NewAccountsRepository(queries)
	profileRepo := repository.NewProfileRepository(queries)
	schemeRepo := repository.NewSchemeRepository(queries)
	schemeRuleRepo := repository.NewSchemeRulesRepository(queries)

	// Services
	accountService := service.NewAccountService(accountRepo)
	profileService := service.NewProfileService(profileRepo)
	schemeService := service.NewSchemeService(schemeRepo)
	schemeRuleService := service.NewSchemeRuleService(schemeRuleRepo)
	eligibilityService := service.NewEligibilityService(
		profileRepo,
		schemeRepo,
		schemeRuleRepo,
	)

	// Handlers
	accountHandler := handler.NewAccountHandler(accountService)
	profileHandler := handler.NewProfileHandler(profileService)
	schemeHandler := handler.NewSchemeHandler(schemeService)
	schemeRuleHandler := handler.NewSchemeRuleHandler(schemeRuleService)
	eligibilityHandler := handler.NewEligibilityHandler(eligibilityService)

	// Router
	r := router.New(
		accountHandler,
		profileHandler,
		schemeHandler,
		schemeRuleHandler,
		eligibilityHandler,
	)

	port := os.Getenv("PORT")
	if port == "" {
		port = "9000"
	}

	serverAddr := ":" + port

	server := http.Server{
		Addr:              serverAddr,
		Handler:           r,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		log.Println("server is running on port:", port)

		if err := server.ListenAndServe(); err != nil &&
			!errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server listen error: %v", err)
		}
	}()

	select {}
}
