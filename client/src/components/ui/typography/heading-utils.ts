import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'
import type { Tone } from '@/lib/variants'

export const headingVariants = cva('font-bold tracking-tight', {
  variants: {
    size: {
      xs: 'text-base font-semibold',
      sm: 'text-lg',
      md: 'text-xl',
      lg: 'text-2xl',
      xl: 'text-3xl',
      '2xl': 'text-4xl font-black',
      '3xl': 'text-5xl font-black',
    },
    tone: {
      default: 'text-fg-primary',
      accent: 'text-action-accent',
      muted: 'text-fg-secondary',
      success: 'text-status-success-fg',
      warning: 'text-status-warning-fg',
      danger: 'text-status-danger-fg',
      info: 'text-status-info-fg',
      neutral: 'text-fg-muted',
    },
    truncate: {
      true: 'truncate',
      false: '',
    },
  },
  defaultVariants: {
    tone: 'default',
    truncate: false,
  },
})

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

export const defaultLevelSizeMap: Record<HeadingLevel, HeadingSize> = {
  1: '2xl',
  2: 'xl',
  3: 'lg',
  4: 'md',
  5: 'sm',
  6: 'xs',
}

export type HeadingVariantsProps = Omit<VariantProps<typeof headingVariants>, 'tone'> & {
  tone?: Tone
}

export interface HeadingProps
  extends Omit<HTMLAttributes<HTMLHeadingElement>, 'color'>,
    HeadingVariantsProps {
  level?: HeadingLevel
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children?: ReactNode
}
