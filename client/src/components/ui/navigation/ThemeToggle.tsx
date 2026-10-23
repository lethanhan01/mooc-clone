import { Sun, Moon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/stores/themeStore'
import { cn } from '@/utils'

export interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md'
}

export function ThemeToggle({ className, size = 'md' }: Readonly<ThemeToggleProps>) {
  const { isDark, toggleTheme } = useTheme()
  const { t } = useTranslation('common')

  const label = isDark ? t('theme.switchToLight') : t('theme.switchToDark')

  return (
    <button
      type="button"
      data-no-sweep
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full border border-line-default bg-surface-elevated text-fg-secondary transition-colors duration-200 hover:border-line-hover hover:text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus cursor-pointer touch-manipulation',
        size === 'sm' ? 'h-8 w-8 min-h-[32px] min-w-[32px]' : 'h-9 w-9 min-h-[36px] min-w-[36px]',
        className
      )}
    >
      <Sun
        size={size === 'sm' ? 16 : 18}
        className={cn(
          'transition-transform duration-300',
          isDark
            ? 'rotate-0 scale-100 opacity-100 text-status-warning-fg'
            : '-rotate-90 scale-0 opacity-0 absolute'
        )}
      />
      <Moon
        size={size === 'sm' ? 16 : 18}
        className={cn(
          'transition-transform duration-300',
          isDark
            ? 'rotate-90 scale-0 opacity-0 absolute'
            : 'rotate-0 scale-100 opacity-100 text-action-primary'
        )}
      />
    </button>
  )
}
