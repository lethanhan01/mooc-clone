import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  useAuthStore,
  onLogout,
  mapAuthResponseToUser,
  getHomePathForRoles,
  AUTH_STORAGE_KEY,
  type AuthUser,
} from './authStore'

describe('authStore', () => {
  const mockUser: AuthUser = {
    userId: '1',
    email: 'user@mooc.local',
    fullName: 'Test User',
    roles: ['student'],
  }

  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    useAuthStore.getState().clearAuth(false)
  })

  it('mapAuthResponseToUser correctly maps roles and fields', () => {
    const teacherData = {
      token: 'tok-1',
      userId: 1,
      username: 'teacher1',
      displayName: 'GV Nguyễn',
      role: 'TEACHER',
      expiresAt: '2026-12-31T00:00:00Z',
    }
    const mappedTeacher = mapAuthResponseToUser(teacherData)
    expect(mappedTeacher.userId).toBe('1')
    expect(mappedTeacher.fullName).toBe('GV Nguyễn')
    expect(mappedTeacher.roles).toEqual(['teacher'])

    const studentData = {
      token: 'tok-2',
      userId: 2,
      username: 'student1',
      displayName: 'HS Lê',
      role: 'STUDENT',
      expiresAt: '2026-12-31T00:00:00Z',
    }
    const mappedStudent = mapAuthResponseToUser(studentData)
    expect(mappedStudent.roles).toEqual(['student'])
  })

  it('getHomePathForRoles redirects teachers to /teacher/dashboard and others to /student/dashboard', () => {
    expect(getHomePathForRoles(['teacher'])).toBe('/teacher/dashboard')
    expect(getHomePathForRoles(['student'])).toBe('/student/dashboard')
    expect(getHomePathForRoles([])).toBe('/student/dashboard')
  })

  it('setAuth with rememberMe: false persists into sessionStorage', () => {
    useAuthStore.getState().setAuth(mockUser, 'test-token', false)
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe('test-token')
    expect(state.rememberMe).toBe(false)

    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).not.toBeNull()
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })

  it('setAuth with rememberMe: true persists into localStorage', () => {
    useAuthStore.getState().setAuth(mockUser, 'test-token-remember', true)
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.rememberMe).toBe(true)

    expect(localStorage.getItem(AUTH_STORAGE_KEY)).not.toBeNull()
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })

  it('clearAuth wipes store state and both storages, and fires onLogout listener', () => {
    const listener = vi.fn()
    const unsubscribe = onLogout(listener)

    useAuthStore.getState().setAuth(mockUser, 'token-to-clear', true)
    useAuthStore.getState().clearAuth(false)

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)

    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()

    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('onLogout unsubscribe stops future notifications', () => {
    const listener = vi.fn()
    const unsubscribe = onLogout(listener)
    unsubscribe()

    useAuthStore.getState().clearAuth(false)
    expect(listener).not.toHaveBeenCalled()
  })
})
