import * as React from 'react'
import { cn } from '@/utils'
import {
  radioIndicatorVariants,
  radioDotVariants,
  radioLabelVariants,
  radioDescriptionVariants,
  useRadioGroupContext,
  normalizeRadioSize,
} from './radio-group-utils'

// ─── RadioGroup.Indicator (top-level — no inline component) ──────────────────

export const RadioIndicator = ({
  className,
  checked: checkedProp,
  disabled: disabledProp,
}: Readonly<{ className?: string; checked?: boolean; disabled?: boolean }>) => {
  const ctx = useRadioGroupContext()
  const size = normalizeRadioSize(ctx?.size)
  const disabled = disabledProp ?? ctx?.disabled ?? false

  return (
    <div
      className={cn(
        radioIndicatorVariants({ size, checked: checkedProp ?? false, disabled }),
        className
      )}
      aria-hidden="true"
    >
      {checkedProp ? (
        <span className={cn(radioDotVariants({ size }))} />
      ) : null}
    </div>
  )
}
RadioIndicator.displayName = 'RadioGroup.Indicator'

// ─── RadioGroup.Label (top-level) ────────────────────────────────────────────

export const RadioLabel = ({
  className,
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) => {
  const ctx = useRadioGroupContext()
  const size = normalizeRadioSize(ctx?.size)
  const disabled = Boolean(ctx?.disabled)

  return (
    <span className={cn(radioLabelVariants({ size, disabled }), className)}>
      {children}
    </span>
  )
}
RadioLabel.displayName = 'RadioGroup.Label'

// ─── RadioGroup.Description (top-level) ──────────────────────────────────────

export const RadioDescription = ({
  className,
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) => {
  const ctx = useRadioGroupContext()
  const size = normalizeRadioSize(ctx?.size)
  const disabled = Boolean(ctx?.disabled)

  return (
    <p className={cn(radioDescriptionVariants({ size, disabled }), className)}>
      {children}
    </p>
  )
}
RadioDescription.displayName = 'RadioGroup.Description'

// ─── RadioGroup.Item (top-level) ──────────────────────────────────────────────

export interface RadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  id?: string
  label?: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
}

export const RadioItem = React.forwardRef<HTMLInputElement, RadioItemProps>(
  ({ value, id, label, description, disabled: disabledProp, className, children, ...divProps }, ref) => {
    const ctx = useRadioGroupContext()
    const size = normalizeRadioSize(ctx?.size)
    const isDisabled = disabledProp ?? ctx?.disabled ?? false
    const isChecked = ctx?.value !== undefined ? ctx.value === value : undefined
    const generatedId = React.useId()
    const effectiveId = id ?? generatedId

    function handleClick() {
      if (!isDisabled && ctx?.onValueChange) {
        ctx.onValueChange(value)
      }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (!isDisabled && ctx?.onValueChange) {
          ctx.onValueChange(value)
        }
      }
    }

    if (children) {
      return (
        <div className={cn('flex items-start gap-3', className)} {...divProps}>
          <input
            ref={ref}
            type="radio"
            id={effectiveId}
            name={ctx?.name}
            value={value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={handleClick}
            onKeyDown={handleKeyDown}
            className="peer sr-only"
            tabIndex={isChecked ? 0 : -1}
          />
          {children}
        </div>
      )
    }

    return (
      <label
        htmlFor={effectiveId}
        className={cn(
          'group inline-flex min-h-[44px] items-start gap-3 select-none py-1 touch-manipulation',
          isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          className
        )}
        onClick={handleClick}
        {...(divProps as React.LabelHTMLAttributes<HTMLLabelElement>)}
      >
        <div className="relative mt-0.5 flex items-center shrink-0">
          <input
            ref={ref}
            type="radio"
            id={effectiveId}
            name={ctx?.name}
            value={value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={handleClick}
            onKeyDown={handleKeyDown}
            className="peer sr-only"
            tabIndex={isChecked ? 0 : -1}
          />
          <div
            className={cn(
              radioIndicatorVariants({ size, checked: Boolean(isChecked), disabled: isDisabled })
            )}
            aria-hidden="true"
          >
            {isChecked ? <span className={cn(radioDotVariants({ size }))} /> : null}
          </div>
        </div>
        {(label || description) ? (
          <div className="flex flex-col">
            {label ? <RadioLabel>{label}</RadioLabel> : null}
            {description ? <RadioDescription>{description}</RadioDescription> : null}
          </div>
        ) : null}
      </label>
    )
  }
)
RadioItem.displayName = 'RadioGroup.Item'

export { RadioCard, type RadioCardProps } from './radio-card'

