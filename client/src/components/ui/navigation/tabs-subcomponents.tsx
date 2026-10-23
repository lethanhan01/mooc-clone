import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { cn } from '@/utils'
import {
  LIST_VARIANT_CLASSES,
  SIZE_CLASSES,
  useTabsContext,
} from './tabs-utils'

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: ReactNode
  'aria-label'?: string
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, 'aria-label': ariaLabel, ...props }, ref) => {
    const { variant } = useTabsContext()

    return (
      <div
        ref={ref}
        role="tablist"
        aria-label={ariaLabel}
        className={cn(LIST_VARIANT_CLASSES[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsList.displayName = 'TabsList'

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  disabled?: boolean
  leftIcon?: ReactNode
  badge?: ReactNode
  className?: string
  children?: ReactNode
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  (
    {
      value,
      disabled = false,
      leftIcon,
      badge,
      className,
      children,
      onClick,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const { value: activeValue, onValueChange, variant, size, baseId } = useTabsContext()
    const isActive = activeValue === value
    const tabId = `${baseId}-tab-${value}`
    const panelId = `${baseId}-panel-${value}`

    const sizeClass = SIZE_CLASSES[size][variant]

    let variantStyle = ''
    if (variant === 'pills') {
      variantStyle = isActive
        ? 'bg-action-primary text-action-primary-fg shadow-xs font-bold'
        : 'text-fg-secondary hover:text-fg-primary hover:bg-surface-card-hover'
    } else if (variant === 'segmented') {
      variantStyle = isActive
        ? 'bg-action-primary/15 text-action-primary border border-action-primary-soft-border font-bold shadow-xs'
        : 'text-fg-dim hover:text-fg-primary hover:bg-surface-card-hover'
    } else if (variant === 'underline') {
      variantStyle = isActive
        ? 'text-action-primary border-b-2 border-action-primary font-bold'
        : 'text-fg-dim hover:text-fg-primary border-b-2 border-transparent'
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(e)
      if (e.defaultPrevented || disabled) return

      const currentTrigger = e.currentTarget
      const tablist = currentTrigger.closest('[role="tablist"]')
      const tabs = tablist
        ? Array.from(tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'))
        : []
      const currentIndex = tabs.indexOf(currentTrigger)

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onValueChange(value)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        const nextTab = tabs[(currentIndex + 1) % tabs.length]
        nextTab?.focus()
        nextTab?.click()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length]
        prevTab?.focus()
        prevTab?.click()
      } else if (e.key === 'Home') {
        e.preventDefault()
        tabs[0]?.focus()
        tabs[0]?.click()
      } else if (e.key === 'End') {
        e.preventDefault()
        const lastTab = tabs.at(-1)
        lastTab?.focus()
        lastTab?.click()
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={tabId}
        aria-selected={isActive}
        aria-controls={panelId}
        tabIndex={isActive ? 0 : -1}
        disabled={disabled}
        onClick={(e) => {
          onClick?.(e)
          if (!e.defaultPrevented) {
            onValueChange(value)
          }
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-action-primary disabled:pointer-events-none disabled:opacity-40 select-none',
          sizeClass,
          variantStyle,
          className
        )}
        {...props}
      >
        {/* Mobile touch target expander (≥44px per WCAG / LINE LIFF) for small/medium triggers */}
        {(size === 'sm' || size === 'md') && (
          <span
            className="absolute -inset-y-1.5 inset-x-0 md:hidden pointer-events-auto"
            aria-hidden="true"
          />
        )}
        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {badge !== undefined && (
          <span
            className={cn(
              'inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold rounded-full transition-colors',
              isActive
                ? 'bg-black/25 text-inherit'
                : 'bg-surface-sunken text-fg-secondary'
            )}
          >
            {badge}
          </span>
        )}
      </button>
    )
  }
)
TabsTrigger.displayName = 'TabsTrigger'

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string
  className?: string
  children?: ReactNode
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, children, ...props }, ref) => {
    const { value: activeValue, baseId } = useTabsContext()
    const isActive = activeValue === value
    const tabId = `${baseId}-tab-${value}`
    const panelId = `${baseId}-panel-${value}`

    if (!isActive) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId}
        tabIndex={0}
        className={cn('focus-visible:outline-hidden animate-in fade-in duration-200', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = 'TabsContent'
