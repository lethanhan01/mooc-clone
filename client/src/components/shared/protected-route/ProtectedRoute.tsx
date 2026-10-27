import { useEffect, useRef } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore, getHomePathForRoles, type Role } from '@/stores/authStore'
import { authService } from '@/services/auth.service'
import { toast } from '@/lib/toast'

import type { ProtectedRouteProps } from './protected-route.types'

let hasValidatedSessionOnce = false

export function ProtectedRoute({ allowedRoles, children }: Readonly<ProtectedRouteProps> = {}) {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const location = useLocation()
  const warnedRef = useRef(false)

  // rogym-convention-exempt: NO_EFFECT_FETCH [Bootstrap initial session validation]
  useEffect(() => {
    if (hasHydrated && token && !hasValidatedSessionOnce) {
      hasValidatedSessionOnce = true
      authService.getCurrentUser().catch(() => {
        // Interceptor handles 401 by clearing auth
      })
    }
  }, [hasHydrated, token])

  const isRoleForbidden =
    hasHydrated &&
    Boolean(user && token) &&
    Boolean(allowedRoles && allowedRoles.length > 0 && !user?.roles.some((r) => allowedRoles.includes(r as Role)))

  useEffect(() => {
    if (isRoleForbidden && !warnedRef.current) {
      warnedRef.current = true
      toast.error('Bạn không có quyền truy cập trang này')
    }
  }, [isRoleForbidden])

  if (!hasHydrated) {
    return null
  }

  if (!user || !token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (isRoleForbidden) {
    return <Navigate to={getHomePathForRoles(user.roles)} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export type { ProtectedRouteProps } from './protected-route.types'
