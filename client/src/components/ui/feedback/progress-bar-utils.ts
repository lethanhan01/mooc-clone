import { cva, type VariantProps } from 'class-variance-authority'
import { type Tone } from '@/lib/variants'

export type ProgressBarTone = Tone
export type ProgressBarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export const progressBarTrackVariants = cva(
  'w-full overflow-hidden rounded-full bg-surface-sunken border border-line-subtle',
  {
    variants: {
      size: {
        xs: 'h-1',
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
        xl: 'h-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export const progressBarIndicatorVariants = cva(
  'h-full rounded-full transition-all duration-300 ease-out',
  {
    variants: {
      tone: {
        accent: 'bg-action-accent shadow-[0_0_10px_rgba(66,224,158,0.4)]',
        neutral: 'bg-fg-muted',
        success: 'bg-status-success-solid shadow-[0_0_10px_rgba(52,211,153,0.4)]',
        warning: 'bg-status-warning-solid shadow-[0_0_10px_rgba(251,191,36,0.4)]',
        danger: 'bg-status-danger-solid shadow-[0_0_10px_rgba(239,68,68,0.4)]',
        info: 'bg-status-info-solid shadow-[0_0_10px_rgba(147,197,253,0.4)]',
      },
    },
    defaultVariants: {
      tone: 'accent',
    },
  }
)

export type ProgressBarVariantProps = VariantProps<typeof progressBarTrackVariants>
