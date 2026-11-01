import { describe, expect, it, vi, beforeEach } from 'vitest'
import { authService } from './auth.service'
import { gatewayClient, GATEWAY_OPCODES } from './gatewayClient'

vi.mock('./gatewayClient', () => ({
  GATEWAY_OPCODES: {
    AUTH_LOGIN_REQ: 0x01,
    AUTH_REGISTER_REQ: 0x03,
  },
  gatewayClient: {
    request: vi.fn(),
    isDesktop: vi.fn().mockReturnValue(true),
  },
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login sends credentials via Gateway and returns unwrapped AuthResponse', async () => {
    const mockAuthResponse = {
      token: 'test_token_123',
      userId: 1,
      username: 'teacher_le',
      displayName: 'Thầy Lê Văn Hướng',
      role: 'TEACHER',
      expiresAt: '2026-11-01T00:00:00Z',
    }

    vi.mocked(gatewayClient.request).mockResolvedValueOnce(mockAuthResponse)

    const result = await authService.login({
      usernameOrEmail: 'teacher_le',
      password: 'password123',
    })

    expect(gatewayClient.request).toHaveBeenCalledWith(GATEWAY_OPCODES.AUTH_LOGIN_REQ, {
      usernameOrEmail: 'teacher_le',
      password: 'password123',
    })
    expect(result).toEqual(mockAuthResponse)
  })

  it('register sends payload via Gateway and returns UserProfileResponse', async () => {
    const mockProfile = {
      id: 2,
      username: 'student_an',
      email: 'an@mooc.local',
      displayName: 'Nguyễn Văn An',
    }

    vi.mocked(gatewayClient.request).mockResolvedValueOnce(mockProfile)

    const result = await authService.register({
      username: 'student_an',
      email: 'an@mooc.local',
      password: 'password123',
      displayName: 'Nguyễn Văn An',
    })

    expect(gatewayClient.request).toHaveBeenCalledWith(GATEWAY_OPCODES.AUTH_REGISTER_REQ, {
      username: 'student_an',
      email: 'an@mooc.local',
      password: 'password123',
      displayName: 'Nguyễn Văn An',
    })
    expect(result).toEqual(mockProfile)
  })

  it('logout resolves cleanly without errors', async () => {
    await expect(authService.logout()).resolves.toBeUndefined()
  })
})
