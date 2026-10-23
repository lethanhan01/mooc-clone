import * as React from 'react'
import { cn } from '@/utils'
import { useRadioGroupContext } from './radio-group-utils'

// ─── RadioCard (Compound Sub-component) ───────────────────────────────────────

export interface RadioCardProps {
  value: string
  id?: string
  title: React.ReactNode
  description?: React.ReactNode
  badge?: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
  className?: string
}

/**
 * RadioCard component for choosing packages, plans, payment methods, or options.
 */
export const RadioCard = React.forwardRef<HTMLInputElement, RadioCardProps>(
  ({ value, id, title, description, badge, icon, disabled: disabledProp, className }, ref) => {
    const ctx = useRadioGroupContext()
    const isDisabled = disabledProp ?? ctx?.disabled ?? false
    const isChecked = ctx?.value !== undefined ? ctx.value === value : false
    const generatedId = React.useId()
    const effectiveId = id ?? generatedId

    function handleChange() {
      if (!isDisabled && ctx?.onValueChange) {
        ctx.onValueChange(value)
      }
    }

    return (
      <label
        htmlFor={effectiveId}
        className={cn(
          'group relative flex w-full items-start gap-3.5 rounded-2xl border border-line-subtle bg-surface-sunken p-4 text-left transition-all duration-150 cursor-pointer touch-manipulation',
          'hover:border-line-hover hover:bg-surface-card-hover',
          'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-focus-ring has-[:focus-visible]:ring-offset-1',
          isChecked && 'border-action-primary bg-action-primary/5 shadow-xs',
          isDisabled && 'cursor-not-allowed opacity-40 pointer-events-none',
          className
        )}
      >
        <input
          ref={ref}
          type="radio"
          id={effectiveId}
          name={ctx?.name}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          onChange={handleChange}
          className="peer sr-only"
          tabIndex={isChecked ? 0 : -1}
        />
        <div className="mt-0.5 shrink-0" aria-hidden="true">
          <div
            className={cn(
              'flex h-4 w-4 items-center justify-center rounded-full border transition-colors',
              isChecked
                ? 'border-action-primary bg-action-primary/20'
                : 'border-line-default'
            )}
          >
            {isChecked ? <span className="h-2 w-2 rounded-full bg-action-primary" /> : null}
          </div>
        </div>
        {icon ? (
          <div className={cn('mt-0.5 shrink-0 transition-colors', isChecked ? 'text-action-primary' : 'text-fg-muted')}>
            {icon}
          </div>
        ) : null}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-fg-primary truncate">{title}</span>
            {badge ? <span className="shrink-0">{badge}</span> : null}
          </div>
          {description ? (
            <p className="mt-0.5 text-xs text-fg-secondary line-clamp-2">{description}</p>
          ) : null}
        </div>
      </label>
    )
  }
)
RadioCard.displayName = 'RadioGroup.Card'
