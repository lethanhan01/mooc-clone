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
  TabsContext,
  type TabsContextValue,
  type TabsSize,
  type TabsVariant,
} from './tabs-utils'
import {
  TabsContent,
  TabsList,
  TabsTrigger,
  type TabsContentProps,
  type TabsListProps,
  type TabsTriggerProps,
} from './tabs-subcomponents'

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  variant?: TabsVariant
  size?: TabsSize
  className?: string
  children?: ReactNode
}

export type TabsComponent = React.ForwardRefExoticComponent<
  TabsProps & React.RefAttributes<HTMLDivElement>
> & {
  List: typeof TabsList
  Trigger: typeof TabsTrigger
  Content: typeof TabsContent
  Bar: typeof TabsBar
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      value: controlledValue,
      defaultValue = '',
      onValueChange,
      variant = 'pills',
      size = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
    const baseId = useId()
    const isControlled = controlledValue !== undefined
    const currentValue = isControlled ? controlledValue : uncontrolledValue

    const handleValueChange = useCallback(
      (val: string) => {
        if (!isControlled) {
          setUncontrolledValue(val)
        }
        onValueChange?.(val)
      },
      [isControlled, onValueChange]
    )

    const tabsContextValue = useMemo<TabsContextValue>(
      () => ({
        value: currentValue,
        onValueChange: handleValueChange,
        variant,
        size,
        baseId,
      }),
      [currentValue, handleValueChange, variant, size, baseId]
    )

    return (
      <TabsContext.Provider value={tabsContextValue}>
        <div ref={ref} className={cn('w-full', className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
) as TabsComponent

Tabs.displayName = 'Tabs'

// ── Data-driven helper: TabsBar ──
export interface TabItem {
  value: string
  label: ReactNode
  icon?: ReactNode
  badge?: ReactNode
  disabled?: boolean
}

export interface TabsBarProps extends Omit<TabsProps, 'children' | 'onChange'> {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  listClassName?: string
  'aria-label'?: string
}

export const TabsBar = forwardRef<HTMLDivElement, TabsBarProps>(
  (
    {
      items,
      value,
      onChange,
      variant = 'pills',
      size = 'md',
      className,
      listClassName,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    return (
      <Tabs
        ref={ref}
        value={value}
        onValueChange={onChange}
        variant={variant}
        size={size}
        className={className}
        {...props}
      >
        <TabsList className={listClassName} aria-label={ariaLabel}>
          {items.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              leftIcon={item.icon}
              badge={item.badge}
              disabled={item.disabled}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    )
  }
)
TabsBar.displayName = 'TabsBar'

// ── Compound attachments ──
Tabs.List = TabsList
Tabs.Trigger = TabsTrigger
Tabs.Content = TabsContent
Tabs.Bar = TabsBar

// ── Re-exports for 100% backward compatibility ──
export {
  TabsList,
  TabsTrigger,
  TabsContent,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentProps,
}
export {
  useTabsContext,
  type TabsVariant,
  type TabsSize,
  type TabsContextValue,
} from './tabs-utils'
