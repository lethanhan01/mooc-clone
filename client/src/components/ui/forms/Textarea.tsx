import {
  forwardRef,
  type TextareaHTMLAttributes,
  useMemo,
  useState,
} from 'react'
import { cn } from '@/utils'
import { useFormField } from './form-field-context'
import {
  type TextareaResize,
  type TextareaSize,
  type TextareaTone,
  type TextareaWidth,
  textareaVariants,
  resolveTextareaWidth,
  resolveTextareaAriaLabel,
  resolveTextareaDescribedBy,
  TextareaContext,
} from './textarea-utils'
import {
  TextareaField,
  TextareaCounter,
  TextareaHelperText,
} from './textarea-subcomponents'

export type { TextareaResize, TextareaSize, TextareaTone, TextareaWidth } from './textarea-utils'
export {
  TextareaField,
  TextareaCounter,
  TextareaHelperText,
} from './textarea-subcomponents'

export interface BaseTextareaProps {
  error?: boolean | string
  tone?: TextareaTone
  size?: TextareaSize
  resize?: TextareaResize
  width?: TextareaWidth
  fullWidth?: boolean
  mobileFull?: boolean
  showCount?: boolean
  maxLength?: number
}

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseTextareaProps {}

interface TextareaComponent
  extends React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>> {
  Field: typeof TextareaField
  Counter: typeof TextareaCounter
  HelperText: typeof TextareaHelperText
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      name,
      className,
      error,
      tone: toneProp,
      size = 'md',
      resize = 'vertical',
      width: widthProp,
      fullWidth = true,
      mobileFull,
      disabled,
      required,
      rows = 3,
      showCount,
      maxLength,
      value,
      defaultValue,
      onChange,
      placeholder,
      children,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalidProp,
      ...props
    },
    ref
  ) => {
    const formField = useFormField()
    const [innerCount, setInnerCount] = useState<number>(() => {
      if (typeof value === 'string') return value.length
      if (typeof defaultValue === 'string') return defaultValue.length
      return 0
    })

    const resolvedId = id ?? formField?.id
    const resolvedName = name
    const resolvedDisabled = disabled ?? formField?.disabled ?? false
    const resolvedRequired = required ?? formField?.required
    const resolvedError = error ?? formField?.error
    const hasError = Boolean(resolvedError)
    const effectiveTone: TextareaTone = toneProp ?? (hasError ? 'danger' : 'neutral')
    const effectiveWidth = resolveTextareaWidth(widthProp, fullWidth, mobileFull)
    const resolvedDescribedBy = resolveTextareaDescribedBy(ariaDescribedBy, formField)
    const resolvedAriaLabel = resolveTextareaAriaLabel(props['aria-label'], resolvedId, placeholder)
    const currentLength = typeof value === 'string' ? value.length : innerCount

    const contextValue = useMemo(
      () => ({
        size,
        tone: effectiveTone,
        disabled: resolvedDisabled,
        hasError,
        id: resolvedId,
        name: resolvedName,
        ariaDescribedBy: resolvedDescribedBy,
        ariaInvalid: ariaInvalidProp ?? (hasError ? true : undefined),
        required: resolvedRequired,
        charCount: currentLength,
        maxLength,
      }),
      [
        size,
        effectiveTone,
        resolvedDisabled,
        hasError,
        resolvedId,
        resolvedName,
        resolvedDescribedBy,
        ariaInvalidProp,
        resolvedRequired,
        currentLength,
        maxLength,
      ]
    )

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
      if (value === undefined) {
        setInnerCount(e.target.value.length)
      }
      onChange?.(e)
    }

    if (children) {
      return (
        <TextareaContext.Provider value={contextValue}>
          <div className={cn(effectiveWidth === 'full' ? 'w-full' : 'w-auto', className)}>
            {children}
          </div>
        </TextareaContext.Provider>
      )
    }

    const textareaClasses = cn(
      textareaVariants({
        tone: effectiveTone,
        size,
        resize,
        width: effectiveWidth,
      }),
      mobileFull && 'w-full sm:w-auto',
      className
    )

    return (
      <TextareaContext.Provider value={contextValue}>
        <div className={cn(effectiveWidth === 'full' ? 'w-full' : 'w-auto')}>
          <textarea
            ref={ref}
            id={resolvedId}
            name={resolvedName}
            rows={rows}
            value={value}
            defaultValue={defaultValue}
            maxLength={maxLength}
            disabled={resolvedDisabled}
            required={resolvedRequired}
            placeholder={placeholder}
            aria-label={resolvedAriaLabel}
            aria-invalid={ariaInvalidProp ?? (hasError ? true : undefined)}
            aria-describedby={resolvedDescribedBy}
            onChange={handleChange}
            className={textareaClasses}
            {...props}
          />
          {showCount && maxLength !== undefined ? (
            <TextareaCounter max={maxLength} />
          ) : null}
        </div>
      </TextareaContext.Provider>
    )
  }
) as TextareaComponent

Textarea.displayName = 'Textarea'
Textarea.Field = TextareaField
Textarea.Counter = TextareaCounter
Textarea.HelperText = TextareaHelperText
