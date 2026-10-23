import {
  createContext,
  useContext,
  Children,
  isValidElement,
  type ReactNode,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type HTMLAttributes,
  type Ref,
} from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { InputSize } from './input-utils'

export const EMPTY_SELECT_VALUE = '__rogym_empty__'
export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
  icon?: ReactNode
  badge?: ReactNode
  searchTerms?: string[]
}

export type SelectOptionProps = {
  children?: ReactNode
  disabled?: boolean
  value?: string | number
}

export interface SelectProps {
  id?: string
  children?: ReactNode
  className?: string
  contentClassName?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onChange?: (value: string) => void
  disabled?: boolean
  required?: boolean
  name?: string
  ariaLabel?: string
  error?: boolean | string
  size?: SelectSize | InputSize
  inputSize?: InputSize
  searchable?: boolean
  options?: SelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  clearable?: boolean
}

export interface SelectOptionElementProps {
  children?: ReactNode
  disabled?: boolean
  value?: string | number
}

export interface SelectTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  children?: ReactNode
  id?: string
  ariaLabel?: string
}

export interface SelectValueProps {
  className?: string
  placeholder?: string
}

export interface SelectContentProps {
  className?: string
  children?: ReactNode
  sideOffset?: number
  align?: 'start' | 'center' | 'end'
}

export interface SelectSearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
  placeholder?: string
  inputRef?: Ref<HTMLInputElement>
}

export interface SelectGroupProps extends HTMLAttributes<HTMLDivElement> {
  label?: string
  children?: ReactNode
  className?: string
}

export interface SelectItemProps {
  value: string
  disabled?: boolean
  children?: ReactNode
  className?: string
  icon?: ReactNode
  badge?: ReactNode
  description?: string
}

export function normalizeSelectSize(size?: string): SelectSize {
  return size === 'sm' || size === 'lg' ? size : 'md'
}

export const selectTriggerVariants = cva(
  [
    'rogym-select relative flex w-full items-center justify-between gap-2 overflow-hidden',
    'border border-line-subtle bg-surface-card text-fg-primary text-left font-body',
    'transition-colors duration-150 outline-hidden cursor-pointer',
    'hover:border-line-strong focus-visible:border-action-accent focus-visible:ring-2 focus-visible:ring-line-accent-subtle/50',
    'disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation',
    'after:content-[""] after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2',
    'after:min-h-[44px] after:min-w-[44px] after:w-full after:h-full sm:after:hidden',
  ],
  {
    variants: {
      size: {
        sm: 'min-h-[36px] py-1.5 px-3 text-xs rounded-lg',
        md: 'min-h-[44px] py-2.5 px-3.5 text-sm rounded-xl',
        lg: 'min-h-[50px] py-3 px-4 text-base rounded-xl',
      },
      hasError: {
        true: 'border-status-danger-border text-status-danger-fg focus-visible:border-status-danger-fg focus-visible:ring-1 focus-visible:ring-status-danger-border',
        false: '',
      },
    },
    defaultVariants: { size: 'md', hasError: false },
  }
)

export type SelectTriggerVariantsProps = VariantProps<typeof selectTriggerVariants>

export const selectContentVariants = cva(
  'z-50 min-w-[8rem] overflow-hidden rounded-xl border border-line-subtle bg-surface-elevated text-fg-primary shadow-lg backdrop-blur-xl duration-150 animate-in fade-in-80',
  {
    variants: {
      searchable: {
        true: 'min-w-[220px] max-w-[95vw] p-2 border-line-accent-subtle bg-surface-card shadow-[0_12px_40px_rgba(0,0,0,0.65)]',
        false: 'p-1',
      },
    },
    defaultVariants: { searchable: false },
  }
)

export const selectItemVariants = cva(
  'relative flex w-full cursor-pointer select-none items-center rounded-lg text-left outline-hidden transition-colors data-disabled:pointer-events-none data-disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'py-1.5 px-2.5 text-xs',
        md: 'py-2 px-3 text-sm',
        lg: 'py-2.5 px-3.5 text-base',
      },
      isSelected: {
        true: 'bg-action-accent/15 text-action-accent font-semibold',
        false: 'text-fg-secondary hover:bg-surface-card-hover hover:text-fg-primary focus:bg-surface-card-hover focus:text-fg-primary',
      },
      disabled: {
        true: 'pointer-events-none opacity-40 cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: { size: 'md', isSelected: false, disabled: false },
  }
)

export interface SelectContextValue {
  value: string
  onSelectValue: (val: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  searchable: boolean
  search: string
  setSearch: (query: string) => void
  disabled: boolean
  required: boolean
  size: SelectSize
  hasError: boolean
  triggerId?: string
  listboxId?: string
  describedBy?: string
  name?: string
  clearable?: boolean
  options: SelectOption[]
  filteredOptions: SelectOption[]
}

export const SelectContext = createContext<SelectContextValue | null>(null)

export function useSelectContext(): SelectContextValue {
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error('Select compound sub-components must be rendered within a <Select> root.')
  }
  return context
}

export function filterOptions(options: SelectOption[], search: string): SelectOption[] {
  if (!search.trim()) return options
  const query = search.toLowerCase().trim()
  return options.filter((opt) => {
    const matchLabel = opt.label.toLowerCase().includes(query)
    const matchDesc = opt.description?.toLowerCase().includes(query)
    const matchTerms = opt.searchTerms?.some((term) => term.toLowerCase().includes(query))
    return Boolean(matchLabel || matchDesc || matchTerms)
  })
}

export function extractTextFromReactNode(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractTextFromReactNode).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractTextFromReactNode(node.props.children)
  }
  return ''
}

export function extractOptionsFromChildren(children: ReactNode): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<SelectOptionElementProps>(child) || child.type !== 'option') return []
    const label = extractTextFromReactNode(child.props.children)
    return [{ value: String(child.props.value ?? ''), label, disabled: child.props.disabled }]
  })
}
