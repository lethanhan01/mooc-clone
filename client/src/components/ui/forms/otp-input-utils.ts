import { createContext, useContext } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

// ─── Types ───────────────────────────────────────────────────────────────────

export type OtpInputSize = 'sm' | 'md' | 'lg'

export function normalizeOtpInputSize(size?: OtpInputSize): 'sm' | 'md' | 'lg' {
  if (size === 'sm' || size === 'lg') return size
  return 'md'
}

// ─── CVA Variants ─────────────────────────────────────────────────────────────

/**
 * CVA variants cho từng ô nhập liệu OTP Slot.
 * Touch target expander >= 44x44px trên thiết bị cảm ứng (LINE LIFF & WCAG 2.5.8).
 * 100% Semantic Design Tokens: bg-surface-*, border-line-*, focus-visible:ring-focus-ring.
 */
export const otpSlotVariants = cva(
  [
    'relative flex items-center justify-center shrink-0 rounded-xl border-[1.5px] text-center font-bold text-fg-primary outline-hidden transition-all duration-150',
    'focus-visible:ring-2 focus-visible:ring-offset-1',
    "after:content-[''] after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2",
    'after:min-h-[44px] after:min-w-[44px] after:w-full after:h-full sm:after:hidden',
  ],
  {
    variants: {
      size: {
        sm: 'h-10 w-9 text-base',
        md: 'h-13 w-11 text-lg',
        lg: 'h-14 w-12 text-xl',
      },
      filled: {
        true: 'border-line-default bg-surface-elevated',
        false: 'border-line-subtle bg-surface-sunken',
      },
      hasError: {
        true: 'border-status-danger-border text-status-danger-fg focus-visible:border-status-danger-border focus-visible:ring-status-danger-border',
        false: 'focus-visible:border-action-primary focus-visible:ring-focus-ring',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50 bg-surface-sunken pointer-events-none',
        false: 'cursor-text',
      },
    },
    defaultVariants: {
      size: 'md',
      filled: false,
      hasError: false,
      disabled: false,
    },
  }
)

export type OtpSlotVariantsProps = VariantProps<typeof otpSlotVariants>

/** CVA variants cho dấu gạch ngang phân cách giữa các cụm OTP */
export const otpSeparatorVariants = cva(
  'flex items-center justify-center text-fg-muted font-bold select-none text-base mx-0.5'
)

// ─── Context ──────────────────────────────────────────────────────────────────

export interface OtpInputContextValue {
  value: string[]
  length: number
  disabled: boolean
  hasError: boolean
  size: OtpInputSize
  id: string
  activeFocusIndex: number
  onDigitChange: (index: number, digit: string) => void
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void
  registerRef: (index: number, el: HTMLInputElement | null) => void
}

export const OtpInputContext = createContext<OtpInputContextValue | null>(null)

export function useOtpInputContext(): OtpInputContextValue | null {
  return useContext(OtpInputContext)
}

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

export function sanitizeOtpDigits(raw: string, length: number): string[] {
  const digits = raw.replace(/\D/g, '').slice(0, length)
  const result = new Array(length).fill('')
  for (let i = 0; i < digits.length; i++) {
    result[i] = digits[i]
  }
  return result
}

export function resolveSlotAriaLabel(index: number, length: number): string {
  return `OTP digit ${index + 1} of ${length}`
}
