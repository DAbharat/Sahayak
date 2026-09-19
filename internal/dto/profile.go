package dto

import "time"

type CreateProfileRequest struct {
	State               *string  `json:"state"`
	District            *string  `json:"district"`
	Occupation          string   `json:"occupation"`
	MonthlyIncome       *int64   `json:"monthly_income"`
	IncomeCurrency      string   `json:"income_currency"`
	FamilySize          *int32   `json:"family_size"`
	ChildrenCount       *int32   `json:"children_count"`
	ChildrenSchoolGoing *bool    `json:"children_school_going"`
	Age                 *int32   `json:"age"`
	Gender              *string  `json:"gender"`
	IsRegisteredWorker  *bool    `json:"is_registered_worker"`
	CasteCategory       *string  `json:"caste_category"`
	HasBankAccount      *bool    `json:"has_bank_account"`
	DocumentsAvailable  []string `json:"documents_available"`
	Language            string   `json:"language"`
}

type ProfileResponse struct {
	ID                  int64     `json:"id"`
	AccountID           int64     `json:"account_id"`
	State               *string   `json:"state"`
	District            *string   `json:"district"`
	Occupation          string    `json:"occupation"`
	MonthlyIncome       *int64    `json:"monthly_income"`
	IncomeCurrency      string    `json:"income_currency"`
	FamilySize          *int32    `json:"family_size"`
	ChildrenCount       *int32    `json:"children_count"`
	ChildrenSchoolGoing *bool     `json:"children_school_going"`
	Age                 *int32    `json:"age"`
	Gender              *string   `json:"gender"`
	IsRegisteredWorker  *bool     `json:"is_registered_worker"`
	CasteCategory       *string   `json:"caste_category"`
	HasBankAccount      *bool     `json:"has_bank_account"`
	DocumentsAvailable  []string  `json:"documents_available"`
	Language            string    `json:"language"`
	CreatedAt           time.Time `json:"created_at"`
}

type ProfileExtractResponse struct {
	Profile       UserProfile `json:"profile"`
	CorrelationID string      `json:"correlation_id"`
}

type UserProfile struct {
	State               *string            `json:"state"`
	District            *string            `json:"district"`
	Occupation          string             `json:"occupation"`
	MonthlyIncome       *float64           `json:"monthly_income"`
	IncomeCurrency      string             `json:"income_currency"`
	FamilySize          *int               `json:"family_size"`
	ChildrenCount       *int               `json:"children_count"`
	ChildrenSchoolGoing *bool              `json:"children_school_going"`
	Age                 *int               `json:"age"`
	Gender              *string            `json:"gender"`
	IsRegisteredWorker  *bool              `json:"is_registered_worker"`
	CasteCategory       *string            `json:"caste_category"`
	HasBankAccount      *bool              `json:"has_bank_account"`
	DocumentsAvailable  []string           `json:"documents_available"`
	MissingFields       []string           `json:"missing_fields"`
	Language            string             `json:"language"`
	Confidence          map[string]float64 `json:"confidence"`
	RawInput            *string            `json:"raw_input"`
}
