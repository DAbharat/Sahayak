package dto

type EligibilityRequest struct {
	AccountID int64 `json:"account_id"`
	SchemeID  int64 `json:"scheme_id"`
}

type EligibilityResponse struct {
	SchemeID   int64    `json:"scheme_id"`
	SchemeName string   `json:"scheme_name"`
	Eligible   bool     `json:"eligible"`
	Reasons    []string `json:"reasons,omitempty"`
}
