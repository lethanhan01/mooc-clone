import { cva } from 'class-variance-authority'
import type { ImgHTMLAttributes, ReactNode } from 'react'

export const imageContainerVariants = cva(
  'relative overflow-hidden bg-bg-surface flex items-center justify-center',
  {
    variants: {
      aspectRatio: {
        '1/1': 'aspect-square',
        '16/9': 'aspect-video',
        '4/3': 'aspect-[4/3]',
        '21/9': 'aspect-[21/9]',
        auto: '',
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      aspectRatio: 'auto',
      radius: 'none',
    },
  }
)

export const imageVariants = cva('w-full h-full transition-opacity duration-200', {
  variants: {
    fit: {
      cover: 'object-cover',
      contain: 'object-contain',
      fill: 'object-fill',
      none: 'object-none',
    },
  },
  defaultVariants: {
    fit: 'cover',
  },
})

export type ImageAspectRatio = '1/1' | '16/9' | '4/3' | '21/9' | 'auto'
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none'
export type ImageRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null
  alt: string
  aspectRatio?: ImageAspectRatio
  fit?: ImageFit
  radius?: ImageRadius
  fallbackIcon?: ReactNode
  fallback?: ReactNode
  containerClassName?: string
}

export interface ImageFallbackProps {
  children?: ReactNode
  className?: string
}
