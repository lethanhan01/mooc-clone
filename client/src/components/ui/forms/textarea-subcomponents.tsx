import {
  forwardRef,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '@/utils'
import {
  textareaVariants,
  useTextareaContext,
} from './textarea-utils'

export const TextareaCounter = ({
  className,
  max,
}: Readonly<{ className?: string; max?: number }>) => {
  const context = useTextareaContext()
  const effectiveMax = max ?? context?.maxLength
  if (effectiveMax === undefined) return null

  return (
    <div
      className={cn('text-right text-xs text-fg-muted mt-1 select-none font-mono', className)}
      aria-live="polite"
    >
      {context?.charCount ?? 0} / {effectiveMax}
    </div>
  )
}
TextareaCounter.displayName = 'Textarea.Counter'

export const TextareaHelperText = ({
  className,
  children,
}: Readonly<{ className?: string; children: ReactNode }>) => {
  const context = useTextareaContext()
  const text = children ?? (context?.hasError ? undefined : context?.ariaDescribedBy)
  if (!text) return null
  return (
    <p
      className={cn(
        'text-xs mt-1 transition-colors',
        context?.hasError ? 'text-status-danger-fg' : 'text-fg-secondary',
        className
      )}
    >
      {text}
    </p>
  )
}
TextareaHelperText.displayName = 'Textarea.HelperText'

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, id, disabled, required, onChange, ...props }, ref) => {
    const context = useTextareaContext()
    const resolvedDisabled = disabled ?? context?.disabled ?? false
    const resolvedRequired = required ?? context?.required

    return (
      <textarea
        ref={ref}
        id={id ?? context?.id}
        name={context?.name}
        disabled={resolvedDisabled}
        required={resolvedRequired}
        aria-invalid={props['aria-invalid'] ?? context?.ariaInvalid}
        aria-describedby={props['aria-describedby'] ?? context?.ariaDescribedBy}
        onChange={onChange}
        className={cn(
          textareaVariants({
            tone: context?.tone,
            size: context?.size,
          }),
          className
        )}
        {...props}
      />
    )
  }
)
TextareaField.displayName = 'Textarea.Field'
