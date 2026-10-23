import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { User } from 'lucide-react'
import { cn } from '@/utils'
import {
  avatarVariants,
  getInitials,
  resolveAvatarToneClasses,
  SIZE_CLASSES,
  STATUS_COLORS,
  type AvatarShape,
  type AvatarSize,
  type AvatarStatus,
  type AvatarTone,
} from './avatar-utils'

export type { AvatarShape, AvatarSize, AvatarStatus, AvatarTone }

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  name?: string
  fallback?: ReactNode
  size?: AvatarSize
  shape?: AvatarShape
  status?: AvatarStatus
  tone?: AvatarTone
  border?: boolean
  className?: string
  imageClassName?: string
}

interface RenderAvatarContentOptions {
  hasImage: boolean
  src?: string | null
  alt?: string
  name?: string
  roundedClass: string
  imageClassName?: string
  setImageError: (err: boolean) => void
  fallback?: ReactNode
  initials: string
  sizeCfg: (typeof SIZE_CLASSES)[AvatarSize]
}

function renderAvatarContent({
  hasImage,
  src,
  alt,
  name,
  roundedClass,
  imageClassName,
  setImageError,
  fallback,
  initials,
  sizeCfg,
}: Readonly<RenderAvatarContentOptions>): ReactNode {
  if (hasImage && src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        onError={() => setImageError(true)}
        className={cn('h-full w-full object-cover', roundedClass, imageClassName)}
      />
    )
  }

  if (fallback && typeof fallback !== 'string') {
    return fallback
  }

  if (initials) {
    return <span className={cn('tracking-wider', sizeCfg.text)}>{initials}</span>
  }

  return <User size={sizeCfg.iconSize} className="opacity-70" />
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      fallback,
      size = 'md',
      shape = 'circle',
      status,
      tone = 'auto',
      border = true,
      className,
      imageClassName,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false)
    const hasImage = Boolean(src && !imageError)

    const initials = useMemo(() => {
      if (fallback && typeof fallback === 'string') return fallback
      return getInitials(name)
    }, [fallback, name])

    const toneClass = useMemo(() => {
      return resolveAvatarToneClasses(tone, name, alt)
    }, [tone, name, alt])

    const sizeCfg = SIZE_CLASSES[size]
    const roundedClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl'

    return (
      <div
        ref={ref}
        className={cn(
          avatarVariants({ size, shape, border }),
          toneClass,
          className
        )}
        {...props}
      >
        {renderAvatarContent({
          hasImage,
          src,
          alt,
          name,
          roundedClass,
          imageClassName,
          setImageError,
          fallback,
          initials,
          sizeCfg,
        })}

        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full ring-3 ring-surface-base',
              sizeCfg.statusSize,
              STATUS_COLORS[status]
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number
  size?: AvatarSize
  className?: string
  children?: ReactNode
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max = 4, size = 'md', className, children, ...props }, ref) => {
    const validChildren = Children.toArray(children).filter(isValidElement)
    const visibleAvatars = validChildren.slice(0, max)
    const remainingCount = validChildren.length - max

    const sizeCfg = SIZE_CLASSES[size]

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center -space-x-2.5', className)}
        {...props}
      >
        {visibleAvatars.map((child, index) => {
          const childProps = (child as React.ReactElement<AvatarProps>).props
          const childKey = child.key ?? childProps?.name ?? childProps?.src ?? childProps?.alt ?? `avatar-${index}`
          return cloneElement(child as React.ReactElement<AvatarProps>, {
            key: childKey,
            size,
            className: cn('ring-2 ring-surface-base', childProps?.className),
          })
        })}

        {remainingCount > 0 && (
          <div
            className={cn(
              'relative inline-flex shrink-0 items-center justify-center rounded-full bg-surface-elevated border border-line-subtle text-fg-primary font-bold ring-2 ring-surface-base',
              sizeCfg.container,
              sizeCfg.text
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    )
  }
)
AvatarGroup.displayName = 'AvatarGroup'
