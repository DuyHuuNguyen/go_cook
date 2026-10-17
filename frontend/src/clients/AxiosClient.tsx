import axios, { type InternalAxiosRequestConfig } from 'axios'
import {authStore} from "../stores/authStore";
import {ENDPOINTS} from "../config/ApiConfig.tsx";

const BACKEND_URL = 'http://localhost:8083' // bug
// const REFRESH_PATH = '/api/v1/users/refresh-token'

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

const axiosClient = axios.create({
  baseURL: BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})


const refreshClient = axios.create({
  baseURL: BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

let refreshPromise: Promise<void> | null = null

async function refreshAccessToken(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = refreshClient.post(ENDPOINTS.USER.REFRESH_TOKEN.V2).then(() => undefined)
  }

  try {
    await refreshPromise
  } finally {
    refreshPromise = null
  }
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const request = error.config as RetryableRequestConfig | undefined
    const isUnauthorized = error.response?.status === 401
    const isForbidden = error.response?.status === 403;

    if (isForbidden)
        authStore.setAuthStatus("forbidden");

    if (!request || !isUnauthorized || request._retry || request.url === ENDPOINTS.USER.REFRESH_TOKEN.V2) {
      return Promise.reject(error)
    }

    request._retry = true

    try {
      await refreshAccessToken()
      authStore.setAuthStatus("authorized");
      return axiosClient(request)
    } catch {
      authStore.setAuthStatus("unauthorized");
      return Promise.reject(error)
    }
  },
)

export default axiosClient
