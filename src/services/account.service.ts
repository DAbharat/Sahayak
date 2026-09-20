import axiosClient from "@/lib/axiosClient";
import { AxiosError } from "axios";

export type CreateAccountRequest = {
    email: string;
    password?: string;
};

export type AccountResponse = {
    id: number;
    email: string;
};

export type LoginAccountRequest = {
    email: string;
    password?: string;
};

export type LoginAccountResponse = {
    id: number;
    email: string;
    access_token: string;
    refresh_token: string;
};

export type RefreshTokenRequest = {
    refresh_token: string;
};

export type RefreshTokenResponse = {
    access_token: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    return axiosError.response?.data?.message || axiosError.response?.data?.error || axiosError.message || fallback;
};

export async function registerAccount(data: CreateAccountRequest) {
    try {
        const response = await axiosClient.post<AccountResponse>("/api/register", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, "An error occurred while registering the account."));
    }
}

export async function loginAccount(data: LoginAccountRequest) {
    try {
        const response = await axiosClient.post<LoginAccountResponse>("/api/login", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, "An error occurred while logging in."));
    }
}

export async function refreshAccessToken(data: RefreshTokenRequest) {
    try {
        // Typically POST for refresh tokens as per the contract docs
        const response = await axiosClient.post<RefreshTokenResponse>("/api/auth/refresh", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, "An error occurred while refreshing the access token."));
    }
}
