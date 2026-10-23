// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useThemeStore,
  useTheme,
  resolveTheme,
  applyTheme,
} from './themeStore'

describe('themeStore — Runtime Theme Management & Zero FOUT', () => {
  let listeners: ((e: MediaQueryListEvent) => void)[] = []
  let matchesDark = true

  beforeEach(() => {
    listeners = []
    matchesDark = true

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: matchesDark,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
          if (event === 'change') listeners.push(handler)
        }),
        removeEventListener: vi.fn((_event: string, handler: (e: MediaQueryListEvent) => void) => {
          listeners = listeners.filter((l) => l !== handler)
        }),
        dispatchEvent: vi.fn(),
      })),
    })

    // Reset store state and DOM
    useThemeStore.setState({ theme: 'dark', resolvedTheme: 'dark' })
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.style.colorScheme = ''
    vi.clearAllMocks()
  })

  it('TC-TS-01: sets theme to light and syncs DOM attributes', () => {
    useThemeStore.getState().setTheme('light')

    const state = useThemeStore.getState()
    expect(state.theme).toBe('light')
    expect(state.resolvedTheme).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('TC-TS-02: sets theme to dark and syncs DOM attributes', () => {
    useThemeStore.getState().setTheme('light')
    useThemeStore.getState().setTheme('dark')

    const state = useThemeStore.getState()
    expect(state.theme).toBe('dark')
    expect(state.resolvedTheme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('TC-TS-03: toggleTheme toggles between dark and light', () => {
    useThemeStore.getState().setTheme('dark')
    useThemeStore.getState().toggleTheme()

    expect(useThemeStore.getState().theme).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    useThemeStore.getState().toggleTheme()
    expect(useThemeStore.getState().theme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('TC-TS-04: system theme mode resolves according to prefers-color-scheme media query', () => {
    // When OS is dark
    matchesDark = true
    useThemeStore.getState().setTheme('system')
    expect(useThemeStore.getState().theme).toBe('system')
    expect(useThemeStore.getState().resolvedTheme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    // When OS is light
    matchesDark = false
    useThemeStore.getState().setTheme('system')
    expect(useThemeStore.getState().theme).toBe('system')
    expect(useThemeStore.getState().resolvedTheme).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('TC-TS-05: in system mode, toggleTheme toggles to opposite of currently resolved theme', () => {
    matchesDark = true // resolved is dark
    useThemeStore.getState().setTheme('system')
    expect(useThemeStore.getState().resolvedTheme).toBe('dark')

    useThemeStore.getState().toggleTheme()
    expect(useThemeStore.getState().theme).toBe('light')
    expect(useThemeStore.getState().resolvedTheme).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('TC-TS-06: media query listener updates resolvedTheme when OS scheme changes in system mode', () => {
    matchesDark = true
    useThemeStore.getState().setTheme('system')
    expect(useThemeStore.getState().resolvedTheme).toBe('dark')

    // Simulate OS preference changing to light
    act(() => {
      listeners.forEach((listener) =>
        listener({ matches: false } as MediaQueryListEvent)
      )
    })

    expect(useThemeStore.getState().resolvedTheme).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('TC-TS-07: useTheme hook reflects correct state and helper flags', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('dark')
    })
    expect(result.current.isDark).toBe(true)
    expect(result.current.isLight).toBe(false)
    expect(result.current.isSystem).toBe(false)

    act(() => {
      result.current.setTheme('light')
    })
    expect(result.current.isDark).toBe(false)
    expect(result.current.isLight).toBe(true)
    expect(result.current.isSystem).toBe(false)

    act(() => {
      result.current.setTheme('system')
    })
    expect(result.current.isSystem).toBe(true)
  })

  it('TC-TS-08: applyTheme and resolveTheme work standalone', () => {
    expect(resolveTheme('dark')).toBe('dark')
    expect(resolveTheme('light')).toBe('light')

    const applied = applyTheme('light')
    expect(applied).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })
})
