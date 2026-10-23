import {
  type ClipboardEvent, type KeyboardEvent, type ReactNode,
  forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState,
} from 'react'
import { cn } from '@/utils'
import { useFormField } from './form-field-context'
import {
  type OtpInputSize, otpSlotVariants, otpSeparatorVariants,
  OtpInputContext, useOtpInputContext,
  normalizeOtpInputSize, sanitizeOtpDigits, resolveSlotAriaLabel,
} from './otp-input-utils'

export type { OtpInputSize } from './otp-input-utils'

// ─── OtpInput.Slot (top-level sub-component) ─────────────────────────────────

export interface OtpSlotProps {
  index: number
  className?: string
}

export const OtpSlot = ({ index, className }: Readonly<OtpSlotProps>) => {
  const ctx = useOtpInputContext()
  const digit = ctx?.value[index] ?? ''
  const isFilled = Boolean(digit)
  const size = normalizeOtpInputSize(ctx?.size)

  return (
    <li className="inline-flex list-none">
      <input
        id={`${ctx?.id}-${index}`}
        ref={(el) => ctx?.registerRef(index, el)}
        aria-label={resolveSlotAriaLabel(index, ctx?.length ?? 6)}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete={index === 0 ? 'one-time-code' : 'off'}
        maxLength={1}
        value={digit}
        disabled={ctx?.disabled}
        onChange={(e) => ctx?.onDigitChange(index, e.target.value)}
        onKeyDown={(e) => ctx?.onKeyDown(index, e)}
        onPaste={ctx?.onPaste}
        onFocus={(e) => e.currentTarget.select()}
        className={cn(
          otpSlotVariants({
            size,
            filled: isFilled,
            hasError: ctx?.hasError,
            disabled: ctx?.disabled,
          }),
          className
        )}
      />
    </li>
  )
}
OtpSlot.displayName = 'OtpInput.Slot'

// ─── OtpInput.Separator (top-level sub-component) ────────────────────────────

export interface OtpSeparatorProps {
  children?: ReactNode
  className?: string
}

export const OtpSeparator = ({ children = '–', className }: Readonly<OtpSeparatorProps>) => {
  return (
    <li aria-hidden="true" className="inline-flex list-none items-center justify-center">
      <span role="separator" aria-hidden="true" className={cn(otpSeparatorVariants(), className)}>
        {children}
      </span>
    </li>
  )
}
OtpSeparator.displayName = 'OtpInput.Separator'

// ─── OtpInput Root Component ─────────────────────────────────────────────────

export interface OtpInputProps {
  value: string[]
  onChange: (value: string[]) => void
  length?: number
  size?: OtpInputSize
  disabled?: boolean
  autoFocus?: boolean
  className?: string
  id?: string
  error?: boolean | string
  children?: ReactNode
  'aria-label'?: string
}

export interface OtpInputRef {
  focus: (index?: number) => void
  clear: () => void
}

interface OtpInputComponent
  extends React.ForwardRefExoticComponent<OtpInputProps & React.RefAttributes<OtpInputRef>> {
  Slot: typeof OtpSlot
  Separator: typeof OtpSeparator
}

export const OtpInput = forwardRef<OtpInputRef, OtpInputProps>(
  (
    {
      value,
      onChange,
      length = 6,
      size = 'md',
      disabled = false,
      autoFocus = false,
      className,
      id: idProp,
      error,
      children,
      'aria-label': ariaLabel = 'Mã xác thực một lần (OTP)',
    },
    ref
  ) => {
    const formField = useFormField()
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const [activeFocusIndex, setActiveFocusIndex] = useState(0)

    const effectiveId = idProp ?? formField?.id ?? 'otp-input'
    const effectiveDisabled = disabled || Boolean(formField?.disabled)
    const hasError = Boolean(error || formField?.error)
    const effectiveSize = normalizeOtpInputSize(size)

    useImperativeHandle(ref, () => ({
      focus: (index = 0) => {
        inputRefs.current[index]?.focus()
      },
      clear: () => {
        onChange(new Array(length).fill(''))
        inputRefs.current[0]?.focus()
      },
    }))

    useEffect(() => {
      if (autoFocus && !effectiveDisabled) {
        inputRefs.current[0]?.focus()
      }
    }, [autoFocus, effectiveDisabled])

    function handleDigitChange(index: number, input: string) {
      if (effectiveDisabled) return
      const digit = input.replace(/\D/g, '').slice(-1)
      const next = [...value]
      while (next.length < length) next.push('')
      next[index] = digit
      onChange(next)

      if (digit && index < length - 1) {
        setActiveFocusIndex(index + 1)
        inputRefs.current[index + 1]?.focus()
      }
    }

    function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
      if (effectiveDisabled) return

      if (event.key === 'Backspace') {
        if (value[index]) {
          const next = [...value]
          next[index] = ''
          onChange(next)
        } else if (index > 0) {
          setActiveFocusIndex(index - 1)
          inputRefs.current[index - 1]?.focus()
        }
      } else if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault()
        setActiveFocusIndex(index - 1)
        inputRefs.current[index - 1]?.focus()
      } else if (event.key === 'ArrowRight' && index < length - 1) {
        event.preventDefault()
        setActiveFocusIndex(index + 1)
        inputRefs.current[index + 1]?.focus()
      }
    }

    function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
      if (effectiveDisabled) return
      event.preventDefault()
      const rawText = event.clipboardData.getData('text')
      const sanitized = sanitizeOtpDigits(rawText, length)
      if (sanitized.every((d) => d === '')) return

      onChange(sanitized)
      const digitsCount = rawText.replace(/\D/g, '').length
      const targetFocusIndex = Math.min(digitsCount, length - 1)
      setActiveFocusIndex(targetFocusIndex)
      inputRefs.current[targetFocusIndex]?.focus()
    }

    function registerRef(index: number, el: HTMLInputElement | null) {
      inputRefs.current[index] = el
    }

    const contextValue = useMemo(
      () => ({
        value,
        length,
        disabled: effectiveDisabled,
        hasError,
        size: effectiveSize,
        id: effectiveId,
        activeFocusIndex,
        onDigitChange: handleDigitChange,
        onKeyDown: handleKeyDown,
        onPaste: handlePaste,
        registerRef,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [value, length, effectiveDisabled, hasError, effectiveSize, effectiveId, activeFocusIndex]
    )

    const content = children ?? (
      Array.from({ length }, (_, i) => (
        <OtpSlot key={`${effectiveId}-slot-${i}`} index={i} />
      ))
    )

    return (
      <OtpInputContext.Provider value={contextValue}>
        <fieldset
          aria-label={ariaLabel}
          className={cn('m-0 min-w-0 border-0 p-0', className)}
        >
          <legend className="sr-only">{ariaLabel}</legend>
          <ol className="m-0 flex list-none items-center justify-center gap-2.5 p-0">
            {content}
          </ol>
        </fieldset>
      </OtpInputContext.Provider>
    )
  }
) as OtpInputComponent

OtpInput.displayName = 'OtpInput'
OtpInput.Slot = OtpSlot
OtpInput.Separator = OtpSeparator
