import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light' | 'system'
export type ResolvedTheme = 'dark' | 'light'

let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null
let mediaQueryList: MediaQueryList | null = null

/**
 * Phân giải theme hiển thị thực tế dựa trên thiết lập và tùy chọn hệ điều hành
 */
export function resolveTheme(theme: Theme): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark'

  if (theme === 'system') {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  return theme
}

/**
 * Áp dụng theme lên thẻ gốc documentElement (data-theme & color-scheme)
 */
export function applyTheme(theme: Theme): ResolvedTheme {
  const resolved = resolveTheme(theme)

  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = resolved
    document.documentElement.style.colorScheme = resolved
  }

  return resolved
}

/**
 * Đăng ký / hủy đăng ký listener theo dõi sự thay đổi prefers-color-scheme của hệ điều hành
 */
function setupSystemThemeListener(
  theme: Theme,
  onSystemThemeChange: (resolved: ResolvedTheme) => void
) {
  if (typeof window === 'undefined' || !window.matchMedia) return

  // Dọn dẹp listener cũ nếu có
  if (mediaQueryList && mediaQueryListener) {
    if (typeof mediaQueryList.removeEventListener === 'function') {
      mediaQueryList.removeEventListener('change', mediaQueryListener)
    } else if (typeof (mediaQueryList as unknown as { removeListener: (cb: typeof mediaQueryListener) => void }).removeListener === 'function') {
      (mediaQueryList as unknown as { removeListener: (cb: typeof mediaQueryListener) => void }).removeListener(mediaQueryListener)
    }
    mediaQueryListener = null
    mediaQueryList = null
  }

  // Nếu đang ở chế độ system, đăng ký theo dõi
  if (theme === 'system') {
    mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQueryListener = (e: MediaQueryListEvent) => {
      const newResolved: ResolvedTheme = e.matches ? 'dark' : 'light'
      if (typeof document !== 'undefined') {
        document.documentElement.dataset.theme = newResolved
        document.documentElement.style.colorScheme = newResolved
      }
      onSystemThemeChange(newResolved)
    }

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', mediaQueryListener)
    } else if (typeof (mediaQueryList as unknown as { addListener: (cb: typeof mediaQueryListener) => void }).addListener === 'function') {
      (mediaQueryList as unknown as { addListener: (cb: typeof mediaQueryListener) => void }).addListener(mediaQueryListener)
    }
  }
}

export interface ThemeState {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      resolvedTheme: 'dark',

      setTheme: (newTheme: Theme) => {
        const resolved = applyTheme(newTheme)
        setupSystemThemeListener(newTheme, (updatedResolved) => {
          set({ resolvedTheme: updatedResolved })
        })
        set({ theme: newTheme, resolvedTheme: resolved })
      },

      toggleTheme: () => {
        const currentResolved = get().resolvedTheme
        const nextTheme: Theme = currentResolved === 'dark' ? 'light' : 'dark'
        get().setTheme(nextTheme)
      },
    }),
    {
      name: 'mooc-theme',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = applyTheme(state.theme)
          state.resolvedTheme = resolved
          setupSystemThemeListener(state.theme, (updatedResolved) => {
            useThemeStore.setState({ resolvedTheme: updatedResolved })
          })
        }
      },
    }
  )
)

/**
 * Hook tiện ích chuẩn dùng trong React components
 */
export function useTheme() {
  const theme = useThemeStore((s) => s.theme)
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system',
  }
}
