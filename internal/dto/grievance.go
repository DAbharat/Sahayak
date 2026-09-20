package dto

type GrievanceRequest struct {
	SchemeID       int64          `json:"scheme_id"`
	UserText       string         `json:"user_text"`
	DraftType      string         `json:"draft_type"`
	Language       string         `json:"language"`
	ProfileContext ProfileContext `json:"profile_context"`
	SchemeName     string         `json:"scheme_name"`
	DepartmentName string         `json:"department_name"`
}

type ProfileContext struct {
	Name          string `json:"name"`
	District      string `json:"district"`
	State         string `json:"state"`
	Occupation    string `json:"occupation"`
	MonthlyIncome int64  `json:"monthly_income"`
	Age           int32  `json:"age"`
	Gender        string `json:"gender"`
	ChildrenCount int32  `json:"children_count"`
}

type DraftResponse struct {
	DraftType     string   `json:"draft_type"`
	Language      string   `json:"language"`
	Subject       string   `json:"subject"`
	Body          string   `json:"body"`
	Placeholders  []string `json:"placeholders"`
	Disclaimer    string   `json:"disclaimer"`
	CorrelationID string   `json:"correlation_id"`
}

type GenerateGrievanceResponse struct {
	UserText       string         `json:"user_text"`
	DraftType      string         `json:"draft_type"`
	Language       string         `json:"language"`
	ProfileContext ProfileContext `json:"profile_context"`
	Subject        string         `json:"subject"`
	Body           string         `json:"body"`
	Placeholders   []string       `json:"placeholders"`
	Disclaimer     string         `json:"disclaimer"`
	CorrelationID  string         `json:"correlation_id"`
	SchemeName     string         `json:"scheme_name"`
	DepartmentName string         `json:"department_name"`
}
