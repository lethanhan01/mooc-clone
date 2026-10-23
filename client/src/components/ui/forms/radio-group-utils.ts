import { createContext, useContext, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

// ─── Types ───────────────────────────────────────────────────────────────────

export type RadioSize = 'sm' | 'md' | 'lg'
export type RadioOrientation = 'vertical' | 'horizontal'

// ─── CVA Variants ─────────────────────────────────────────────────────────────

/**
 * Vòng tròn chỉ báo radio (outer ring).
 * Touch expander after:min-h-[44px] đảm bảo vùng chạm >= 44px theo WCAG 2.5.8 & LINE LIFF.
 * peer-focus-visible:ring-focus-ring đảm bảo focus ring chuẩn khi radio item có focus.
 */
export const radioIndicatorVariants = cva(
  [
    'relative flex items-center justify-center shrink-0 rounded-full border transition-all duration-150',
    'peer-focus-visible:ring-2 peer-focus-visible:ring-focus-ring peer-focus-visible:ring-offset-1',
    "after:content-[''] after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2",
    'after:min-h-[44px] after:min-w-[44px] after:w-full after:h-full sm:after:hidden',
  ],
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
      checked: {
        true: 'border-action-primary text-action-primary bg-action-primary/10',
        false: 'border-line-subtle bg-surface-card hover:border-line-strong',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed bg-surface-sunken',
        false: 'cursor-pointer',
      },
    },
    defaultVariants: {
      size: 'md',
      checked: false,
      disabled: false,
    },
  }
)

/** Dấu chấm lõi bên trong radio indicator */
export const radioDotVariants = cva(
  'rounded-full bg-action-primary transition-all duration-150',
  {
    variants: {
      size: {
        sm: 'h-1.5 w-1.5',
        md: 'h-2 w-2',
        lg: 'h-2.5 w-2.5',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

export const radioLabelVariants = cva('select-none transition-colors duration-150', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
    disabled: {
      true: 'text-fg-disabled cursor-not-allowed',
      false: 'text-fg-primary cursor-pointer',
    },
  },
  defaultVariants: { size: 'md', disabled: false },
})

export const radioDescriptionVariants = cva('select-none', {
  variants: {
    size: {
      sm: 'text-[11px]',
      md: 'text-xs',
      lg: 'text-sm',
    },
    disabled: {
      true: 'text-fg-disabled',
      false: 'text-fg-secondary',
    },
  },
  defaultVariants: { size: 'md', disabled: false },
})

export type RadioIndicatorVariantsProps = VariantProps<typeof radioIndicatorVariants>

// ─── Context ──────────────────────────────────────────────────────────────────

export interface RadioGroupContextValue {
  name: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  size: RadioSize
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

export function useRadioGroupContext(): RadioGroupContextValue | null {
  return useContext(RadioGroupContext)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function normalizeRadioSize(size?: RadioSize): 'sm' | 'md' | 'lg' {
  if (size === 'sm' || size === 'lg') return size
  return 'md'
}

export function resolveRadioAriaLabel(
  explicitLabel?: string,
  resolvedId?: string,
  labelNode?: ReactNode
): string | undefined {
  if (explicitLabel) return explicitLabel
  if (resolvedId) return undefined
  if (typeof labelNode === 'string') return labelNode
  return 'Lựa chọn'
}
