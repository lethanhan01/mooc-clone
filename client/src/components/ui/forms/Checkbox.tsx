import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { cn } from '@/utils'
import { useFormField } from './form-field-context'
import {
  type CheckboxSize,
  normalizeCheckboxSize,
  resolveCheckboxAriaLabel,
  resolveCheckboxDescribedBy,
  CheckboxContext,
} from './checkbox-utils'
import {
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxDescription,
  CheckboxError,
} from './checkbox-subcomponents'

export type { CheckboxSize } from './checkbox-utils'
export {
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxDescription,
  CheckboxError,
} from './checkbox-subcomponents'

export interface BaseCheckboxProps {
  label?: ReactNode
  description?: ReactNode
  error?: boolean | string
  checkboxSize?: CheckboxSize
  size?: CheckboxSize
  indeterminate?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>,
    BaseCheckboxProps {}

interface CheckboxComponent
  extends React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>> {
  Indicator: typeof CheckboxIndicator
  Label: typeof CheckboxLabel
  Description: typeof CheckboxDescription
  Error: typeof CheckboxError
}

function CheckboxTextContent({
  label,
  description,
  error,
}: {
  label?: ReactNode
  description?: ReactNode
  error?: string
}) {
  if (!label && !description && !error) return null

  return (
    <div className="flex flex-col select-none">
      {label ? <CheckboxLabel>{label}</CheckboxLabel> : null}
      {description ? <CheckboxDescription>{description}</CheckboxDescription> : null}
      {error ? <CheckboxError>{error}</CheckboxError> : null}
    </div>
  )
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      name,
      className,
      label,
      description,
      error,
      checkboxSize,
      size,
      checked: controlledChecked,
      defaultChecked = false,
      indeterminate = false,
      disabled,
      required,
      onChange,
      onCheckedChange,
      children,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalidProp,
      ...props
    },
    ref
  ) => {
    const formField = useFormField()
    const innerRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(ref, () => innerRef.current!)

    const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked)
    const isChecked = controlledChecked ?? uncontrolledChecked

    const resolvedId = id ?? formField?.id
    const resolvedName = name
    const resolvedDisabled = disabled ?? formField?.disabled ?? false
    const resolvedRequired = required ?? formField?.required
    const hasError = Boolean(error || formField?.error)
    const localError = typeof error === 'string' ? error : undefined
    const effectiveSize = normalizeCheckboxSize(size ?? checkboxSize)

    const resolvedDescribedBy = resolveCheckboxDescribedBy(ariaDescribedBy, formField)
    const resolvedAriaLabel = resolveCheckboxAriaLabel(props['aria-label'], resolvedId, label)

    useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = indeterminate
      }
    }, [indeterminate])

    const contextValue = useMemo(
      () => ({
        checked: isChecked,
        indeterminate,
        disabled: resolvedDisabled,
        hasError,
        size: effectiveSize,
        id: resolvedId,
        name: resolvedName,
        required: resolvedRequired,
        error: localError ?? (typeof formField?.error === 'string' ? formField.error : null),
      }),
      [
        isChecked,
        indeterminate,
        resolvedDisabled,
        hasError,
        effectiveSize,
        resolvedId,
        resolvedName,
        resolvedRequired,
        localError,
        formField?.error,
      ]
    )

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      if (controlledChecked === undefined) {
        setUncontrolledChecked(e.target.checked)
      }
      onChange?.(e)
      onCheckedChange?.(e.target.checked)
    }

    if (children) {
      return (
        <CheckboxContext.Provider value={contextValue}>
          <label
            htmlFor={resolvedId}
            className={cn(
              'group inline-flex min-h-[44px] items-start gap-3 select-none py-2 touch-manipulation',
              resolvedDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
              className
            )}
          >
            <input
              ref={innerRef}
              id={resolvedId}
              name={resolvedName}
              type="checkbox"
              checked={isChecked}
              disabled={resolvedDisabled}
              required={resolvedRequired}
              aria-invalid={ariaInvalidProp ?? (hasError ? true : undefined)}
              aria-describedby={resolvedDescribedBy}
              aria-label={resolvedAriaLabel}
              onChange={handleChange}
              className="peer sr-only"
              {...props}
            />
            {children}
          </label>
        </CheckboxContext.Provider>
      )
    }

    return (
      <CheckboxContext.Provider value={contextValue}>
        <label
          htmlFor={resolvedId}
          className={cn(
            'group inline-flex min-h-[44px] items-start gap-3 select-none py-2 touch-manipulation',
            resolvedDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            className
          )}
        >
          <div className="relative mt-0.5 flex items-center shrink-0">
            <input
              ref={innerRef}
              id={resolvedId}
              name={resolvedName}
              type="checkbox"
              checked={isChecked}
              disabled={resolvedDisabled}
              required={resolvedRequired}
              aria-invalid={ariaInvalidProp ?? (hasError ? true : undefined)}
              aria-describedby={resolvedDescribedBy}
              aria-label={resolvedAriaLabel}
              onChange={handleChange}
              className="peer sr-only"
              {...props}
            />
            <CheckboxIndicator />
          </div>

          <CheckboxTextContent
            label={label}
            description={description}
            error={localError}
          />
        </label>
      </CheckboxContext.Provider>
    )
  }
) as CheckboxComponent

Checkbox.displayName = 'Checkbox'
Checkbox.Indicator = CheckboxIndicator
Checkbox.Label = CheckboxLabel
Checkbox.Description = CheckboxDescription
Checkbox.Error = CheckboxError
