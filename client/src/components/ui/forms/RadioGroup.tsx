import * as React from 'react'
import { cn } from '@/utils'
import {
  type RadioSize,
  type RadioOrientation,
  RadioGroupContext,
} from './radio-group-utils'
import {
  RadioIndicator,
  RadioLabel,
  RadioDescription,
  RadioItem,
  RadioCard,
} from './radio-group-subcomponents'

export type { RadioSize, RadioOrientation } from './radio-group-utils'
export { useRadioGroupContext } from './radio-group-utils'
export {
  RadioIndicator,
  RadioLabel,
  RadioDescription,
  RadioItem,
  RadioCard,
} from './radio-group-subcomponents'
export type {
  RadioItemProps,
  RadioCardProps,
} from './radio-group-subcomponents'

// ─── RadioGroup.Root (main component) ────────────────────────────────────────

export interface RadioGroupProps {
  name?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  size?: RadioSize
  orientation?: RadioOrientation
  className?: string
  children?: React.ReactNode
  'aria-label'?: string
  'aria-labelledby'?: string
}

interface RadioGroupComponent
  extends React.ForwardRefExoticComponent<RadioGroupProps & React.RefAttributes<HTMLDivElement>> {
  Item: typeof RadioItem
  Indicator: typeof RadioIndicator
  Label: typeof RadioLabel
  Description: typeof RadioDescription
  Card: typeof RadioCard
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      value,
      defaultValue,
      onValueChange,
      disabled = false,
      size = 'md',
      orientation = 'vertical',
      className,
      children,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...props
    },
    ref
  ) => {
    const generatedName = React.useId()
    const effectiveName = name ?? generatedName
    const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue)
    const effectiveValue = value ?? internalValue

    function handleValueChange(val: string) {
      if (value === undefined) setInternalValue(val)
      onValueChange?.(val)
    }

    return (
      <RadioGroupContext.Provider
        value={{ name: effectiveName, value: effectiveValue, defaultValue, onValueChange: handleValueChange, disabled, size }}
      >
        <div
          ref={ref}
          role="radiogroup"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={cn(
            'flex',
            orientation === 'vertical' ? 'flex-col gap-2' : 'flex-row flex-wrap gap-4',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
) as RadioGroupComponent

RadioGroup.displayName = 'RadioGroup'

// ─── Attach sub-components ───────────────────────────────────────────────────

RadioGroup.Item = RadioItem
RadioGroup.Indicator = RadioIndicator
RadioGroup.Label = RadioLabel
RadioGroup.Description = RadioDescription
RadioGroup.Card = RadioCard
