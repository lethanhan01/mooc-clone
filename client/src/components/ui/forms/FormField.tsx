import {
  forwardRef,
  useId,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '@/utils'
import {
  FormFieldContext,
  type FormFieldContextValue,
} from './form-field-context'


export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode
  required?: boolean
  hint?: ReactNode
  error?: string | null
  id?: string
  htmlFor?: string
  fullWidth?: boolean
  disabled?: boolean
  children: ReactNode
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      required,
      hint,
      error,
      id: customId,
      htmlFor: customHtmlFor,
      fullWidth = true,
      disabled = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const id = customId ?? customHtmlFor ?? generatedId
    const errorId = `${id}-error`
    const hintId = `${id}-hint`
    const hasError = !!error

    const contextValue = useMemo<FormFieldContextValue>(
      () => ({
        id,
        errorId,
        hintId,
        hasError,
        error,
        required,
        disabled,
      }),
      [id, errorId, hintId, hasError, error, required, disabled]
    )

    return (
      <FormFieldContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            'flex flex-col gap-1.5',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        >
          {label && (
            <label
              htmlFor={id}
              className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-fg-secondary select-none"
            >
              <span>{label}</span>
              {required && (
                <span className="text-status-danger-fg font-bold" aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}

          {children}

          {error ? (
            <p
              id={errorId}
              role="alert"
              className="text-xs text-status-danger-fg font-medium animate-in fade-in duration-200"
            >
              {error}
            </p>
          ) : hint ? (
            <p id={hintId} className="text-xs text-fg-dim">
              {hint}
            </p>
          ) : null}
        </div>
      </FormFieldContext.Provider>
    )
  }
)
FormField.displayName = 'FormField'
