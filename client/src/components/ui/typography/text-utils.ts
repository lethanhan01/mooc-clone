import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'

export const textVariants = cva('', {
  variants: {
    variant: {
      body: 'text-base leading-relaxed',
      caption: 'text-xs leading-normal',
      overline: 'text-xs uppercase tracking-wider font-semibold',
      lead: 'text-lg leading-relaxed',
      code: 'font-mono text-xs',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    tone: {
      default: 'text-fg-primary',
      muted: 'text-fg-secondary',
      dim: 'text-fg-dim',
      accent: 'text-action-accent',
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
    variant: 'body',
    weight: 'normal',
    tone: 'default',
    truncate: false,
  },
})

export const clampMap: Record<number, string> = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
  5: 'line-clamp-5',
  6: 'line-clamp-6',
}

export type TextSemanticTag =
  | 'span'
  | 'p'
  | 'strong'
  | 'em'
  | 'small'
  | 'time'
  | 'code'
  | 'label'

export type TextVariantsProps = VariantProps<typeof textVariants>

export interface TextProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>,
    TextVariantsProps {
  as?: TextSemanticTag
  dateTime?: string
  clamp?: 1 | 2 | 3 | 4 | 5 | 6
  children?: ReactNode
}

