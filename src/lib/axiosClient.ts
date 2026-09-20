import axios from "axios"

const axiosClient = axios.create({
    baseURL: import.meta.env.NEXT_PUBLIC_API_URL || import.meta.env.NEXT_PUBLIC_APP_URL || "http://localhost:9000",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
})

let isRefreshing = false
let refreshQueue: Array<() => void> = []

function clearAuthTokens() {
    if (typeof window === "undefined") {
        return
    }

    window.localStorage.removeItem("accessToken")
    window.localStorage.removeItem("access_token")
    window.localStorage.removeItem("refreshToken")
    window.localStorage.removeItem("refresh_token")
}

async function refreshAccessToken() {
    if (typeof window === "undefined") {
        throw new Error("Cannot refresh token outside the browser")
    }

    const refreshToken =
        window.localStorage.getItem("refreshToken") ?? window.localStorage.getItem("refresh_token")

    if (!refreshToken) {
        clearAuthTokens()
        throw new Error("No refresh token available")
    }

    const response = await axios.post(
        `${import.meta.env.NEXT_PUBLIC_API_URL || import.meta.env.NEXT_PUBLIC_APP_URL || "http://localhost:9000"}/api/auth/refresh`,
        { refresh_token: refreshToken },
        {
            headers: {
                "Content-Type": "application/json",
            },
        },
    )

    const nextAccessToken = response.data.accessToken ?? response.data.access_token

    if (!nextAccessToken) {
        clearAuthTokens()
        throw new Error("Refresh response did not include an access token")
    }

    window.localStorage.setItem("accessToken", nextAccessToken)
    window.localStorage.setItem("access_token", nextAccessToken)

    return nextAccessToken
}

axiosClient.interceptors.request.use((config) => {
    if (typeof window === "undefined") {
        return config
    }

    const token = window.localStorage.getItem("accessToken") ?? window.localStorage.getItem("access_token")

    if (token) {
        config.headers = config.headers ?? ({} as any)
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
            return Promise.reject(error)
        }

        originalRequest._retry = true

        if (isRefreshing) {
            await new Promise<void>((resolve) => {
                refreshQueue.push(resolve)
            })

            const retryToken = window.localStorage.getItem("accessToken") ?? window.localStorage.getItem("access_token")

            if (retryToken) {
                originalRequest.headers = originalRequest.headers ?? ({} as any)
                originalRequest.headers.Authorization = `Bearer ${retryToken}`
            }

            return axiosClient(originalRequest)
        }

        isRefreshing = true

        try {
            const refreshedToken = await refreshAccessToken()

            refreshQueue.forEach((resolve) => resolve())
            refreshQueue = []

            originalRequest.headers = originalRequest.headers ?? ({} as any)
            originalRequest.headers.Authorization = `Bearer ${refreshedToken}`

            return axiosClient(originalRequest)
        } catch (refreshError) {
            clearAuthTokens()
            return Promise.reject(refreshError)
        } finally {
            isRefreshing = false
        }
    },
)

export default axiosClient