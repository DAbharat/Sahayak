package client

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type SchemeSourceResponse struct {
	Source       string `json:"source"`
	SourceType   string `json:"sourceType"`
	SourceURL    string `json:"sourceUrl"`
	LastVerified string `json:"lastVerified"`
}

type SchemeClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewSchemeClient(baseURL string) *SchemeClient {
	return &SchemeClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

func (c *SchemeClient) GetSchemeSource(
	ctx context.Context,
	schemeID int64,
) (SchemeSourceResponse, error) {

	url := fmt.Sprintf(
		"%s/api/v1/schemes/%d/source",
		c.baseURL,
		schemeID,
	)

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		url,
		nil,
	)
	if err != nil {
		return SchemeSourceResponse{}, fmt.Errorf("create scheme source request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return SchemeSourceResponse{}, fmt.Errorf("call scheme service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return SchemeSourceResponse{}, fmt.Errorf(
			"scheme service returned status %d",
			resp.StatusCode,
		)
	}

	var result SchemeSourceResponse

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return SchemeSourceResponse{}, fmt.Errorf(
			"decode scheme source response: %w",
			err,
		)
	}

	return result, nil
}
