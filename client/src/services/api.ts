import axios, { AxiosHeaders } from 'axios'
import { useAuthStore } from '@/stores/authStore'

declare module 'axios' {
  export interface AxiosRequestConfig {
    suppressAuthRedirect?: boolean
    _retry?: boolean
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
  withCredentials: true,
})

// Attach Bearer token to every request if available
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  const headers = AxiosHeaders.from(config.headers)
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  config.headers = headers
  return config
})

// Response interceptor for handling 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.suppressAuthRedirect) {
      useAuthStore.getState().clearAuth()
    }
    return Promise.reject(error)
  }
)

export default api
