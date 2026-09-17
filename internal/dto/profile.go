package dto

type Profile struct {
	ID            int64  `json:"id"`
	State         string `json:"state"`
	Occupation    string `json:"occupation"`
	MonthlyIncome int64  `json:"monthly_income"`
	Age           int    `json:"age"`
	Gender        string `json:"gender"`
	Children      int    `json:"children_count"`
}
