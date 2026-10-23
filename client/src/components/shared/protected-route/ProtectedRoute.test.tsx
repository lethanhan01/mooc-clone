import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuthStore, type AuthUser, type Role } from '@/stores/authStore'

function setUserAgent(userAgent: string) {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: userAgent,
    configurable: true,
  })
}

function LocationView() {
  const location = useLocation()
  return <div data-testid="location">{`${location.pathname}${location.search}${location.hash}`}</div>
}

function renderProtectedRoute(initialEntry: string, allowedRoles: Role[]) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/member/*"
          element={
            <ProtectedRoute allowedRoles={allowedRoles}>
              <div>Member content</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/*"
          element={
            <ProtectedRoute allowedRoles={allowedRoles}>
              <div>Trainer content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LocationView />} />
        <Route path="/liff" element={<LocationView />} />
        <Route path="/" element={<LocationView />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: true,
    })
    setUserAgent('Mozilla/5.0 Chrome/126.0.0.0 Safari/537.36')
  })

  it('redirects anonymous member-only routes in LINE browser to LIFF with the current path', async () => {
    setUserAgent('Mozilla/5.0 Line/13.0.0')

    renderProtectedRoute('/member/workout/sessions?sessionId=1#active', ['student'])

    expect(await screen.findByTestId('location')).toHaveTextContent(
      '/login'
    )
  })

  it('redirects anonymous member-only routes in regular browsers to login', async () => {
    renderProtectedRoute('/member/workout/sessions?sessionId=1', ['student'])

    expect(await screen.findByTestId('location')).toHaveTextContent('/login')
  })

  it('does not auto-enter LIFF for anonymous non-member routes in LINE browser', async () => {
    setUserAgent('Mozilla/5.0 Line/13.0.0')

    renderProtectedRoute('/trainer', ['teacher'])

    expect(await screen.findByTestId('location')).toHaveTextContent('/login')
  })

  it('renders the protected content when the logged-in user has an allowed role', () => {
    const user: AuthUser = {
      userId: '1',
      email: 'member@example.com',
      fullName: 'Member',
      roles: ['student'],
      memberId: '10',
    }
    useAuthStore.getState().setAuth(user, 'token')

    renderProtectedRoute('/member', ['student'])

    expect(screen.getByText('Member content')).toBeInTheDocument()
  })
})


