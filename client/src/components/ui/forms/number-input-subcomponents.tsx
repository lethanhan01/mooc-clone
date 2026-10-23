import { forwardRef } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/utils'
import { Button } from '../actions/Button'
import { type InputSize, getInputClasses } from './input-utils'
import {
  numberStepperButtonVariants,
  useNumberInputContext,
  normalizeNumberInputSize,
  getStepperIconSize,
  canDecrement,
  canIncrement,
} from './number-input-utils'

// ─── NumberInput.DecrementButton (top-level) ─────────────────────────────────

export const NumberDecrementButton = ({
  className,
  'aria-label': ariaLabel = 'Giảm giá trị',
}: Readonly<{ className?: string; 'aria-label'?: string }>) => {
  const ctx = useNumberInputContext()
  const size = normalizeNumberInputSize(ctx?.size)
  const isDisabled = (ctx?.disabled ?? false) || !canDecrement(ctx?.value ?? 0, ctx?.min)
  const iconSize = getStepperIconSize(size)

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={ctx?.onDecrement}
      disabled={isDisabled}
      aria-label={ariaLabel}
      className={cn(
        numberStepperButtonVariants({ size }),
        'absolute left-1 z-10 p-0 min-h-0 min-w-0 rounded-lg',
        className
      )}
      tabIndex={-1}
    >
      <Minus size={iconSize} />
    </Button>
  )
}
NumberDecrementButton.displayName = 'NumberInput.DecrementButton'

// ─── NumberInput.IncrementButton (top-level) ─────────────────────────────────

export const NumberIncrementButton = ({
  className,
  'aria-label': ariaLabel = 'Tăng giá trị',
}: Readonly<{ className?: string; 'aria-label'?: string }>) => {
  const ctx = useNumberInputContext()
  const size = normalizeNumberInputSize(ctx?.size)
  const isDisabled = (ctx?.disabled ?? false) || !canIncrement(ctx?.value ?? 0, ctx?.max)
  const iconSize = getStepperIconSize(size)

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={ctx?.onIncrement}
      disabled={isDisabled}
      aria-label={ariaLabel}
      className={cn(
        numberStepperButtonVariants({ size }),
        'absolute right-1 z-10 p-0 min-h-0 min-w-0 rounded-lg',
        className
      )}
      tabIndex={-1}
    >
      <Plus size={iconSize} />
    </Button>
  )
}
NumberIncrementButton.displayName = 'NumberInput.IncrementButton'

// ─── NumberInput.Field (top-level) ────────────────────────────────────────────

export const NumberField = forwardRef<HTMLInputElement, { className?: string }>(
  ({ className }, ref) => {
    const ctx = useNumberInputContext()
    const size = normalizeNumberInputSize(ctx?.size)

    const inputClasses = getInputClasses({
      size: size as InputSize,
      hasError: false,
      fullWidth: true,
      className: cn('text-center font-mono', ctx?.value !== undefined && 'px-9', className),
    })

    return (
      <input
        ref={ref}
        type="number"
        role="spinbutton"
        aria-valuenow={ctx?.value}
        aria-valuemin={ctx?.min}
        aria-valuemax={ctx?.max}
        min={ctx?.min}
        max={ctx?.max}
        step={ctx?.step}
        value={ctx?.value}
        disabled={ctx?.disabled}
        readOnly
        className={inputClasses}
      />
    )
  }
)
NumberField.displayName = 'NumberInput.Field'
