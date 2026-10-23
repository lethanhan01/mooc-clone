import {
  forwardRef,
  useCallback,
  useId,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '@/utils'
import {
  AccordionContext,
  getNextMultipleValue,
  getNextSingleValue,
  type AccordionContextValue,
  type AccordionType,
  type AccordionVariant,
} from './accordion-utils'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  type AccordionContentProps,
  type AccordionItemProps,
  type AccordionTriggerProps,
} from './accordion-subcomponents'

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  type?: AccordionType
  variant?: AccordionVariant
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  collapsible?: boolean
  className?: string
  children?: ReactNode
}

export type AccordionComponent = React.ForwardRefExoticComponent<
  AccordionProps & React.RefAttributes<HTMLDivElement>
> & {
  Item: typeof AccordionItem
  Trigger: typeof AccordionTrigger
  Content: typeof AccordionContent
  Group: typeof AccordionGroup
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      type = 'single',
      variant = 'card',
      value: controlledValue,
      defaultValue,
      onValueChange,
      collapsible = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseId = useId()
    const [uncontrolledValue, setUncontrolledValue] = useState<string | string[]>(() => {
      if (defaultValue !== undefined) return defaultValue
      return type === 'multiple' ? [] : ''
    })

    const isControlled = controlledValue !== undefined
    const currentValue = isControlled ? controlledValue : uncontrolledValue

    const isExpanded = useCallback(
      (itemValue: string): boolean => {
        if (type === 'multiple') {
          return Array.isArray(currentValue) && currentValue.includes(itemValue)
        }
        return currentValue === itemValue
      },
      [type, currentValue]
    )

    const toggleItem = useCallback(
      (itemValue: string) => {
        if (type === 'multiple') {
          const nextArr = getNextMultipleValue(currentValue, itemValue)
          if (!isControlled) setUncontrolledValue(nextArr)
          onValueChange?.(nextArr)
          return
        }

        const nextVal = getNextSingleValue(currentValue, itemValue, collapsible)
        if (nextVal === null) return
        if (!isControlled) setUncontrolledValue(nextVal)
        onValueChange?.(nextVal)
      },
      [type, currentValue, isControlled, collapsible, onValueChange]
    )

    const accordionContextValue = useMemo<AccordionContextValue>(
      () => ({
        type,
        variant,
        isExpanded,
        toggleItem,
        baseId,
      }),
      [type, variant, isExpanded, toggleItem, baseId]
    )

    return (
      <AccordionContext.Provider value={accordionContextValue}>
        <div
          ref={ref}
          data-accordion-root
          className={cn('w-full space-y-2.5', className)}
          {...props}
        >
          {children}
        </div>
      </AccordionContext.Provider>
    )
  }
) as AccordionComponent

Accordion.displayName = 'Accordion'

// ── Data-driven helper: AccordionGroup ──
export interface AccordionGroupItem {
  value: string
  title: ReactNode
  content: ReactNode
  icon?: ReactNode
  badge?: ReactNode
  disabled?: boolean
}

export interface AccordionGroupProps extends Omit<AccordionProps, 'children'> {
  items: AccordionGroupItem[]
}

export const AccordionGroup = forwardRef<HTMLDivElement, AccordionGroupProps>(
  (
    {
      items,
      type = 'single',
      variant = 'card',
      value,
      defaultValue,
      onValueChange,
      collapsible = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Accordion
        ref={ref}
        type={type}
        variant={variant}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        collapsible={collapsible}
        className={className}
        {...props}
      >
        {items.map((item) => (
          <AccordionItem key={item.value} value={item.value} disabled={item.disabled}>
            <AccordionTrigger leftIcon={item.icon} badge={item.badge}>
              {item.title}
            </AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )
  }
)
AccordionGroup.displayName = 'AccordionGroup'

// ── Compound attachments ──
Accordion.Item = AccordionItem
Accordion.Trigger = AccordionTrigger
Accordion.Content = AccordionContent
Accordion.Group = AccordionGroup

// ── Re-exports for 100% backward compatibility ──
export {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  type AccordionItemProps,
  type AccordionTriggerProps,
  type AccordionContentProps,
}
export {
  useAccordionContext,
  useAccordionItemContext,
  type AccordionType,
  type AccordionVariant,
  type AccordionContextValue,
  type AccordionItemContextValue,
} from './accordion-utils'
