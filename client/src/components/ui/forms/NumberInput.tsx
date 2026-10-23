import {
  forwardRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useMemo,
} from 'react'
import { cn } from '@/utils'
import { useFormField } from './form-field-context'
import { type InputSize, getInputClasses } from './input-utils'
import {
  type NumberInputSize,
  numberInputWrapperVariants,
  NumberInputContext,
  normalizeNumberInputSize,
  clampNumber,
} from './number-input-utils'
import {
  NumberDecrementButton,
  NumberIncrementButton,
  NumberField,
} from './number-input-subcomponents'

export type { NumberInputSize } from './number-input-utils'
export {
  NumberDecrementButton,
  NumberIncrementButton,
  NumberField,
} from './number-input-subcomponents'

// ─── NumberInput Root (main component) ───────────────────────────────────────

export interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size'> {
  value?: number | string
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  size?: NumberInputSize
  /** @deprecated Use `size` instead */
  inputSize?: InputSize
  showSteppers?: boolean
  fullWidth?: boolean
  error?: boolean | string
  children?: ReactNode
}

interface NumberInputComponent
  extends React.ForwardRefExoticComponent<NumberInputProps & React.RefAttributes<HTMLInputElement>> {
  DecrementButton: typeof NumberDecrementButton
  Field: typeof NumberField
  IncrementButton: typeof NumberIncrementButton
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      id: idProp,
      className,
      value = 0,
      onChange,
      min,
      max,
      step = 1,
      size,
      inputSize: legacyInputSize,
      showSteppers = true,
      fullWidth = true,
      error: errorProp,
      disabled,
      placeholder,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalidProp,
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const formField = useFormField()

    const effectiveId = idProp ?? formField?.id ?? generatedId
    const effectiveError = errorProp ?? formField?.error
    const isInvalid = Boolean(effectiveError || ariaInvalidProp)
    const legacySize = legacyInputSize as NumberInputSize | undefined
    const effectiveSize = normalizeNumberInputSize(size ?? legacySize ?? 'md')

    const numericValue =
      typeof value === 'number' ? value : Number.parseFloat(String(value)) || 0

    function handleIncrement() {
      if (disabled) return
      onChange?.(clampNumber(numericValue + step, min, max))
    }

    function handleDecrement() {
      if (disabled) return
      onChange?.(clampNumber(numericValue - step, min, max))
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value
      if (raw === '' || raw === '-') {
        onChange?.(0)
        return
      }
      const parsed = Number.parseFloat(raw)
      if (!Number.isNaN(parsed)) {
        onChange?.(clampNumber(parsed, min, max))
      }
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
      if (disabled) return
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        handleIncrement()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleDecrement()
      }
    }

    const contextValue = useMemo(
      () => ({
        value: numericValue,
        min,
        max,
        step,
        disabled: Boolean(disabled),
        size: effectiveSize,
        onIncrement: handleIncrement,
        onDecrement: handleDecrement,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [numericValue, min, max, step, disabled, effectiveSize]
    )

    const inputClasses = getInputClasses({
      size: effectiveSize as InputSize,
      hasError: isInvalid,
      fullWidth: true,
      className: cn('text-center font-mono', showSteppers && 'px-9', className),
    })

    // ── Compound API (children mode) ──────────────────────────────────────────
    if (children) {
      return (
        <NumberInputContext.Provider value={contextValue}>
          <div className={cn(numberInputWrapperVariants({ fullWidth }))}>
            {children}
          </div>
        </NumberInputContext.Provider>
      )
    }

    // ── Shorthand API ─────────────────────────────────────────────────────────
    return (
      <NumberInputContext.Provider value={contextValue}>
        <div className={cn(numberInputWrapperVariants({ fullWidth }))}>
          {showSteppers ? <NumberDecrementButton /> : null}

          <input
            {...props}
            ref={ref}
            id={effectiveId}
            type="number"
            role="spinbutton"
            aria-valuenow={numericValue}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-invalid={isInvalid}
            aria-describedby={ariaDescribedBy ?? formField?.errorId}
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={inputClasses}
          />

          {showSteppers ? <NumberIncrementButton /> : null}
        </div>
      </NumberInputContext.Provider>
    )
  }
) as NumberInputComponent

NumberInput.displayName = 'NumberInput'
NumberInput.DecrementButton = NumberDecrementButton
NumberInput.Field = NumberField
NumberInput.IncrementButton = NumberIncrementButton
