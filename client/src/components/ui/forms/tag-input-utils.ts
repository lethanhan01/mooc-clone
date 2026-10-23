import { createContext, useContext } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ChipTone } from '../data-display/Chip'

// ─── Types ───────────────────────────────────────────────────────────────────

export type TagInputSize = 'sm' | 'md' | 'lg'

export function normalizeTagInputSize(size?: TagInputSize): 'sm' | 'md' | 'lg' {
  if (size === 'sm' || size === 'lg') return size
  return 'md'
}

// ─── CVA Variants ─────────────────────────────────────────────────────────────

/**
 * CVA variants cho Container ngoài bao bọc toàn bộ TagInput.
 * Đảm bảo độ cao tối thiểu min-h-[44px] theo WCAG 2.5.8 & LINE LIFF.
 * 100% Semantic Design Tokens: bg-surface-card, border-line-subtle, focus-within:ring-focus-ring.
 */
export const tagInputWrapperVariants = cva(
  [
    'relative flex min-h-[44px] w-full flex-wrap items-center gap-1.5 rounded-xl border p-2 text-sm transition-colors duration-150',
    'bg-surface-card text-fg-primary',
  ],
  {
    variants: {
      hasError: {
        true: 'border-status-danger-border focus-within:border-status-danger-fg focus-within:ring-1 focus-within:ring-status-danger-border',
        false: 'border-line-subtle hover:border-line-strong focus-within:border-action-primary focus-within:ring-2 focus-within:ring-focus-ring focus-within:ring-offset-1',
      },
      disabled: {
        true: 'pointer-events-none opacity-40 bg-surface-sunken cursor-not-allowed',
        false: 'cursor-text',
      },
      size: {
        sm: 'min-h-[38px] p-1.5 text-xs',
        md: 'min-h-[44px] p-2 text-sm',
        lg: 'min-h-[50px] p-2.5 text-base',
      },
    },
    defaultVariants: {
      hasError: false,
      disabled: false,
      size: 'md',
    },
  }
)

export type TagInputWrapperVariantsProps = VariantProps<typeof tagInputWrapperVariants>

// ─── Context ──────────────────────────────────────────────────────────────────

export interface TagInputContextValue {
  tags: string[]
  disabled: boolean
  hasError: boolean
  size: TagInputSize
  tone: ChipTone
  maxTags?: number
  isFull: boolean
  inputVal: string
  setInputVal: (val: string) => void
  addTag: (tag: string) => void
  removeTag: (index: number) => void
  registerInputRef: (node: HTMLInputElement | null) => void
  focusInput: () => void
}

export const TagInputContext = createContext<TagInputContextValue | null>(null)

export function useTagInputContext(): TagInputContextValue | null {
  return useContext(TagInputContext)
}
