import { gatewayClient, GATEWAY_OPCODES } from './gatewayClient'
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest, UserProfileResponse } from '@/types'

export type { LoginRequest, AuthResponse, RegisterRequest, UserProfileResponse }
export type LoginResponse = AuthResponse

import { useAuthStore } from '@/stores/authStore'

export const authService = {
  async register(payload: RegisterRequest): Promise<UserProfileResponse> {
    return gatewayClient.request<UserProfileResponse>(GATEWAY_OPCODES.AUTH_REGISTER_REQ, payload)
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    return gatewayClient.request<AuthResponse>(GATEWAY_OPCODES.AUTH_LOGIN_REQ, payload)
  },

  async getCurrentUser(): Promise<AuthUser> {
    const user = useAuthStore.getState().user
    if (user) return user
    return gatewayClient.request<AuthUser>(GATEWAY_OPCODES.AUTH_LOGIN_REQ, { action: 'me' })
  },

  async logout(): Promise<void> {
    useAuthStore.getState().clearAuth(true)
  },
}
