import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'

export const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      7: 'grid-cols-7',
      12: 'grid-cols-12',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
      10: 'gap-10',
      12: 'gap-12',
    },
  },
  defaultVariants: {
    cols: 1,
    gap: 4,
  },
})

export const smColsMap: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6',
  7: 'sm:grid-cols-7',
  12: 'sm:grid-cols-12',
}

export const mdColsMap: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  7: 'md:grid-cols-7',
  12: 'md:grid-cols-12',
}

export const lgColsMap: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  7: 'lg:grid-cols-7',
  12: 'lg:grid-cols-12',
}

export const xlColsMap: Record<number, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
  7: 'xl:grid-cols-7',
  12: 'xl:grid-cols-12',
}

export const colSpanMap: Record<number | 'full', string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  12: 'col-span-12',
  full: 'col-span-full',
}

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 12
export type GridSemanticTag = 'div' | 'section' | 'article' | 'main' | 'ul' | 'ol'

export interface GridProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof gridVariants> {
  as?: GridSemanticTag
  smCols?: GridCols
  mdCols?: GridCols
  lgCols?: GridCols
  xlCols?: GridCols
  children?: ReactNode
}

export interface GridItemProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'li' | 'article' | 'section'
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'full'
  children?: ReactNode
}
