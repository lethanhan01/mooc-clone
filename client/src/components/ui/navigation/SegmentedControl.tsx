import * as React from 'react'
import { ToggleGroup as RadixToggleGroup } from 'radix-ui'
import { cn } from '@/utils'

export interface SegmentedControlOption {
  value: string
  label: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
  count?: number
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  className?: string
  itemClassName?: string
}

const sizeClasses = {
  sm: {
    container: 'p-0.5 rounded-lg text-xs',
    item: 'py-1 px-2.5 text-xs rounded-md gap-1.5',
  },
  md: {
    container: 'p-1 rounded-xl text-sm',
    item: 'py-1.5 px-3.5 text-sm rounded-lg gap-2',
  },
  lg: {
    container: 'p-1.5 rounded-xl text-base',
    item: 'py-2 px-4.5 text-base rounded-lg gap-2.5',
  },
}

export function SegmentedControl({
  options,
  value,
  defaultValue,
  onValueChange,
  size = 'md',
  fullWidth = false,
  disabled = false,
  className,
  itemClassName,
}: Readonly<SegmentedControlProps>) {
  const styles = sizeClasses[size]
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState(
    defaultValue ?? options[0]?.value
  )
  const effectiveValue = isControlled ? value : internalValue

  return (
    <RadixToggleGroup.Root
      type="single"
      value={effectiveValue}
      onValueChange={(val) => {
        // Enforce that SegmentedControl cannot be deselected to empty
        if (val && val !== effectiveValue) {
          if (!isControlled) {
            setInternalValue(val)
          }
          onValueChange?.(val)
        }
      }}
      disabled={disabled}
      className={cn(
        'inline-flex items-center rounded-xl border border-line-subtle bg-surface-card-inset backdrop-blur-md gap-1',
        styles.container,
        fullWidth && 'w-full flex',
        className
      )}
    >

      {options.map((option) => (
        <RadixToggleGroup.Item
          key={option.value}
          value={option.value}
          disabled={option.disabled || disabled}
          className={cn(
            'relative inline-flex items-center justify-center font-medium text-fg-muted transition-all duration-150 select-none cursor-pointer',
            'hover:text-fg-primary hover:bg-surface-card-hover',
            'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring',
            'data-[state=on]:bg-surface-elevated data-[state=on]:text-action-primary data-[state=on]:font-semibold data-[state=on]:border data-[state=on]:border-line-subtle data-[state=on]:shadow-xs',
            'disabled:pointer-events-none disabled:opacity-40',
            // Touch Target Expander >= 44x44px trên mobile
            'after:content-[""] after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2',
            'after:min-h-[44px] after:min-w-[44px] after:w-full after:h-full sm:after:hidden',
            styles.item,
            fullWidth && 'flex-1 min-w-0',
            itemClassName
          )}
        >
          {option.icon && <span className="shrink-0">{option.icon}</span>}
          <span className="truncate">{option.label}</span>
          {option.count !== undefined && (
            <span className="ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold bg-surface-card text-fg-secondary border border-line-subtle data-[state=on]:bg-action-primary/10 data-[state=on]:text-action-primary data-[state=on]:border-action-primary/20">
              {option.count}
            </span>
          )}
        </RadixToggleGroup.Item>
      ))}
    </RadixToggleGroup.Root>
  )
}
