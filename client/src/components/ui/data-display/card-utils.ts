import { cva, type VariantProps } from 'class-variance-authority'
import type { Tone } from '@/lib/variants'

export type CardVariant =
  | 'default'
  | 'compact'
  | 'interactive'
  | 'glass'
  | 'bordered'
  | 'elevated'

export type CardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg'
export type CardSemanticTag = 'div' | 'article' | 'section' | 'li' | 'aside'

export const cardVariants = cva(
  'relative overflow-hidden text-fg-primary transition-all duration-200',
  {
    variants: {
      variant: {
        default:
          'rounded-2xl md:rounded-[24px] border border-line-accent-subtle bg-surface-card shadow-md',
        compact:
          'rounded-xl md:rounded-2xl border border-line-accent-subtle bg-surface-card shadow-xs',
        interactive:
          'rounded-xl md:rounded-2xl border border-line-accent-subtle bg-surface-card shadow-xs hover:-translate-y-1 hover:border-line-accent-hover hover:bg-surface-card-hover hover:shadow-card active:scale-[0.99] cursor-pointer touch-manipulation group',
        glass:
          'rounded-2xl md:rounded-[24px] border border-line-subtle bg-surface-overlay shadow-glass backdrop-blur-xl',
        bordered:
          'rounded-2xl md:rounded-[24px] border-2 border-line-accent-subtle bg-surface-card shadow-md',
        elevated:
          'rounded-2xl md:rounded-[24px] border border-line-subtle bg-surface-card shadow-2xl',
      },
      padding: {
        none: 'p-0',
        xs: 'p-2.5 sm:p-3',
        sm: 'p-3.5 sm:p-4 md:p-5',
        md: 'p-4 sm:p-5 md:p-6',
        lg: 'p-5 sm:p-6 md:p-8',
      },
      tone: {
        neutral: '',
        accent: 'border-action-accent/40 bg-action-accent/[0.04] shadow-[0_0_24px_rgba(66,224,158,0.12)]',
        success: 'border-status-success-border bg-status-success-bg/15 shadow-xs',
        warning: 'border-status-warning-border bg-status-warning-bg/15 shadow-xs',
        danger: 'border-status-danger-border bg-status-danger-bg/15 shadow-xs',
        info: 'border-status-info-border bg-status-info-bg/15 shadow-xs',
      } satisfies Record<Tone, string>,
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
)

export type CardVariantProps = VariantProps<typeof cardVariants>

export function resolveTabIndex(
  disabled?: boolean,
  tabIndex?: number,
  isClickable?: boolean
): number | undefined {
  if (disabled) return -1
  if (tabIndex !== undefined) return tabIndex
  return isClickable ? 0 : undefined
}

export type CardAspectRatio = '16/9' | '6/4' | '4/3' | '1/1' | '21/9' | 'auto'

export const ASPECT_CLASSES: Record<CardAspectRatio, string> = {
  '16/9': 'aspect-[16/9]',
  '6/4': 'aspect-[6/4]',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '21/9': 'aspect-[21/9]',
  auto: 'aspect-auto',
}
