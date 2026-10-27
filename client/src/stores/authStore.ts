import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
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

export const AUTH_STORAGE_KEY = 'mooc-auth-storage'

// Cross-tab synchronization via BroadcastChannel
export const authChannel: BroadcastChannel | null =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('mooc-auth')
    : null

export const dynamicAuthStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === 'undefined') return null
      const sessionVal = sessionStorage.getItem(name)
      if (sessionVal) return sessionVal
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window === 'undefined') return
      const parsed = JSON.parse(value)
      const remember = parsed?.state?.rememberMe ?? false
      if (remember) {
        localStorage.setItem(name, value)
        sessionStorage.removeItem(name)
      } else {
        sessionStorage.setItem(name, value)
        localStorage.removeItem(name)
      }
    } catch {
      try {
        sessionStorage.setItem(name, value)
      } catch {}
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window === 'undefined') return
      sessionStorage.removeItem(name)
      localStorage.removeItem(name)
    } catch {}
  },
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  rememberMe: boolean
  isAuthenticated: boolean
  hasHydrated: boolean

  setAuth: (user: AuthUser, token: string, rememberMe?: boolean) => void
  setUser: (user: AuthUser) => void
  clearAuth: (broadcast?: boolean) => void
  setHasHydrated: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      rememberMe: false,
      isAuthenticated: false,
      hasHydrated: false,

      setAuth: (user, token, rememberMe = false) =>
        set({
          user,
          token,
          rememberMe,
          isAuthenticated: true,
        }),

      setUser: (user) => set({ user }),

      clearAuth: (broadcast = true) => {
        set({
          user: null,
          token: null,
          rememberMe: false,
          isAuthenticated: false,
        })
        try {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem(AUTH_STORAGE_KEY)
            localStorage.removeItem(AUTH_STORAGE_KEY)
          }
        } catch {}

        notifyLogout()

        if (broadcast && authChannel) {
          try {
            authChannel.postMessage({ type: 'LOGOUT' })
          } catch {}
        }
      },

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => dynamicAuthStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        rememberMe: state.rememberMe,
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

// Setup listeners for multi-tab synchronization
if (authChannel) {
  authChannel.onmessage = (event) => {
    if (event.data?.type === 'LOGOUT') {
      useAuthStore.getState().clearAuth(false)
    }
  }
}

export function setupStorageListener(): () => void {
  if (typeof window === 'undefined') return () => {}

  const handleStorage = (event: StorageEvent) => {
    if (event.key === AUTH_STORAGE_KEY) {
      if (!event.newValue) {
        useAuthStore.getState().clearAuth(false)
      } else {
        try {
          const parsed = JSON.parse(event.newValue)
          if (!parsed?.state?.user || !parsed?.state?.token) {
            useAuthStore.getState().clearAuth(false)
          }
        } catch {
          useAuthStore.getState().clearAuth(false)
        }
      }
    }
  }

  window.addEventListener('storage', handleStorage)
  return () => {
    window.removeEventListener('storage', handleStorage)
  }
}

if (typeof window !== 'undefined') {
  setupStorageListener()
}
