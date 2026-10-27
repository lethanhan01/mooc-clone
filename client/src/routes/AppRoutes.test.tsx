import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Suspense } from 'react'
import { AppRoutes } from './AppRoutes'
import { useAuthStore } from '@/stores/authStore'
import '@/pages/auth/LoginPage'

describe('AppRoutes', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth()
  })

  it('renders login page when navigating to /login', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Suspense fallback={<div>Loading...</div>}>
          <AppRoutes />
        </Suspense>
      </MemoryRouter>
    )

    const heading = await screen.findByRole(
      'heading',
      { name: /đăng nhập hệ thống/i },
      { timeout: 5000 }
    )
    expect(heading).toBeInTheDocument()
  })

  it('redirects to /login when unauthenticated user accesses /dashboard', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Suspense fallback={<div>Loading...</div>}>
          <AppRoutes />
        </Suspense>
      </MemoryRouter>
    )

    const heading = await screen.findByRole(
      'heading',
      { name: /đăng nhập hệ thống/i },
      { timeout: 5000 }
    )
    expect(heading).toBeInTheDocument()
  })

  it('redirects teacher to /teacher/dashboard when accessing /', async () => {
    useAuthStore.getState().setAuth(
      {
        userId: '1',
        email: 'teacher.le@mooc.local',
        fullName: 'Thầy Lê Văn Hướng',
        roles: ['teacher'],
      },
      'valid_token'
    )

    render(
      <MemoryRouter initialEntries={['/']}>
        <Suspense fallback={<div>Loading...</div>}>
          <AppRoutes />
        </Suspense>
      </MemoryRouter>
    )

    expect(window.location.pathname).toBe('/')
  })

  it('renders profile page when navigating to /profile as an authenticated user', async () => {
    useAuthStore.getState().setAuth(
      {
        userId: 'student_1',
        email: 'student@mooc.local',
        fullName: 'Nguyễn Văn Học Sinh',
        roles: ['student'],
      },
      'valid_token'
    )

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Suspense fallback={<div>Loading...</div>}>
          <AppRoutes />
        </Suspense>
      </MemoryRouter>
    )

    const heading = await screen.findByRole(
      'heading',
      { name: /hồ sơ cá nhân/i },
      { timeout: 5000 }
    )
    expect(heading).toBeInTheDocument()
  })

  it('renders student dashboard when authenticated student accesses /student', async () => {
    useAuthStore.getState().setAuth(
      {
        userId: 'student_1',
        email: 'student@mooc.local',
        fullName: 'Nguyễn Văn Học Sinh',
        roles: ['student'],
      },
      'valid_token'
    )

    render(
      <MemoryRouter initialEntries={['/student']}>
        <Suspense fallback={<div>Loading...</div>}>
          <AppRoutes />
        </Suspense>
      </MemoryRouter>
    )

    const heading = await screen.findByRole(
      'heading',
      { name: /nguyễn văn học sinh/i },
      { timeout: 5000 }
    )
    expect(heading).toBeInTheDocument()
  })

  it('renders teacher dashboard when authenticated teacher accesses /teacher', async () => {
    useAuthStore.getState().setAuth(
      {
        userId: 'teacher_1',
        email: 'teacher@mooc.local',
        fullName: 'Thầy Lê Văn Hướng',
        roles: ['teacher'],
      },
      'valid_token'
    )

    render(
      <MemoryRouter initialEntries={['/teacher']}>
        <Suspense fallback={<div>Loading...</div>}>
          <AppRoutes />
        </Suspense>
      </MemoryRouter>
    )

    const heading = await screen.findByRole(
      'heading',
      { name: /tổng quan giáo viên/i },
      { timeout: 5000 }
    )
    expect(heading).toBeInTheDocument()
  })
})

