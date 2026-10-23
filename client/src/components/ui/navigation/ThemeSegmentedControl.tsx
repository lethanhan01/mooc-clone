import { useRef, type KeyboardEvent } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme, type Theme } from '@/stores/themeStore'
import { cn } from '@/utils'

export interface ThemeSegmentedControlProps {
  className?: string
  size?: 'sm' | 'md'
  fullWidth?: boolean
}

export function ThemeSegmentedControl({
  className,
  size = 'md',
  fullWidth = false,
}: Readonly<ThemeSegmentedControlProps>) {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation('common')
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: t('theme.light'), icon: Sun },
    { value: 'dark', label: t('theme.dark'), icon: Moon },
    { value: 'system', label: t('theme.system'), icon: Monitor },
  ]

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      nextIndex = (index + 1) % options.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      nextIndex = (index - 1 + options.length) % options.length
    }

    if (nextIndex !== index) {
      buttonRefs.current[nextIndex]?.focus()
      setTheme(options[nextIndex].value)
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={t('theme.title')}
      className={cn(
        'inline-flex items-center rounded-xl border border-line-subtle bg-surface-card-inset p-1 gap-1',
        fullWidth && 'w-full flex',
        className
      )}
    >
      {options.map((opt, index) => {
        const Icon = opt.icon
        const isActive = theme === opt.value

        return (
          <button
            key={opt.value}
            ref={(el) => {
              buttonRefs.current[index] = el
            }}
            type="button"
            data-no-sweep
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => setTheme(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-lg font-body font-medium transition-all duration-200 cursor-pointer touch-manipulation',
              fullWidth ? 'flex-1' : '',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm',
              isActive
                ? 'bg-surface-elevated text-action-primary font-semibold shadow-sm border border-line-subtle'
                : 'text-fg-muted hover:text-fg-primary hover:bg-surface-card-hover'
            )}
          >
            <Icon size={size === 'sm' ? 14 : 16} className={isActive ? 'text-action-primary' : 'text-fg-subtle'} />
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
