import { createContext, useContext, type ReactNode } from 'react'
import { cva } from 'class-variance-authority'

export type SwitchSize = 'sm' | 'md' | 'lg'

export function normalizeSwitchSize(size: SwitchSize = 'md'): 'sm' | 'md' | 'lg' {
  if (size === 'sm' || size === 'lg') return size
  return 'md'
}

export function resolveSwitchAriaLabel(
  explicitLabel?: string,
  resolvedId?: string,
  labelNode?: ReactNode
): string | undefined {
  if (explicitLabel) return explicitLabel
  if (resolvedId) return undefined
  if (typeof labelNode === 'string') return labelNode
  return 'Bật tắt'
}

export function resolveSwitchDescribedBy(
  ariaDescribedBy?: string,
  formField?: { hasError?: boolean; errorId?: string; hintId?: string } | null
): string | undefined {
  const parts = [
    ariaDescribedBy,
    formField?.hasError ? formField.errorId : formField?.hintId,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : undefined
}

export const switchTrackVariants = cva(
  'rounded-full border transition-all duration-200 shrink-0 touch-manipulation flex items-center peer-focus-visible:ring-2 peer-focus-visible:ring-focus-ring peer-focus-visible:ring-offset-1 select-none',
  {
    variants: {
      size: {
        sm: 'h-5 w-9 p-0.5',
        md: 'h-6 w-11 p-0.5',
        lg: 'h-7 w-13 p-0.5',
      },
      checked: {
        true: 'border-action-primary bg-action-primary shadow-xs',
        false: 'border-line-default bg-surface-sunken',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50 pointer-events-none',
        false: 'active:scale-95 cursor-pointer',
      },
    },
    defaultVariants: {
      size: 'md',
      checked: false,
      disabled: false,
    },
  }
)

export const switchThumbVariants = cva(
  'rounded-full bg-fg-on-solid transition-transform duration-200 flex items-center justify-center shadow-xs',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-5.5 w-5.5',
      },
      checked: {
        true: 'bg-surface-base',
        false: 'bg-fg-on-solid',
      },
    },
    defaultVariants: {
      size: 'md',
      checked: false,
    },
  }
)

export function resolveThumbTranslate(size: 'sm' | 'md' | 'lg', checked: boolean): string {
  if (!checked) return 'translate-x-0'
  if (size === 'sm') return 'translate-x-4'
  if (size === 'lg') return 'translate-x-6'
  return 'translate-x-5'
}

export interface SwitchContextValue {
  checked: boolean
  disabled: boolean
  loading?: boolean
  size: SwitchSize
  id?: string
  name?: string
  required?: boolean
}

export const SwitchContext = createContext<SwitchContextValue | null>(null)

export function useSwitchContext(): SwitchContextValue | null {
  return useContext(SwitchContext)
}

// Legacy helper preserved for 100% backward compatibility
export function getSwitchClasses({
  checked,
  disabled,
  switchSize = 'md',
}: {
  checked?: boolean
  disabled?: boolean
  switchSize?: SwitchSize
}) {
  const effectiveSize = normalizeSwitchSize(switchSize)
  return switchTrackVariants({
    size: effectiveSize,
    checked: Boolean(checked),
    disabled: Boolean(disabled),
  })
}
