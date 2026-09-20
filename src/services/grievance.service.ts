import axiosClient from "@/lib/axiosClient";
import { AxiosError } from "axios";

export type ProfileContext = {
    state: string;
    occupation: string;
    monthly_income: number;
    age: number;
    gender: string;
    children_count: number;
};

export type GrievanceRequest = {
    scheme_id: number;
    user_text: string;
    draft_type: string;
    language: string;
    scheme_name: string;
    profile_context: ProfileContext;
};

export type GenerateGrievanceResponse = {
    user_text: string;
    draft_type: string;
    language: string;
    profile_context: ProfileContext;
    subject: string;
    body: string;
    placeholders: string[];
    disclaimer: string;
    correlation_id: string;
    scheme_name: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    return axiosError.response?.data?.message || axiosError.response?.data?.error || axiosError.message || fallback;
};

export async function generateGrievance(data: GrievanceRequest) {
    try {
        const response = await axiosClient.post<GenerateGrievanceResponse>("/api/grievance/generate", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, "An error occurred while generating the grievance draft."));
    }
}
