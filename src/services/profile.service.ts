import axiosClient from "@/lib/axiosClient";
import { AxiosError } from "axios";

export type CreateProfileRequest = {
    name: string;
    state?: string;
    district?: string;
    occupation: string;
    monthly_income: number;
    income_currency: string;
    family_size: number;
    children_count: number;
    children_school_going: boolean;
    age: number;
    gender?: string;
    is_registered_worker: boolean;
    caste_category?: string;
    has_bank_account: boolean;
    documents_available: string[];
    language: string;
};

export type ProfileResponse = {
    id: number;
    name: string;
    account_id: number;
    state: string;
    district: string;
    occupation: string;
    monthly_income: number;
    income_currency: string;
    family_size: number;
    children_count: number;
    children_school_going: boolean;
    age: number;
    gender: string;
    is_registered_worker: boolean;
    caste_category: string;
    has_bank_account: boolean;
    documents_available: string[];
    language: string;
    created_at: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    return axiosError.response?.data?.message || axiosError.response?.data?.error || axiosError.message || fallback;
};

export async function createProfile(accountId: string | number, data: CreateProfileRequest) {
    try {
        const response = await axiosClient.post<ProfileResponse>(`/api/accounts/${accountId}/profile/create`, data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, "An error occurred while creating the profile."));
    }
}

export async function getProfile(accountId: string | number) {
    try {
        const response = await axiosClient.get<ProfileResponse>(`/api/accounts/${accountId}/profile`);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, "An error occurred while fetching the profile."));
    }
}

export async function updateProfile(accountId: string | number, data: CreateProfileRequest) {
    try {
        const response = await axiosClient.put<ProfileResponse>(`/api/accounts/${accountId}/profile/update`, data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, "An error occurred while updating the profile."));
    }
}
