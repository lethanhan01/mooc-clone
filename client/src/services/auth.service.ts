import api from './api'
import type { AuthUser } from '@/stores/authStore'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', payload)
    return response.data
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<AuthUser>('/auth/me')
    return response.data
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore network errors during logout
    }
  },
}
