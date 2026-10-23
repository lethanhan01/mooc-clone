import {
  forwardRef,
  useMemo,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils'
import {
  AccordionItemContext,
  ITEM_VARIANT_CLASSES,
  useAccordionContext,
  useAccordionItemContext,
  type AccordionItemContextValue,
} from './accordion-utils'

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
  className?: string
  children?: ReactNode
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, disabled = false, className, children, ...props }, ref) => {
    const { isExpanded, variant, baseId } = useAccordionContext()
    const isOpen = isExpanded(value)
    const itemId = `${baseId}-item-${value}`

    const itemContextValue = useMemo<AccordionItemContextValue>(
      () => ({ value, disabled, isOpen, itemId }),
      [value, disabled, isOpen, itemId]
    )

    return (
      <AccordionItemContext.Provider value={itemContextValue}>
        <div
          ref={ref}
          className={cn(
            ITEM_VARIANT_CLASSES[variant],
            disabled && 'opacity-50 pointer-events-none',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    )
  }
)
AccordionItem.displayName = 'AccordionItem'

export interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  leftIcon?: ReactNode
  badge?: ReactNode
  hideChevron?: boolean
  children?: ReactNode
}

export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  (
    {
      className,
      leftIcon,
      badge,
      hideChevron = false,
      children,
      onClick,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const { toggleItem } = useAccordionContext()
    const { value, disabled, isOpen, itemId } = useAccordionItemContext()

    const headerId = `${itemId}-header`
    const panelId = `${itemId}-panel`

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(e)
      if (e.defaultPrevented) return

      const currentTrigger = e.currentTarget
      const container =
        currentTrigger.closest('[data-accordion-root]') ||
        currentTrigger.parentElement?.parentElement?.parentElement
      const triggers = container
        ? Array.from(container.querySelectorAll<HTMLButtonElement>('button[aria-expanded]'))
        : []
      const currentIndex = triggers.indexOf(currentTrigger)

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const nextTrigger = triggers[(currentIndex + 1) % triggers.length]
        nextTrigger?.focus()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prevTrigger = triggers[(currentIndex - 1 + triggers.length) % triggers.length]
        prevTrigger?.focus()
      } else if (e.key === 'Home') {
        e.preventDefault()
        triggers[0]?.focus()
      } else if (e.key === 'End') {
        e.preventDefault()
        triggers.at(-1)?.focus()
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        id={headerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        disabled={disabled}
        onClick={(e) => {
          onClick?.(e)
          if (!e.defaultPrevented) {
            toggleItem(value)
          }
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex w-full items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 text-left font-semibold text-fg-primary transition-all hover:bg-surface-card-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-action-primary select-none',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3 min-w-0">
          {leftIcon && <span className="shrink-0 text-action-primary">{leftIcon}</span>}
          <span className="truncate">{children}</span>
          {badge && <span className="shrink-0">{badge}</span>}
        </div>

        {!hideChevron && (
          <ChevronDown
            size={18}
            className={cn(
              'shrink-0 text-fg-dim transition-transform duration-200',
              isOpen && 'rotate-180 text-action-primary'
            )}
          />
        )}
      </button>
    )
  }
)
AccordionTrigger.displayName = 'AccordionTrigger'

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: ReactNode
}

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, itemId } = useAccordionItemContext()
    const headerId = `${itemId}-header`
    const panelId = `${itemId}-panel`

    if (!isOpen) return null

    return (
      <section
        ref={ref as React.Ref<HTMLElement>}
        id={panelId}
        aria-labelledby={headerId}
        className={cn(
          'px-4 sm:px-5 pb-4 pt-1 text-sm text-fg-secondary border-t border-line-subtle animate-in fade-in-50 duration-200 leading-relaxed',
          className
        )}
        {...props}
      >
        {children}
      </section>
    )
  }
)
AccordionContent.displayName = 'AccordionContent'
