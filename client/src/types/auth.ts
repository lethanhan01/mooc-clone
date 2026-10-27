/**
 * auth.ts - Các kiểu dữ liệu nghiệp vụ xác thực, tài khoản và phiên làm việc.
 */

export type Role = 'student' | 'teacher' | 'admin' | 'user'

export interface AuthUser {
  userId: string
  email: string
  fullName: string
  roles: Role[]
  avatarUrl?: string | null
  studentId?: string | null
  department?: string | null
  memberId?: string | null
}

export interface LoginRequest {
  usernameOrEmail: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  displayName: string
}

export interface UserProfileResponse {
  id: number
  username: string
  email: string
  displayName: string
  role: string
  status: string
  createdAt: string
}

export interface AuthResponse {
  token: string
  userId: number | string
  username: string
  displayName: string
  role: string
  expiresAt: string
}

