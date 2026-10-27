import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/authStore'

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().clearAuth()
    useAuthStore.getState().setHasHydrated(false)
  })

  it('renders login form with username/email and password fields', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /đăng nhập hệ thống/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/tên đăng nhập hoặc email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mật khẩu/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty fields', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /đăng nhập/i }))

    expect(await screen.findByText(/vui lòng nhập tên đăng nhập hoặc email/i)).toBeInTheDocument()
    expect(await screen.findByText(/vui lòng nhập mật khẩu/i)).toBeInTheDocument()
    expect(authService.login).not.toHaveBeenCalled()
  })

  it('calls authService.login, updates authStore and navigates to teacher dashboard on successful login', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.login).mockResolvedValueOnce({
      token: 'valid_jwt_token',
      userId: 1,
      username: 'teacher_le',
      displayName: 'Thầy Lê Văn Hướng',
      role: 'TEACHER',
      expiresAt: '2026-11-01T00:00:00Z',
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/tên đăng nhập hoặc email/i), 'teacher_le')
    await user.type(screen.getByLabelText(/mật khẩu/i), 'password123')
    await user.click(screen.getByRole('button', { name: /đăng nhập/i }))

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        usernameOrEmail: 'teacher_le',
        password: 'password123',
      })
    })

    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().token).toBe('valid_jwt_token')
    expect(useAuthStore.getState().user?.fullName).toBe('Thầy Lê Văn Hướng')
    expect(mockNavigate).toHaveBeenCalledWith('/teacher/dashboard', { replace: true })
  })

  it('navigates to location.state.from if redirected from ProtectedRoute', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.login).mockResolvedValueOnce({
      token: 'valid_student_jwt',
      userId: 2,
      username: 'student_an',
      displayName: 'Lê Thế An',
      role: 'STUDENT',
      expiresAt: '2026-11-01T00:00:00Z',
    })

    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: { pathname: '/student/rooms/room_123', search: '?view=full' } } }]}>
        <LoginPage />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/tên đăng nhập hoặc email/i), 'student_an')
    await user.type(screen.getByLabelText(/mật khẩu/i), 'password123')
    await user.click(screen.getByRole('button', { name: /đăng nhập/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/student/rooms/room_123?view=full', { replace: true })
    })
  })

  it('auto-redirects to dashboard on mount if user is already authenticated and store has hydrated', () => {
    useAuthStore.getState().setAuth(
      {
        userId: '10',
        email: 'student@mooc.local',
        fullName: 'Học sinh Nguyễn Văn B',
        roles: ['student'],
      },
      'hydrated_token'
    )
    useAuthStore.getState().setHasHydrated(true)

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    expect(mockNavigate).toHaveBeenCalledWith('/student/dashboard', { replace: true })
  })

  it('handles login failure and displays error message', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.login).mockRejectedValueOnce({
      response: {
        data: {
          message: 'Tên đăng nhập hoặc mật khẩu không chính xác',
        },
      },
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/tên đăng nhập hoặc email/i), 'wrong_user')
    await user.type(screen.getByLabelText(/mật khẩu/i), 'wrong_pass')
    await user.click(screen.getByRole('button', { name: /đăng nhập/i }))

    expect(await screen.findByText(/tên đăng nhập hoặc mật khẩu không chính xác/i)).toBeInTheDocument()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
