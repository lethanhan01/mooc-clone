import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_STUDENT, DEMO_TEACHER } from '@/services/mockData'

import type { AuthResponse, AuthUser, Role } from '@/types'

export type { Role, AuthUser }

export function mapAuthResponseToUser(authData: AuthResponse): AuthUser {
  const rawRole = (authData.role || 'STUDENT').toUpperCase()
  let mappedRole: Role = 'student'
  if (rawRole === 'TEACHER') mappedRole = 'teacher'
  else if (rawRole === 'ADMIN') mappedRole = 'admin'
  else if (rawRole === 'USER') mappedRole = 'user'

  const username = authData.username || ''
  const email = username.includes('@') ? username : `${username}@mooc.local`

  return {
    userId: String(authData.userId),
    email,
    fullName: authData.displayName || username,
    roles: [mappedRole],
  }
}

/** Keep persisted demo sessions in sync when mock display names change. */
function syncDemoUser(user: AuthUser | null): AuthUser | null {
  if (!user) return null
  if (user.userId === DEMO_TEACHER.userId) return { ...user, ...DEMO_TEACHER }
  if (user.userId === DEMO_STUDENT.userId) return { ...user, ...DEMO_STUDENT }
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

