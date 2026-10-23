import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { cn } from '@/utils'
import { useFormField } from './form-field-context'
import {
  type InputSize,
  type InputTone,
  type InputWidth,
  inputContainerVariants,
  inputFieldVariants,
  normalizeInputSize,
  resolveInputWidth,
  resolveAriaLabel,
  resolveDescribedBy,
  resolveInputType,
  InputContext,
} from './input-utils'
import {
  InputLeadingVisual,
  InputTrailingAction,
  InputPasswordToggle,
  InputClearButton,
  InputSpinner,
  InputField,
  ShorthandTrailing,
} from './input-subcomponents'

export type { InputSize, InputTone, InputWidth } from './input-utils'
export {
  InputLeadingVisual,
  InputTrailingAction,
  InputPasswordToggle,
  InputClearButton,
  InputSpinner,
  InputField,
} from './input-subcomponents'

export interface BaseInputProps {
  leftIcon?: ReactNode
  leadingIcon?: ReactNode
  rightIcon?: ReactNode
  trailingIcon?: ReactNode
  error?: boolean | string
  tone?: InputTone
  size?: InputSize
  inputSize?: InputSize
  width?: InputWidth
  fullWidth?: boolean
  mobileFull?: boolean
  showPasswordToggle?: boolean
  clearable?: boolean
  onClear?: () => void
  loading?: boolean
  inputClassName?: string
  containerRef?: Ref<HTMLDivElement>
}

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'width'>,
    BaseInputProps {}

interface InputComponent
  extends React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>> {
  Field: typeof InputField
  LeadingVisual: typeof InputLeadingVisual
  TrailingAction: typeof InputTrailingAction
  PasswordToggle: typeof InputPasswordToggle
  ClearButton: typeof InputClearButton
  Spinner: typeof InputSpinner
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      name,
      className,
      inputClassName,
      containerRef,
      type = 'text',
      leftIcon,
      leadingIcon,
      rightIcon,
      trailingIcon,
      error,
      tone: toneProp,
      size: sizeProp,
      inputSize,
      width: widthProp,
      fullWidth = true,
      mobileFull,
      showPasswordToggle,
      clearable,
      onClear,
      loading,
      disabled,
      required,
      value,
      placeholder,
      children,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalidProp,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const formField = useFormField()

    const resolvedId = id ?? formField?.id
    const resolvedName = name
    const resolvedDisabled = disabled ?? formField?.disabled ?? false
    const resolvedRequired = required ?? formField?.required
    const resolvedError = error ?? formField?.error
    const hasError = Boolean(resolvedError)
    const effectiveSize = normalizeInputSize(sizeProp ?? inputSize)
    const effectiveTone: InputTone = toneProp ?? (hasError ? 'danger' : 'neutral')
    const effectiveWidth = resolveInputWidth(widthProp, mobileFull, fullWidth)
    const resolvedDescribedBy = resolveDescribedBy(ariaDescribedBy, formField)
    const resolvedAriaLabel = resolveAriaLabel(props['aria-label'], resolvedId, placeholder)

    const effectiveLeftIcon = leftIcon ?? leadingIcon
    const effectiveRightIcon = rightIcon ?? trailingIcon
    const isPasswordType = Boolean(type === 'password' && showPasswordToggle)
    const actualType = resolveInputType(type, isPasswordType, showPassword)
    const hasValue = value !== undefined && value !== ''
    const showClearButton = Boolean(clearable && hasValue && !resolvedDisabled && !loading)

    const togglePassword = useCallback(() => {
      setShowPassword((prev) => !prev)
    }, [])

    const contextValue = useMemo(
      () => ({
        size: effectiveSize,
        tone: effectiveTone,
        disabled: resolvedDisabled,
        id: resolvedId,
        name: resolvedName,
        hasError,
        ariaDescribedBy: resolvedDescribedBy,
        ariaInvalid: ariaInvalidProp ?? (hasError ? true : undefined),
        required: resolvedRequired,
        loading,
        showPassword,
        togglePassword,
      }),
      [
        effectiveSize,
        effectiveTone,
        resolvedDisabled,
        resolvedId,
        resolvedName,
        hasError,
        resolvedDescribedBy,
        ariaInvalidProp,
        resolvedRequired,
        loading,
        showPassword,
        togglePassword,
      ]
    )

    const containerClasses = cn(
      inputContainerVariants({
        tone: effectiveTone,
        size: effectiveSize,
        width: effectiveWidth,
        disabled: resolvedDisabled,
      }),
      className
    )

    if (children) {
      return (
        <InputContext.Provider value={contextValue}>
          <div ref={containerRef} className={containerClasses}>
            {children}
          </div>
        </InputContext.Provider>
      )
    }

    return (
      <InputContext.Provider value={contextValue}>
        <div ref={containerRef} className={containerClasses}>
          {effectiveLeftIcon ? <InputLeadingVisual>{effectiveLeftIcon}</InputLeadingVisual> : null}

          <input
            ref={ref}
            id={resolvedId}
            name={resolvedName}
            type={actualType}
            value={value}
            disabled={resolvedDisabled || loading}
            required={resolvedRequired}
            placeholder={placeholder}
            aria-label={resolvedAriaLabel}
            aria-invalid={ariaInvalidProp ?? (hasError ? true : undefined)}
            aria-describedby={resolvedDescribedBy}
            aria-busy={loading ? 'true' : undefined}
            className={cn(inputFieldVariants(), inputClassName)}
            {...props}
          />

          <ShorthandTrailing
            loading={loading}
            isPasswordType={isPasswordType}
            showClearButton={showClearButton}
            onClear={onClear}
            rightIcon={effectiveRightIcon}
          />
        </div>
      </InputContext.Provider>
    )
  }
) as InputComponent

Input.displayName = 'Input'
Input.Field = InputField
Input.LeadingVisual = InputLeadingVisual
Input.TrailingAction = InputTrailingAction
Input.PasswordToggle = InputPasswordToggle
Input.ClearButton = InputClearButton
Input.Spinner = InputSpinner
