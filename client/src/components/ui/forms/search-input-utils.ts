import { createContext, useContext } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { InputSize } from './Input'

// ─── Types ───────────────────────────────────────────────────────────────────

export type SearchInputSize = 'sm' | 'md' | 'lg'

export function normalizeSearchInputSize(size?: SearchInputSize | InputSize): 'sm' | 'md' | 'lg' {
  if (size === 'sm' || size === 'lg') return size
  return 'md'
}

export const SEARCH_ICON_SIZES: Record<SearchInputSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
}

export const CLEAR_ICON_SIZES: Record<SearchInputSize, number> = {
  sm: 13,
  md: 15,
  lg: 16,
}

// ─── CVA Variants ─────────────────────────────────────────────────────────────

/**
 * CVA variants cho wrapper của SearchInput.
 * Hỗ trợ các chế độ width: fullWidth, mobileFull.
 */
export const searchContainerVariants = cva('relative flex items-center', {
  variants: {
    width: {
      auto: 'w-auto',
      full: 'w-full',
      'mobile-full': 'w-full sm:w-auto',
    },
  },
  defaultVariants: {
    width: 'full',
  },
})

export type SearchContainerVariantsProps = VariantProps<typeof searchContainerVariants>

/**
 * CVA variants cho ô nhập liệu SearchInput native.
 * 100% Semantic Tokens: bg-surface-card, border-line-subtle, text-fg-primary, ring-focus-ring.
 * Chuẩn chạm LINE LIFF & WCAG 2.5.8: size 'md' duy trì min-h-[44px].
 */
export const searchFieldVariants = cva(
  [
    'w-full bg-surface-card border rounded-xl text-fg-primary placeholder:text-fg-muted',
    'transition-colors duration-150 outline-hidden font-body',
    'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1 focus-visible:border-action-primary',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-sunken',
  ],
  {
    variants: {
      size: {
        sm: 'min-h-[38px] py-1.5 pl-8.5 pr-8 text-xs',
        md: 'min-h-[44px] py-2.5 pl-10 pr-9 text-sm',
        lg: 'min-h-[50px] py-3.5 pl-11 pr-10 text-base',
      },
      hasError: {
        true: 'border-status-danger-border text-status-danger-fg focus-visible:ring-status-danger-border',
        false: 'border-line-subtle hover:border-line-strong',
      },
    },
    defaultVariants: {
      size: 'md',
      hasError: false,
    },
  }
)

export type SearchFieldVariantsProps = VariantProps<typeof searchFieldVariants>

// ─── Context ──────────────────────────────────────────────────────────────────

export interface SearchInputContextValue {
  value: string
  effectiveSize: SearchInputSize
  disabled: boolean
  loading: boolean
  hasError: boolean
  onChange: (value: string) => void
  onClear: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
}

export const SearchInputContext = createContext<SearchInputContextValue | null>(null)

export function useSearchInputContext(): SearchInputContextValue | null {
  return useContext(SearchInputContext)
}

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

export function resolveSearchAriaLabel(
  explicitAriaLabel?: string,
  placeholder?: string
): string {
  if (explicitAriaLabel) return explicitAriaLabel
  if (placeholder) return placeholder
  return 'Tìm kiếm'
}
