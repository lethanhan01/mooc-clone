import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/auth.service'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/services/auth.service', () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().clearAuth()
    useAuthStore.getState().setHasHydrated(false)
  })

  it('renders registration form fields', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /đăng ký tài khoản học sinh/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/họ và tên học sinh/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tên đăng nhập/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/địa chỉ email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^mật khẩu:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/xác nhận mật khẩu/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /đăng ký học sinh/i })).toBeInTheDocument()
  })

  it('shows validation errors when fields are empty', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /đăng ký học sinh/i }))

    expect(await screen.findByText(/vui lòng nhập họ và tên/i)).toBeInTheDocument()
    expect(await screen.findByText(/vui lòng nhập tên đăng nhập/i)).toBeInTheDocument()
    expect(await screen.findByText(/vui lòng nhập email/i)).toBeInTheDocument()
  })

  it('submits registration successfully and navigates to login page', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.register).mockResolvedValueOnce({
      id: 99,
      username: 'hocsinh_binh',
      email: 'binh@mooc.local',
      displayName: 'Trần Văn Bình',
      role: 'STUDENT',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    })

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/họ và tên học sinh/i), 'Trần Văn Bình')
    await user.type(screen.getByLabelText(/tên đăng nhập/i), 'hocsinh_binh')
    await user.type(screen.getByLabelText(/địa chỉ email/i), 'binh@mooc.local')
    await user.type(screen.getByLabelText(/^mật khẩu:/i), 'password123')
    await user.type(screen.getByLabelText(/xác nhận mật khẩu/i), 'password123')

    await user.click(screen.getByRole('button', { name: /đăng ký học sinh/i }))

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        username: 'hocsinh_binh',
        email: 'binh@mooc.local',
        password: 'password123',
        displayName: 'Trần Văn Bình',
      })
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })

  it('auto-redirects to home path if already authenticated and hydrated', () => {
    useAuthStore.getState().setAuth(
      {
        userId: '99',
        email: 'teacher@mooc.local',
        fullName: 'Cô Lê Hướng',
        roles: ['teacher'],
      },
      'token_123'
    )
    useAuthStore.getState().setHasHydrated(true)

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    expect(mockNavigate).toHaveBeenCalledWith('/teacher/dashboard', { replace: true })
  })
})
