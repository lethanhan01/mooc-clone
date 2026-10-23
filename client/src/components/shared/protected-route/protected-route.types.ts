import type { ReactNode } from 'react'
import type { Role } from '@/stores/authStore'

export interface ProtectedRouteProps {
  allowedRoles?: Role[]
  children?: ReactNode
}
