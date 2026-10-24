import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore, type Role } from '@/stores/authStore'
import { getHomePathForRoles } from '@/stores/mockExamStore'
import type { ProtectedRouteProps } from './protected-route.types'

export function ProtectedRoute({ allowedRoles, children }: Readonly<ProtectedRouteProps> = {}) {
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const location = useLocation()

  if (!hasHydrated) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && allowedRoles.length > 0 && !user.roles.some((r) => allowedRoles.includes(r as Role))) {
    return <Navigate to={getHomePathForRoles(user.roles)} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export type { ProtectedRouteProps } from './protected-route.types'
