import { createContext, useContext } from 'react'

export type TabsVariant = 'pills' | 'segmented' | 'underline'
export type TabsSize = 'sm' | 'md' | 'lg'

export interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
  variant: TabsVariant
  size: TabsSize
  baseId: string
}

export const TabsContext = createContext<TabsContextValue | null>(null)

export function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext)
  if (!ctx) {
    throw new Error('Tabs compound components must be used within a <Tabs> provider')
  }
  return ctx
}

export const LIST_VARIANT_CLASSES: Record<TabsVariant, string> = {
  pills:
    'flex items-center gap-1.5 p-1 bg-surface-sunken border border-line-subtle rounded-2xl overflow-x-auto no-scrollbar',
  segmented:
    'inline-flex items-center p-1 bg-surface-card border border-line-accent-subtle rounded-xl overflow-x-auto no-scrollbar',
  underline: 'flex items-center gap-6 border-b border-line-subtle overflow-x-auto no-scrollbar',
}

export const SIZE_CLASSES: Record<TabsSize, Record<TabsVariant, string>> = {
  sm: {
    pills: 'px-3 py-1.5 text-xs font-semibold rounded-xl min-h-[32px]',
    segmented: 'px-2.5 py-1 text-xs font-semibold rounded-lg min-h-[30px]',
    underline: 'pb-2.5 text-xs font-semibold min-h-[32px]',
  },
  md: {
    pills: 'px-4 py-2 text-sm font-semibold rounded-xl min-h-[40px]',
    segmented: 'px-3.5 py-1.5 text-sm font-semibold rounded-lg min-h-[36px]',
    underline: 'pb-3 text-sm font-semibold min-h-[38px]',
  },
  lg: {
    pills: 'px-5 py-2.5 text-base font-semibold rounded-xl min-h-[46px]',
    segmented: 'px-4.5 py-2 text-base font-semibold rounded-xl min-h-[42px]',
    underline: 'pb-3.5 text-base font-semibold min-h-[44px]',
  },
}
