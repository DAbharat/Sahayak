package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/DAbharat/Sahayak/internal/db"
	"github.com/DAbharat/Sahayak/internal/router"
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

	r := router.New()

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
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server listen error: %v", err)
		}
	}()

	select {}
}
