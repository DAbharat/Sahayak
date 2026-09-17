package dto

import "time"

type CreateAccountRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type CreateAccountResponse struct {
	ID    int64  `json:"id"`
	Email string `json:"email"`
}

type LoginAccountRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginAccountResponse struct {
	ID           int64  `json:"id"`
	Email        string `json:"email"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type AccountResponse struct {
	ID        int64     `json:"id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type RefreshTokenResponse struct {
	AccessToken string `json:"access_token"`
}
