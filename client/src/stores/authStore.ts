import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_STUDENT, DEMO_TEACHER } from '@/services/mockData'

export type Role = 'student' | 'teacher' | 'admin' | 'user'

export interface AuthUser {
  userId: string
  email: string
  fullName: string
  roles: Role[]
  avatarUrl?: string | null
  studentId?: string | null
  department?: string | null
  memberId?: string | null
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

