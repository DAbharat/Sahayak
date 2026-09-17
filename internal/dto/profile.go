package dto

import "time"

type CreateProfileRequest struct {
	State         string `json:"state"`
	Occupation    string `json:"occupation"`
	MonthlyIncome int64  `json:"monthly_income"`
	Age           int32  `json:"age"`
	Gender        string `json:"gender"`
	ChildrenCount int32  `json:"children_count"`
}

type ProfileResponse struct {
	ID            int64     `json:"id"`
	AccountID     int64     `json:"account_id"`
	State         string    `json:"state"`
	Occupation    string    `json:"occupation"`
	MonthlyIncome int64     `json:"monthly_income"`
	Age           int32     `json:"age"`
	Gender        string    `json:"gender"`
	ChildrenCount int32     `json:"children_count"`
	CreatedAt     time.Time `json:"created_at"`
}
