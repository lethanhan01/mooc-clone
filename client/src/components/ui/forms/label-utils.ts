import { cva, type VariantProps } from 'class-variance-authority'
import type { LabelHTMLAttributes, ReactNode } from 'react'

export const labelVariants = cva(
  'flex items-center gap-1 font-semibold select-none text-fg-secondary',
  {
    variants: {
      size: {
        sm: 'text-xs uppercase tracking-wider',
        md: 'text-sm',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      size: 'sm',
      disabled: false,
    },
  }
)

export type LabelVariantsProps = VariantProps<typeof labelVariants>

export interface LabelProps
  extends LabelHTMLAttributes<HTMLLabelElement>,
    LabelVariantsProps {
  required?: boolean
  children?: ReactNode
}
