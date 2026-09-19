package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/DAbharat/Sahayak/internal/authz"
	"github.com/DAbharat/Sahayak/internal/db"
	"github.com/DAbharat/Sahayak/internal/db/sqlc"
	"github.com/DAbharat/Sahayak/internal/handler"
	"github.com/DAbharat/Sahayak/internal/middleware"
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
	refreshTokenRepo := repository.NewRefreshTokenRepository(queries)
	profileRepo := repository.NewProfileRepository(queries)
	schemeRepo := repository.NewSchemeRepository(queries)
	schemeRuleRepo := repository.NewSchemeRulesRepository(queries)

	// JWT
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is not set")
	}

	authMiddleware := middleware.NewAuthMiddleware(jwtSecret)

	// Services
	accountService := service.NewAccountService(accountRepo, refreshTokenRepo, jwtSecret)
	profileService := service.NewProfileService(profileRepo)
	schemeService := service.NewSchemeService(schemeRepo)
	schemeRuleService := service.NewSchemeRuleService(schemeRuleRepo)
	eligibilityService := service.NewEligibilityService(profileRepo, schemeRepo, schemeRuleRepo)
	grievanceService := service.NewGrievanceService(profileRepo, schemeRepo)

	// Handlers

	authorizer, err := authz.NewAuthorizer()
	if err != nil {
		log.Fatalf("failed to initialize authorizer: %v", err)
	}

	accountHandler := handler.NewAccountHandler(accountService)
	profileHandler := handler.NewProfileHandler(profileService, authorizer)
	schemeHandler := handler.NewSchemeHandler(schemeService)
	schemeRuleHandler := handler.NewSchemeRuleHandler(schemeRuleService)
	eligibilityHandler := handler.NewEligibilityHandler(eligibilityService)
	grievanceHandler := handler.NewGrienvanceHandler(grievanceService)

	// Router
	r := router.New(
		accountHandler,
		profileHandler,
		schemeHandler,
		schemeRuleHandler,
		eligibilityHandler,
		grievanceHandler,
		authMiddleware,
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
