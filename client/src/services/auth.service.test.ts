import { describe, expect, it, vi, beforeEach } from 'vitest'
import { authService } from './auth.service'
import api from './api'

vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login sends credentials and returns unwrapped AuthResponse', async () => {
    const mockAuthResponse = {
      token: 'test_token_123',
      userId: 1,
      username: 'teacher_le',
      displayName: 'Thầy Lê Văn Hướng',
      role: 'TEACHER',
      expiresAt: '2026-11-01T00:00:00Z',
    }

    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        code: 1000,
        status: 'SUCCESS',
        message: 'Đăng nhập thành công',
        data: mockAuthResponse,
      },
    })

    const result = await authService.login({
      usernameOrEmail: 'teacher_le',
      password: 'password123',
    })

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      usernameOrEmail: 'teacher_le',
      password: 'password123',
    })
    expect(result).toEqual(mockAuthResponse)
  })

  it('getCurrentUser fetches /auth/me and returns unwrapped AuthUser', async () => {
    const mockUser = {
      userId: '1',
      email: 'teacher.le@mooc.local',
      fullName: 'Thầy Lê Văn Hướng',
      roles: ['teacher'],
    }

    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        code: 1000,
        status: 'SUCCESS',
        message: 'Thành công',
        data: mockUser,
      },
    })

    const result = await authService.getCurrentUser()

    expect(api.get).toHaveBeenCalledWith('/auth/me')
    expect(result).toEqual(mockUser)
  })

  it('logout calls /auth/logout and silently handles error', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Network error'))

    await expect(authService.logout()).resolves.toBeUndefined()
    expect(api.post).toHaveBeenCalledWith('/auth/logout')
  })
})
