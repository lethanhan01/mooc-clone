import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse, AuthUser, Role } from '@/types'

export type { Role, AuthUser }

export function getHomePathForRoles(roles: Role[] = []): string {
  if (roles.includes('teacher')) return '/teacher/dashboard'
  return '/student/dashboard'
}

export function mapAuthResponseToUser(authData: AuthResponse): AuthUser {
  const rawRole = (authData.role || 'STUDENT').toUpperCase()
  const mappedRole: Role = rawRole === 'TEACHER' || rawRole === 'ADMIN' ? 'teacher' : 'student'

  const username = authData.username || ''
  const email = username.includes('@') ? username : `${username}@mooc.local`

  return {
    userId: String(authData.userId),
    email,
    fullName: authData.displayName || username,
    roles: [mappedRole],
  }
}

function syncDemoUser(user: AuthUser | null): AuthUser | null {
  return user
}

export type LogoutListener = () => void
const logoutListeners = new Set<LogoutListener>()

export function onLogout(listener: LogoutListener): () => void {
  logoutListeners.add(listener)
  return () => {
    logoutListeners.delete(listener)
  }
}

export function notifyLogout(): void {
  logoutListeners.forEach((listener) => {
    try {
      listener()
    } catch (err) {
      console.error('[onLogout listener error]:', err)
    }
  })
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  hasHydrated: boolean

  setAuth: (user: AuthUser, token: string) => void
  setUser: (user: AuthUser) => void
  clearAuth: () => void
  setHasHydrated: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      setUser: (user) => set({ user }),

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        notifyLogout()
      },

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'mooc-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          const synced = syncDemoUser(state.user)
          if (synced && synced !== state.user) {
            state.setUser(synced)
          }
        }
        state?.setHasHydrated(true)
      },
    }
  )
)

