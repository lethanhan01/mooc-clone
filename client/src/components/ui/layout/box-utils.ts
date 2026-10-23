import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'

export const boxVariants = cva('', {
  variants: {
    surface: {
      transparent: 'bg-transparent',
      default: 'bg-bg-surface',
      card: 'bg-bg-elevated',
      subtle: 'bg-bg-subtle',
      muted: 'bg-bg-muted',
    },
    padding: {
      none: 'p-0',
      xs: 'p-2',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
    border: {
      none: 'border-0',
      subtle: 'border border-border-subtle',
      default: 'border border-border',
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    },
  },
  defaultVariants: {
    surface: 'transparent',
    padding: 'none',
    border: 'none',
    rounded: 'none',
  },
})

export type BoxSemanticTag =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'header'
  | 'footer'
  | 'main'
  | 'nav'
  | 'figure'

export type BoxVariantsProps = VariantProps<typeof boxVariants>

export interface BoxProps extends HTMLAttributes<HTMLElement>, BoxVariantsProps {
  as?: BoxSemanticTag
  children?: ReactNode
}
