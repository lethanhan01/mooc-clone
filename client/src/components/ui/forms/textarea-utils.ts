import { createContext, useContext } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils'

export type TextareaSize = 'sm' | 'md' | 'lg'
export type TextareaTone = 'neutral' | 'danger'
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both'
export type TextareaWidth = 'auto' | 'full'

export function resolveTextareaWidth(
  widthProp?: TextareaWidth,
  fullWidth: boolean = true,
  mobileFull?: boolean
): TextareaWidth {
  if (widthProp) return widthProp
  if (fullWidth || mobileFull) return 'full'
  return 'auto'
}

export function resolveTextareaAriaLabel(
  explicitLabel?: string,
  resolvedId?: string,
  placeholder?: string | number
): string | undefined {
  if (explicitLabel) return explicitLabel
  if (resolvedId) return undefined
  if (placeholder) return String(placeholder)
  return 'Nhập thông tin'
}

export function resolveTextareaDescribedBy(
  ariaDescribedBy?: string,
  formField?: { hasError?: boolean; errorId?: string; hintId?: string } | null
): string | undefined {
  const fieldDesc = formField?.hasError ? formField.errorId : formField?.hintId
  return [ariaDescribedBy, fieldDesc].filter(Boolean).join(' ') || undefined
}

export const textareaVariants = cva(
  'w-full bg-surface-card border rounded-xl text-fg-primary placeholder:text-fg-muted transition-all duration-150 outline-hidden focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-sunken font-body',
  {
    variants: {
      tone: {
        neutral:
          'border-line-subtle focus-visible:border-action-primary focus-visible:ring-focus-ring',
        danger:
          'border-status-danger-border text-status-danger-fg focus-visible:ring-status-danger-border',
      },
      size: {
        sm: 'p-2.5 text-xs min-h-[64px]',
        md: 'p-3.5 text-sm min-h-[96px]',
        lg: 'p-4 text-base min-h-[128px]',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
      width: {
        auto: 'w-auto',
        full: 'w-full',
      },
    },
    defaultVariants: {
      tone: 'neutral',
      size: 'md',
      resize: 'vertical',
      width: 'full',
    },
  }
)

export interface TextareaContextValue {
  size: TextareaSize
  tone: TextareaTone
  disabled: boolean
  hasError: boolean
  id?: string
  name?: string
  ariaDescribedBy?: string
  ariaInvalid?: boolean | 'true' | 'false' | 'grammar' | 'spelling'
  required?: boolean
  charCount: number
  maxLength?: number
}

export const TextareaContext = createContext<TextareaContextValue | null>(null)

export function useTextareaContext(): TextareaContextValue | null {
  return useContext(TextareaContext)
}

// Legacy variants & helper preserved for backward compatibility
export const legacyTextareaVariants = cva(
  'rogym-input block font-body transition-colors duration-200 resize-y min-h-[96px] py-2.5 px-3.5 text-sm leading-relaxed touch-manipulation outline-hidden bg-surface-card text-fg-primary border border-line-subtle rounded-xl focus:border-action-accent focus:bg-action-accent-soft focus:ring-2 focus:ring-line-accent-subtle/50 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-fg-disabled',
  {
    variants: {
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
      hasError: false,
      fullWidth: true,
      mobileFull: false,
    },
  }
)

export type TextareaVariantsProps = VariantProps<typeof textareaVariants>

export function getTextareaClasses({
  hasError,
  fullWidth = true,
  mobileFull,
  disabled,
  className,
}: {
  hasError?: boolean
  fullWidth?: boolean
  mobileFull?: boolean
  disabled?: boolean
  className?: string
}): string {
  const cvaClass = legacyTextareaVariants({
    hasError: Boolean(hasError),
    fullWidth: Boolean(fullWidth),
    mobileFull: Boolean(mobileFull),
  })

  return cn(
    cvaClass,
    disabled && 'cursor-not-allowed opacity-50',
    className
  )
}
