import {
  forwardRef,
  useState,
  useEffect,
  type SyntheticEvent,
} from 'react'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/utils'
import { Skeleton } from '../feedback/Skeleton'
import {
  imageContainerVariants,
  imageVariants,
  type ImageProps,
  type ImageFallbackProps,
} from './image-utils'

export type {
  ImageAspectRatio,
  ImageFit,
  ImageRadius,
} from './image-utils'
export type {
  ImageProps,
  ImageFallbackProps,
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      aspectRatio = 'auto',
      fit = 'cover',
      radius = 'none',
      fallbackIcon,
      fallback,
      loading = 'lazy',
      className,
      containerClassName,
      onLoad,
      onError,
      ...props
    },
    ref
  ) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
      setIsLoaded(false)
      setHasError(false)
    }, [src])

    const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
      setIsLoaded(true)
      onLoad?.(e)
    }

    const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
      setHasError(true)
      setIsLoaded(false)
      onError?.(e)
    }

    const isAvailable = Boolean(src) && !hasError

    const defaultFallback = (
      <div className="flex h-full w-full items-center justify-center text-fg-dim p-4">
        {fallbackIcon ?? <ImageIcon className="h-8 w-8 stroke-[1.5]" />}
      </div>
    )
    const renderFallback = fallback ?? defaultFallback

    return (
      <div
        className={cn(
          imageContainerVariants({ aspectRatio, radius }),
          containerClassName
        )}
      >
        {isAvailable ? (
          <>
            {!isLoaded ? (
              <Skeleton className="absolute inset-0 h-full w-full rounded-[inherit]" />
            ) : null}
            <img
              ref={ref}
              src={src ?? undefined}
              alt={alt}
              loading={loading}
              onLoad={handleLoad}
              onError={handleError}
              className={cn(
                imageVariants({ fit }),
                !isLoaded ? 'opacity-0' : 'opacity-100',
                className
              )}
              {...props}
            />
          </>
        ) : (
          renderFallback
        )}
      </div>
    )
  }
)
Image.displayName = 'Image'

export const ImageFallback = ({ children, className }: ImageFallbackProps) => {
  return (
    <div className={cn('flex h-full w-full items-center justify-center text-fg-dim p-4', className)}>
      {children}
    </div>
  )
}
ImageFallback.displayName = 'ImageFallback'
