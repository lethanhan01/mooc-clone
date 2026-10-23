import { cva, type VariantProps } from 'class-variance-authority'
import { type Tone, type Emphasis } from '@/lib/variants'

export type ChipTone = Tone
export type ChipEmphasis = Emphasis
export type ChipSize = 'xs' | 'sm' | 'md' | 'lg'

export const chipVariants = cva(
  'inline-flex items-center justify-center font-medium border transition-all select-none',
  {
    variants: {
      tone: {
        neutral: '',
        accent: '',
        success: '',
        warning: '',
        danger: '',
        info: '',
      },
      emphasis: {
        solid: '',
        subtle: '',
        outline: '',
      },
      size: {
        xs: 'text-[10px] h-5 px-1.5 gap-1 rounded-md',
        sm: 'text-[11px] h-6 px-2 gap-1 rounded-lg',
        md: 'text-xs h-7 px-2.5 gap-1.5 rounded-xl',
        lg: 'text-sm h-8 px-3.5 gap-2 rounded-xl',
      },
    },
    defaultVariants: {
      tone: 'neutral',
      emphasis: 'subtle',
      size: 'sm',
    },
  }
)

export type ChipVariantProps = VariantProps<typeof chipVariants>
