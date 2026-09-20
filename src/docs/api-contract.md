# Sahayak API Contract

This document outlines the API contract for Account, Profile, and Grievance routes, based on the implementation in `internal/router`, `internal/handler`, and `internal/service`.

## 1. Account Routes

### 1.1 Register Account
Creates a new user account.

*   **Endpoint:** `POST /api/register`
*   **Request Body:**
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
*   **Responses:**
    *   `201 Created`: Successfully registered.
        ```json
        {
          "id": 123,
          "email": "string"
        }
        ```
    *   `400 Bad Request`: Invalid or oversized request body, invalid email, or invalid password.
    *   `409 Conflict`: Email already exists.
    *   `500 Internal Server Error`

### 1.2 Login Account
Authenticates a user and returns access and refresh tokens.

*   **Endpoint:** `POST /api/login`
*   **Request Body:**
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
*   **Responses:**
    *   `200 OK`: Successfully authenticated.
        ```json
        {
          "id": 123,
          "email": "string",
          "access_token": "string",
          "refresh_token": "string"
        }
        ```
    *   `400 Bad Request`: Invalid or oversized request body.
    *   `401 Unauthorized`: Invalid credentials.
    *   `500 Internal Server Error`

### 1.3 Refresh Access Token
Refreshes an expired access token using a valid refresh token.

*   **Endpoint:** `/api/auth/refresh` (typically `POST`)
*   **Request Body:**
    ```json
    {
      "refresh_token": "string"
    }
    ```
*   **Responses:**
    *   `200 OK`: Token refreshed successfully.
        ```json
        {
          "access_token": "string"
        }
        ```
    *   `400 Bad Request`: Invalid request body or missing token.
    *   `401 Unauthorized`: Invalid refresh token.

---

## 2. Profile Routes

> **Note:** All profile routes require an `Authorization` header with a valid bearer token.

### 2.1 Create Profile
Creates a profile for a specific account.

*   **Endpoint:** `POST /api/accounts/{accountID}/profile/create`
*   **Request Body:**
    ```json
    {
      "name": "string",
      "state": "string (optional)",
      "district": "string (optional)",
      "occupation": "string",
      "monthly_income": 0, 
      "income_currency": "string",
      "family_size": 0,
      "children_count": 0,
      "children_school_going": true,
      "age": 0,
      "gender": "string (optional)",
      "is_registered_worker": true,
      "caste_category": "string (optional)",
      "has_bank_account": true,
      "documents_available": ["string"],
      "language": "string"
    }
    ```
*   **Responses:**
    *   `201 Created`: Profile successfully created. (Returns full `ProfileResponse` object)
    *   `400 Bad Request`: Validation error (invalid account ID, state, occupation, income, age, gender, etc.)
    *   `401 Unauthorized`: Missing or invalid authentication.
    *   `500 Internal Server Error`

### 2.2 Get Profile
Retrieves a profile for a specific account.

*   **Endpoint:** `GET /api/accounts/{accountID}/profile`
*   **Responses:**
    *   `200 OK`: Profile successfully retrieved.
        ```json
        {
          "id": 123,
          "name": "abc",
          "account_id": 456,
          "state": "string",
          "district": "string",
          "occupation": "string",
          "monthly_income": 0,
          "income_currency": "string",
          "family_size": 0,
          "children_count": 0,
          "children_school_going": true,
          "age": 0,
          "gender": "string",
          "is_registered_worker": true,
          "caste_category": "string",
          "has_bank_account": true,
          "documents_available": ["string"],
          "language": "string",
          "created_at": "2023-01-01T00:00:00Z"
        }
        ```
    *   `400 Bad Request`: Invalid account ID format.
    *   `401 Unauthorized`: Missing or invalid authentication.
    *   `403 Forbidden`: User does not have permission to read this profile.
    *   `404 Not Found`: Profile not found.
    *   `500 Internal Server Error`

### 2.3 Update Profile
Updates an existing profile for a specific account.

*   **Endpoint:** `PUT /api/accounts/{accountID}/profile/update`
*   **Request Body:** Same as Create Profile request.
*   **Responses:**
    *   `200 OK`: Profile successfully updated. (Returns full `ProfileResponse` object)
    *   `400 Bad Request`: Validation error (invalid data).
    *   `401 Unauthorized`: Missing or invalid authentication.
    *   `403 Forbidden`: User does not have permission to update this profile.
    *   `404 Not Found`: Profile not found.
    *   `500 Internal Server Error`

---

## 3. Grievance Routes

> **Note:** All grievance routes require an `Authorization` header with a valid bearer token.

### 3.1 Generate Grievance
Generates a draft for a grievance using the AI service.

*   **Endpoint:** `POST /api/grievance/generate`
*   **Request Body:**
    ```json
    {
      "scheme_id": 123,
      "user_text": "string",
      "draft_type": "string",
      "language": "string",
      "scheme_name": "string",
      "profile_context": {
        "state": "string",
        "occupation": "string",
        "monthly_income": 0,
        "age": 0,
        "gender": "string",
        "children_count": 0
      }
    }
    ```
*   **Responses:**
    *   `200 OK`: Draft generated successfully.
        ```json
        {
          "user_text": "string",
          "draft_type": "string",
          "language": "string",
          "profile_context": {
             "state": "string",
             "occupation": "string",
             "monthly_income": 0,
             "age": 0,
             "gender": "string",
             "children_count": 0
          },
          "subject": "string",
          "body": "string",
          "placeholders": ["string"],
          "disclaimer": "string",
          "correlation_id": "string",
          "scheme_name": "string"
        }
        ```
    *   `400 Bad Request`: Invalid scheme ID or user text.
    *   `401 Unauthorized`: Missing or invalid authentication.
    *   `404 Not Found`: Profile or Scheme not found.
    *   `502 Bad Gateway`: AI service unavailable or returned an error.
    *   `500 Internal Server Error`: Failed to prepare or execute AI request.
