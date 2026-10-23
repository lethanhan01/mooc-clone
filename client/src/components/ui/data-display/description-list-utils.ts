import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'

export const descriptionListVariants = cva('', {
  variants: {
    layout: {
      grid: 'grid',
      horizontal: 'flex flex-col divide-y divide-border-subtle',
      vertical: 'flex flex-col',
    },
    columns: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-2 sm:grid-cols-4',
    },
    gap: {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    },
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    layout: 'grid',
    columns: 2,
    gap: 'md',
    size: 'sm',
  },
})

export type DescriptionListLayout = 'grid' | 'horizontal' | 'vertical'
export type DescriptionListColumns = 1 | 2 | 3 | 4
export type DescriptionListSize = 'sm' | 'md' | 'lg'

export interface DescriptionItemData {
  term: ReactNode
  details: ReactNode
  id?: string | number
}

export type DescriptionListVariantsProps = VariantProps<typeof descriptionListVariants>

export interface DescriptionListProps
  extends HTMLAttributes<HTMLDListElement>,
    DescriptionListVariantsProps {
  items?: DescriptionItemData[]
  bordered?: boolean
  children?: ReactNode
}

export interface DescriptionItemProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export interface DescriptionTermProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
}

export interface DescriptionDetailsProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
}
