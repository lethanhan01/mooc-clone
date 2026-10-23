import { createContext, useContext } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils'
import { toneClasses } from '@/lib/tone-styles'
import type { Tone, Emphasis, Size } from '@/lib/variants'

export type BadgeShapeVariant = 'pill' | 'rounded'

export const badgeVariants = cva(
  'inline-flex items-center justify-center border font-semibold select-none shrink-0 transition-colors duration-150',
  {
    variants: {
      variant: {
        pill: 'rounded-full',
        rounded: 'rounded-md',
      },
      size: {
        xs: 'h-5 px-2 text-[10px] gap-1',
        sm: 'h-6 px-2.5 text-xs gap-1.5',
        md: 'h-7 px-3 text-xs gap-1.5',
        lg: 'h-8 px-3.5 text-sm gap-2',
        xl: 'h-9 px-4 text-sm gap-2',
      },
    },
    defaultVariants: {
      variant: 'pill',
      size: 'md',
    },
  }
)

export type BadgeVariantProps = VariantProps<typeof badgeVariants>

export const TONE_DOT_CLASSES: Record<Tone, string> = {
  success: 'bg-status-success-solid',
  warning: 'bg-status-warning-solid',
  danger: 'bg-status-danger-solid',
  info: 'bg-status-info-solid',
  neutral: 'bg-fg-muted',
  accent: 'bg-action-accent',
}

export interface BadgeContextValue {
  tone: Tone
  emphasis: Emphasis
  size: Size
  variant: BadgeShapeVariant
}

export const BadgeContext = createContext<BadgeContextValue | null>(null)

export function useBadgeContext(): BadgeContextValue {
  const context = useContext(BadgeContext)
  return (
    context ?? {
      tone: 'neutral',
      emphasis: 'subtle',
      size: 'md',
      variant: 'pill',
    }
  )
}

export interface GetBadgeClassesOptions {
  tone?: Tone
  emphasis?: Emphasis
  size?: Size
  variant?: BadgeShapeVariant
  truncate?: boolean
  interactive?: boolean
  className?: string
}

export function getBadgeClasses({
  tone = 'neutral',
  emphasis = 'subtle',
  size = 'md',
  variant = 'pill',
  truncate,
  interactive,
  className,
}: GetBadgeClassesOptions): string {
  return cn(
    badgeVariants({ size, variant }),
    toneClasses(tone, emphasis),
    truncate && 'max-w-full',
    interactive && [
      'cursor-pointer hover:opacity-85 active:scale-95 touch-manipulation',
      'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
      // Chuẩn W3C & LINE LIFF mobile: Touch target wrapper tối thiểu 44px
      'min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0'
    ],
    className
  )
}
