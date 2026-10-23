import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'

export const containerVariants = cva('w-full', {
  variants: {
    size: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
    },
    centered: {
      true: 'mx-auto',
      false: '',
    },
    padding: {
      none: 'px-0',
      sm: 'px-4',
      md: 'px-4 sm:px-6',
      lg: 'px-4 sm:px-6 lg:px-8',
    },
  },
  defaultVariants: {
    size: 'xl',
    centered: true,
    padding: 'md',
  },
})

export type ContainerSemanticTag = 'div' | 'section' | 'article' | 'main'

export type ContainerVariantsProps = VariantProps<typeof containerVariants>

export interface ContainerProps
  extends HTMLAttributes<HTMLElement>,
    ContainerVariantsProps {
  as?: ContainerSemanticTag
  children?: ReactNode
}
