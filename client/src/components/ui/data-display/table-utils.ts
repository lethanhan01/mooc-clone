import { cva, type VariantProps } from 'class-variance-authority'

export const tableVariants = cva(
  'w-full caption-bottom border-collapse text-left text-sm',
  {
    variants: {
      variant: {
        default: '',
        striped: '[&_tbody_tr:nth-child(even)]:bg-surface-sunken/40',
        compact: '[&_th]:py-2.5 [&_th]:px-3 [&_td]:py-2.5 [&_td]:px-3 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export type TableVariantsProps = VariantProps<typeof tableVariants>
