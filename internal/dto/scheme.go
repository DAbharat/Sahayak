package dto

import "time"

type CreateSchemeRequest struct {
	Name           string    `json:"name"`
	Description    string    `json:"description"`
	State          string    `json:"state"`
	SourceURL      string    `json:"source_url"`
	LastVerifiedAt time.Time `json:"last_verified_at"`
	DepartmentName string    `json:"department_name"`
}

type SchemeResponse struct {
	ID             int64     `json:"id"`
	Name           string    `json:"name"`
	Description    string    `json:"description"`
	State          string    `json:"state"`
	SourceURL      string    `json:"source_url"`
	LastVerifiedAt time.Time `json:"last_verified_at"`
	DepartmentName string    `json:"department_name"`
}
