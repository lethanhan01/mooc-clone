import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
import { cn } from '@/utils'
import {
  inputFieldVariants,
  useInputContext,
} from './input-utils'

export const InputLeadingVisual = ({
  className,
  children,
}: Readonly<{ className?: string; children: ReactNode }>) => (
  <div className={cn('flex items-center text-fg-muted shrink-0 pointer-events-none', className)} aria-hidden="true">
    {children}
  </div>
)
InputLeadingVisual.displayName = 'Input.LeadingVisual'

export const InputTrailingAction = ({
  className,
  children,
  onClick,
  'aria-label': ariaLabel,
  disabled,
}: Readonly<{
  className?: string
  children: ReactNode
  onClick?: () => void
  'aria-label'?: string
  disabled?: boolean
}>) => (
  <button
    type="button"
    tabIndex={-1}
    disabled={disabled}
    onClick={onClick}
    aria-label={ariaLabel}
    className={cn(
      'relative flex items-center justify-center p-1 text-fg-muted hover:text-fg-primary rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
      'after:content-[""] after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:min-h-[44px] after:min-w-[44px] after:w-full after:h-full sm:after:hidden touch-manipulation',
      className
    )}
  >
    {children}
  </button>
)
InputTrailingAction.displayName = 'Input.TrailingAction'

export const InputPasswordToggle = ({ className }: Readonly<{ className?: string }>) => {
  const context = useInputContext()
  const showPassword = context?.showPassword ?? false
  return (
    <InputTrailingAction
      className={className}
      onClick={context?.togglePassword}
      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
    >
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </InputTrailingAction>
  )
}
InputPasswordToggle.displayName = 'Input.PasswordToggle'

export const InputClearButton = ({
  className,
  onClick,
}: Readonly<{ className?: string; onClick?: () => void }>) => (
  <InputTrailingAction
    className={className}
    onClick={onClick}
    aria-label="Xóa nội dung"
  >
    <X size={15} />
  </InputTrailingAction>
)
InputClearButton.displayName = 'Input.ClearButton'

export const InputSpinner = ({ className }: Readonly<{ className?: string }>) => (
  <div className={cn('flex items-center justify-center text-fg-muted shrink-0 pointer-events-none', className)} aria-hidden="true">
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  </div>
)
InputSpinner.displayName = 'Input.Spinner'

export const InputField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, id, disabled, required, ...props }, ref) => {
    const context = useInputContext()
    const resolvedDisabled = disabled ?? context?.disabled ?? false
    const resolvedRequired = required ?? context?.required
    const isPassword = type === 'password'
    const actualType = isPassword && context?.showPassword ? 'text' : type

    return (
      <input
        ref={ref}
        id={id ?? context?.id}
        name={context?.name}
        type={actualType}
        disabled={resolvedDisabled || context?.loading}
        required={resolvedRequired}
        aria-invalid={props['aria-invalid'] ?? context?.ariaInvalid}
        aria-describedby={props['aria-describedby'] ?? context?.ariaDescribedBy}
        aria-busy={context?.loading ? 'true' : undefined}
        className={cn(inputFieldVariants(), className)}
        {...props}
      />
    )
  }
)
InputField.displayName = 'Input.Field'

export interface ShorthandTrailingProps {
  loading?: boolean
  isPasswordType: boolean
  showClearButton: boolean
  onClear?: () => void
  rightIcon?: ReactNode
}

export function ShorthandTrailing({
  loading,
  isPasswordType,
  showClearButton,
  onClear,
  rightIcon,
}: Readonly<ShorthandTrailingProps>) {
  if (loading) return <InputSpinner />
  if (isPasswordType) return <InputPasswordToggle />
  if (showClearButton) return <InputClearButton onClick={onClear} />
  if (rightIcon) {
    return (
      <div className="flex items-center text-fg-muted shrink-0">
        {rightIcon}
      </div>
    )
  }
  return null
}
