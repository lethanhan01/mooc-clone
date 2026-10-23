import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'

export const flexVariants = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      column: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'column-reverse': 'flex-col-reverse',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
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
    wrap: {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
    },
    inline: {
      true: 'inline-flex',
      false: 'flex',
    },
  },
  defaultVariants: {
    direction: 'row',
    align: 'stretch',
    justify: 'start',
    gap: 0,
    wrap: 'nowrap',
    inline: false,
  },
})

export type FlexSemanticTag =
  | 'div'
  | 'section'
  | 'article'
  | 'nav'
  | 'header'
  | 'footer'
  | 'main'
  | 'aside'
  | 'ul'
  | 'ol'
  | 'li'

export type FlexVariantsProps = VariantProps<typeof flexVariants>

export interface FlexProps extends HTMLAttributes<HTMLElement>, FlexVariantsProps {
  as?: FlexSemanticTag
  children?: ReactNode
}

export interface HStackProps extends Omit<FlexProps, 'direction'> {}
export interface VStackProps extends Omit<FlexProps, 'direction'> {}
