import { type ReactNode } from 'react'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/utils'
import {
  checkboxBoxVariants,
  useCheckboxContext,
} from './checkbox-utils'

export const CheckboxIndicator = ({
  className,
}: Readonly<{ className?: string }>) => {
  const context = useCheckboxContext()
  const isChecked = Boolean(context?.checked)
  const isIndeterminate = Boolean(context?.indeterminate)
  const size = context?.size ?? 'md'

  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14

  return (
    <div
      className={cn(
        'relative',
        checkboxBoxVariants({
          size,
          checked: isChecked || isIndeterminate,
          hasError: context?.hasError,
          disabled: context?.disabled,
        }),
        'after:content-[""] after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:min-h-[44px] after:min-w-[44px] after:w-full after:h-full sm:after:hidden',
        className
      )}
      aria-hidden="true"
    >
      {isIndeterminate ? (
        <Minus size={iconSize} strokeWidth={3} />
      ) : isChecked ? (
        <Check size={iconSize} strokeWidth={3} />
      ) : null}
    </div>
  )
}
CheckboxIndicator.displayName = 'Checkbox.Indicator'

export const CheckboxLabel = ({
  className,
  children,
}: Readonly<{ className?: string; children: ReactNode }>) => (
  <span
    className={cn(
      'text-sm font-medium text-fg-primary group-hover:text-fg-secondary transition-colors',
      className
    )}
  >
    {children}
  </span>
)
CheckboxLabel.displayName = 'Checkbox.Label'

export const CheckboxDescription = ({
  className,
  children,
}: Readonly<{ className?: string; children: ReactNode }>) => (
  <span className={cn('text-xs text-fg-dim mt-0.5', className)}>
    {children}
  </span>
)
CheckboxDescription.displayName = 'Checkbox.Description'

export const CheckboxError = ({
  className,
  children,
}: Readonly<{ className?: string; children?: ReactNode }>) => {
  const context = useCheckboxContext()
  const text = children ?? (typeof context?.error === 'string' ? context.error : undefined)
  if (!text) return null
  return (
    <span className={cn('text-xs text-status-danger-fg mt-1', className)}>
      {text}
    </span>
  )
}
CheckboxError.displayName = 'Checkbox.Error'
