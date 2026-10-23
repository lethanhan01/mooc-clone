import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useMemo,
  useState,
} from 'react'
import { cn } from '@/utils'
import { useFormField } from './form-field-context'
import {
  type SwitchSize,
  normalizeSwitchSize,
  resolveSwitchAriaLabel,
  resolveSwitchDescribedBy,
  SwitchContext,
} from './switch-utils'
import {
  SwitchControl,
  SwitchThumb,
  SwitchLabel,
  SwitchDescription,
} from './switch-subcomponents'

export type { SwitchSize } from './switch-utils'
export {
  SwitchControl,
  SwitchThumb,
  SwitchLabel,
  SwitchDescription,
} from './switch-subcomponents'

export interface BaseSwitchProps {
  label?: ReactNode
  description?: ReactNode
  switchSize?: SwitchSize
  size?: SwitchSize
  loading?: boolean
  error?: boolean | string
  onCheckedChange?: (checked: boolean) => void
}

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>,
    BaseSwitchProps {}

interface SwitchComponent
  extends React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLInputElement>> {
  Control: typeof SwitchControl
  Thumb: typeof SwitchThumb
  Label: typeof SwitchLabel
  Description: typeof SwitchDescription
}

function SwitchTextContent({
  label,
  description,
}: {
  label?: ReactNode
  description?: ReactNode
}) {
  if (!label && !description) return null

  return (
    <div className="flex flex-col select-none">
      {label ? <SwitchLabel>{label}</SwitchLabel> : null}
      {description ? <SwitchDescription>{description}</SwitchDescription> : null}
    </div>
  )
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      id,
      name,
      className,
      label,
      description,
      checked: controlledChecked,
      defaultChecked = false,
      disabled,
      required,
      onChange,
      onCheckedChange,
      switchSize,
      size,
      loading,
      error,
      children,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalidProp,
      ...props
    },
    ref
  ) => {
    const formField = useFormField()
    const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked)
    const isChecked = controlledChecked ?? uncontrolledChecked

    const resolvedId = id ?? formField?.id
    const resolvedName = name
    const resolvedDisabled = Boolean(disabled ?? formField?.disabled ?? loading)
    const resolvedRequired = required ?? formField?.required
    const resolvedError = error ?? formField?.error
    const hasError = Boolean(resolvedError)
    const effectiveSize = normalizeSwitchSize(size ?? switchSize)

    const resolvedDescribedBy = resolveSwitchDescribedBy(ariaDescribedBy, formField)
    const resolvedAriaLabel = resolveSwitchAriaLabel(props['aria-label'], resolvedId, label)

    const contextValue = useMemo(
      () => ({
        checked: isChecked,
        disabled: resolvedDisabled,
        loading,
        size: effectiveSize,
        id: resolvedId,
        name: resolvedName,
        required: resolvedRequired,
      }),
      [isChecked, resolvedDisabled, loading, effectiveSize, resolvedId, resolvedName, resolvedRequired]
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
        <SwitchContext.Provider value={contextValue}>
          <label
            htmlFor={resolvedId}
            className={cn(
              'group inline-flex min-h-[44px] items-center gap-3 select-none py-2 touch-manipulation',
              resolvedDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
              className
            )}
          >
            <input
              ref={ref}
              id={resolvedId}
              name={resolvedName}
              type="checkbox"
              role="switch"
              checked={isChecked}
              disabled={resolvedDisabled}
              required={resolvedRequired}
              aria-checked={isChecked}
              aria-busy={loading ? 'true' : undefined}
              aria-invalid={ariaInvalidProp ?? (hasError ? true : undefined)}
              aria-describedby={resolvedDescribedBy}
              aria-label={resolvedAriaLabel}
              onChange={handleChange}
              className="peer sr-only"
              {...props}
            />
            {children}
          </label>
        </SwitchContext.Provider>
      )
    }

    return (
      <SwitchContext.Provider value={contextValue}>
        <label
          htmlFor={resolvedId}
          className={cn(
            'group inline-flex min-h-[44px] items-center gap-3 select-none py-2 touch-manipulation',
            resolvedDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            className
          )}
        >
          <div className="relative flex items-center shrink-0">
            <input
              ref={ref}
              id={resolvedId}
              name={resolvedName}
              type="checkbox"
              role="switch"
              checked={isChecked}
              disabled={resolvedDisabled}
              required={resolvedRequired}
              aria-checked={isChecked}
              aria-busy={loading ? 'true' : undefined}
              aria-invalid={ariaInvalidProp ?? (hasError ? true : undefined)}
              aria-describedby={resolvedDescribedBy}
              aria-label={resolvedAriaLabel}
              onChange={handleChange}
              className="peer sr-only"
              {...props}
            />
            <SwitchControl />
          </div>

          <SwitchTextContent label={label} description={description} />
        </label>
      </SwitchContext.Provider>
    )
  }
) as SwitchComponent

Switch.displayName = 'Switch'
Switch.Control = SwitchControl
Switch.Thumb = SwitchThumb
Switch.Label = SwitchLabel
Switch.Description = SwitchDescription
