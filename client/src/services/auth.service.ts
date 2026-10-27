import api from './api'
import type { ApiResponse, AuthResponse, AuthUser, LoginRequest, RegisterRequest, UserProfileResponse } from '@/types'

export type { LoginRequest, AuthResponse, RegisterRequest, UserProfileResponse }
export type LoginResponse = AuthResponse

export const authService = {
  async register(payload: RegisterRequest): Promise<UserProfileResponse> {
    const response = await api.post<ApiResponse<UserProfileResponse>>('/auth/register', payload)
    return response.data.data
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload)
    return response.data.data
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<ApiResponse<AuthUser>>('/auth/me')
    return response.data.data
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore network errors during logout
    }
  },
}

