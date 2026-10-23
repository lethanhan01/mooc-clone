import { createContext, useContext } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

// ─── Types ───────────────────────────────────────────────────────────────────

export type NumberInputSize = 'sm' | 'md' | 'lg'

// ─── CVA Variants ─────────────────────────────────────────────────────────────

/**
 * Nút stepper (tăng/giảm) cho NumberInput.
 * Touch expander after:min-h-[44px] đảm bảo vùng chạm >= 44px theo WCAG 2.5.8 & LINE LIFF.
 * Dùng relative + absolute để touch target không làm dịch layout.
 */
export const numberStepperButtonVariants = cva(
  [
    'relative flex items-center justify-center shrink-0 text-fg-secondary hover:text-fg-primary',
    'bg-surface-sunken hover:bg-surface-elevated active:bg-surface-card transition-colors duration-150',
    'disabled:opacity-40 disabled:pointer-events-none cursor-pointer rounded-lg',
    "after:content-[''] after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2",
    'after:min-h-[44px] after:min-w-[44px] after:w-full after:h-full sm:after:hidden',
  ],
  {
    variants: {
      size: {
        sm: 'h-7 w-7 text-xs',
        md: 'h-8 w-8 text-sm',
        lg: 'h-9 w-9 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

/** Container ngoài bao bọc toàn bộ NumberInput */
export const numberInputWrapperVariants = cva('relative inline-flex items-center rounded-xl', {
  variants: {
    fullWidth: {
      true: 'w-full',
      false: 'w-auto',
    },
  },
  defaultVariants: { fullWidth: true },
})

export type NumberStepperButtonVariantsProps = VariantProps<typeof numberStepperButtonVariants>

// ─── Context ──────────────────────────────────────────────────────────────────

export interface NumberInputContextValue {
  value: number
  min?: number
  max?: number
  step: number
  disabled: boolean
  size: NumberInputSize
  onIncrement: () => void
  onDecrement: () => void
}

export const NumberInputContext = createContext<NumberInputContextValue | null>(null)

export function useNumberInputContext(): NumberInputContextValue | null {
  return useContext(NumberInputContext)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function normalizeNumberInputSize(size?: NumberInputSize): 'sm' | 'md' | 'lg' {
  if (size === 'sm' || size === 'lg') return size
  return 'md'
}

export function clampNumber(value: number, min?: number, max?: number): number {
  let result = value
  if (min !== undefined && result < min) result = min
  if (max !== undefined && result > max) result = max
  return result
}

/** Kiểm tra xem có thể giảm tiếp không (để disable nút trừ) */
export function canDecrement(value: number, min?: number): boolean {
  return min === undefined || value > min
}

/** Kiểm tra xem có thể tăng tiếp không (để disable nút cộng) */
export function canIncrement(value: number, max?: number): boolean {
  return max === undefined || value < max
}

export function getStepperIconSize(size?: NumberInputSize): number {
  if (size === 'sm') return 12
  if (size === 'lg') return 16
  return 14
}

