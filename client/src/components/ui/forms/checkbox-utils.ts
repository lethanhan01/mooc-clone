import { createContext, useContext, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

export type CheckboxSize = 'sm' | 'md' | 'lg'
export type CheckboxTone = 'neutral' | 'danger'

export function normalizeCheckboxSize(size: CheckboxSize = 'md'): 'sm' | 'md' | 'lg' {
  if (size === 'sm' || size === 'lg') return size
  return 'md'
}

export function resolveCheckboxAriaLabel(
  explicitLabel?: string,
  resolvedId?: string,
  labelNode?: ReactNode
): string | undefined {
  if (explicitLabel) return explicitLabel
  if (resolvedId) return undefined
  if (typeof labelNode === 'string') return labelNode
  return 'Lựa chọn'
}

export function resolveCheckboxDescribedBy(
  ariaDescribedBy?: string,
  formField?: { hasError?: boolean; errorId?: string; hintId?: string } | null
): string | undefined {
  const parts = [
    ariaDescribedBy,
    formField?.hasError ? formField.errorId : formField?.hintId,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : undefined
}

export const checkboxBoxVariants = cva(
  'flex items-center justify-center border transition-all duration-150 shrink-0 touch-manipulation select-none peer-focus-visible:ring-2 peer-focus-visible:ring-focus-ring peer-focus-visible:ring-offset-1',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 rounded-sm text-xs',
        md: 'h-5 w-5 rounded-md text-sm',
        lg: 'h-6 w-6 rounded-md text-base',
      },
      checked: {
        true: 'border-action-primary bg-action-primary text-action-primary-fg shadow-xs',
        false: 'border-line-default bg-surface-sunken hover:border-line-hover text-transparent',
      },
      hasError: {
        true: 'border-status-danger-border ring-1 ring-status-danger-border',
        false: '',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50 bg-surface-sunken pointer-events-none',
        false: 'active:scale-95 cursor-pointer',
      },
    },
    defaultVariants: {
      size: 'md',
      checked: false,
      hasError: false,
      disabled: false,
    },
  }
)

export type CheckboxBoxVariantsProps = VariantProps<typeof checkboxBoxVariants>

export interface CheckboxContextValue {
  checked: boolean
  indeterminate?: boolean
  disabled: boolean
  hasError: boolean
  size: CheckboxSize
  id?: string
  name?: string
  required?: boolean
  error?: string | null
}

export const CheckboxContext = createContext<CheckboxContextValue | null>(null)

export function useCheckboxContext(): CheckboxContextValue | null {
  return useContext(CheckboxContext)
}

// Legacy helper preserved for 100% backward compatibility
export function getCheckboxClasses({
  checked,
  disabled,
  hasError,
  checkboxSize = 'md',
}: {
  checked?: boolean
  disabled?: boolean
  hasError?: boolean
  checkboxSize?: CheckboxSize
}): string {
  const effectiveSize = normalizeCheckboxSize(checkboxSize)
  return checkboxBoxVariants({
    size: effectiveSize,
    checked: Boolean(checked),
    hasError: Boolean(hasError),
    disabled: Boolean(disabled),
  })
}
