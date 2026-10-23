import { createContext, useContext } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils'

export type InputSize = 'sm' | 'md' | 'lg' | 'default'
export type InputTone = 'neutral' | 'danger'
export type InputWidth = 'auto' | 'full' | 'mobile-full'

export function normalizeInputSize(size: InputSize = 'md'): 'sm' | 'md' | 'lg' {
  if (size === 'sm' || size === 'lg') return size
  return 'md'
}

export function resolveInputWidth(
  widthProp?: InputWidth,
  mobileFull?: boolean,
  fullWidth: boolean = true
): InputWidth {
  if (widthProp) return widthProp
  if (mobileFull) return 'mobile-full'
  if (!fullWidth) return 'auto'
  return 'full'
}

export function resolveAriaLabel(
  explicitLabel?: string,
  resolvedId?: string,
  placeholder?: string | number
): string | undefined {
  if (explicitLabel) return explicitLabel
  if (resolvedId) return undefined
  if (placeholder) return String(placeholder)
  return 'Nhập thông tin'
}

export function resolveDescribedBy(
  ariaDescribedBy?: string,
  formField?: { hasError?: boolean; errorId?: string; hintId?: string } | null
): string | undefined {
  const fieldDesc = formField?.hasError ? formField.errorId : formField?.hintId
  return [ariaDescribedBy, fieldDesc].filter(Boolean).join(' ') || undefined
}

export function resolveInputType(
  type: string = 'text',
  isPasswordType: boolean = false,
  showPassword: boolean = false
): string {
  if (isPasswordType && showPassword) return 'text'
  return type
}

// Giữ h-11 min-h-[44px] cho size 'md' theo chuẩn chạm LINE LIFF WCAG 2.5.8.
// Tuyệt đối KHÔNG gắn class 'select-none' trên container để đảm bảo người dùng bôi đen văn bản tự nhiên.
export const inputContainerVariants = cva(
  'relative flex items-center transition-all duration-150 bg-surface-card border rounded-xl text-fg-primary focus-within:ring-2 focus-within:ring-offset-1',
  {
    variants: {
      tone: {
        neutral:
          'border-line-subtle focus-within:border-action-primary focus-within:ring-focus-ring',
        danger:
          'border-status-danger-border text-status-danger-fg focus-within:ring-status-danger-border',
      },
      size: {
        sm: 'h-9 px-2.5 text-xs gap-1.5 min-h-[36px]',
        md: 'h-11 px-3.5 text-sm gap-2.5 min-h-[44px]',
        lg: 'h-12 px-4 text-base gap-3 min-h-[48px]',
      },
      width: {
        auto: 'w-auto inline-flex',
        full: 'w-full flex',
        'mobile-full': 'w-full sm:w-auto flex sm:inline-flex',
      },
      disabled: {
        true: 'opacity-50 pointer-events-none bg-surface-sunken cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      tone: 'neutral',
      size: 'md',
      width: 'full',
      disabled: false,
    },
  }
)

export const inputFieldVariants = cva(
  'w-full bg-transparent border-0 p-0 text-inherit placeholder:text-fg-muted outline-hidden focus:outline-hidden disabled:cursor-not-allowed font-body'
)

export interface InputContextValue {
  size: 'sm' | 'md' | 'lg'
  tone: InputTone
  disabled: boolean
  id?: string
  name?: string
  hasError: boolean
  ariaDescribedBy?: string
  ariaInvalid?: boolean | 'true' | 'false' | 'grammar' | 'spelling'
  required?: boolean
  loading?: boolean
  showPassword?: boolean
  togglePassword?: () => void
}

export const InputContext = createContext<InputContextValue | null>(null)

export function useInputContext(): InputContextValue | null {
  return useContext(InputContext)
}

// Legacy variants & helper preserved for backward compatibility
export const inputVariants = cva(
  'rogym-input block font-body transition-colors duration-200 outline-hidden bg-surface-card text-fg-primary border border-line-subtle rounded-xl focus:border-action-accent focus:bg-action-accent-soft focus:ring-2 focus:ring-line-accent-subtle/50 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-fg-disabled',
  {
    variants: {
      size: {
        sm: 'min-h-[36px] py-1.5 px-3 text-xs rounded-lg',
        md: 'min-h-[44px] py-2.5 px-3.5 text-sm rounded-xl',
        lg: 'min-h-[50px] py-3 px-4 text-base rounded-xl',
      },
      hasError: {
        true: 'border-status-danger-border text-status-danger-fg focus:border-status-danger-fg focus:ring-1 focus:ring-status-danger-border',
        false: '',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
      mobileFull: {
        true: 'w-full sm:w-auto',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      hasError: false,
      fullWidth: true,
      mobileFull: false,
    },
  }
)

export type InputVariantsProps = VariantProps<typeof inputContainerVariants>

export function getInputClasses({
  inputSize,
  size = 'md',
  hasLeftIcon,
  hasRightIcon,
  hasError,
  fullWidth = true,
  mobileFull,
  disabled,
  className,
}: {
  inputSize?: InputSize
  size?: InputSize
  hasLeftIcon?: boolean
  hasRightIcon?: boolean
  hasError?: boolean
  fullWidth?: boolean
  mobileFull?: boolean
  disabled?: boolean
  className?: string
}): string {
  const effectiveSize = normalizeInputSize(size ?? inputSize)
  const cvaClass = inputVariants({
    size: effectiveSize,
    hasError: Boolean(hasError),
    fullWidth: Boolean(fullWidth),
    mobileFull: Boolean(mobileFull),
  })

  return cn(
    cvaClass,
    hasLeftIcon && 'pl-10',
    hasRightIcon && 'pr-10',
    disabled && 'cursor-not-allowed opacity-50',
    className
  )
}
