import { createContext, useContext } from 'react'

export type AccordionType = 'single' | 'multiple'
export type AccordionVariant = 'card' | 'separated' | 'flush'

export interface AccordionContextValue {
  type: AccordionType
  variant: AccordionVariant
  isExpanded: (value: string) => boolean
  toggleItem: (value: string) => void
  baseId: string
}

export const AccordionContext = createContext<AccordionContextValue | null>(null)

export function useAccordionContext(): AccordionContextValue {
  const ctx = useContext(AccordionContext)
  if (!ctx) {
    throw new Error('Accordion compound components must be used within an <Accordion> provider')
  }
  return ctx
}

export interface AccordionItemContextValue {
  value: string
  disabled?: boolean
  isOpen: boolean
  itemId: string
}

export const AccordionItemContext = createContext<AccordionItemContextValue | null>(null)

export function useAccordionItemContext(): AccordionItemContextValue {
  const ctx = useContext(AccordionItemContext)
  if (!ctx) {
    throw new Error('AccordionTrigger and AccordionContent must be used within an <AccordionItem>')
  }
  return ctx
}

export function getNextMultipleValue(currentValue: string | string[], itemValue: string): string[] {
  const arr = Array.isArray(currentValue) ? [...currentValue] : []
  const index = arr.indexOf(itemValue)
  if (index > -1) {
    return arr.filter((v) => v !== itemValue)
  }
  return [...arr, itemValue]
}

export function getNextSingleValue(
  currentValue: string | string[],
  itemValue: string,
  collapsible?: boolean
): string | null {
  if (currentValue === itemValue) {
    return collapsible ? '' : null
  }
  return itemValue
}

export const ITEM_VARIANT_CLASSES: Record<AccordionVariant, string> = {
  card: 'rounded-2xl border border-line-accent-subtle bg-surface-card overflow-hidden transition-all duration-200 shadow-xs',
  separated: 'rounded-xl border border-line-subtle bg-surface-sunken overflow-hidden transition-all duration-200',
  flush: 'border-b border-line-subtle transition-all duration-200 first:border-t',
}
