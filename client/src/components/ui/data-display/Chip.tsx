import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils'
import type { Tone, Emphasis } from '@/lib/variants'
import { toneClasses } from '@/lib/tone-styles'
import {
  chipVariants,
  type ChipTone,
  type ChipEmphasis,
  type ChipSize,
  type ChipVariantProps,
} from './chip-utils'

export type { ChipTone, ChipEmphasis, ChipSize, ChipVariantProps }

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  label: React.ReactNode
  tone?: Tone
  emphasis?: Emphasis
  size?: ChipSize
  selected?: boolean
  removable?: boolean
  onRemove?: () => void
  disabled?: boolean
  icon?: React.ReactNode
  asButton?: boolean
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      className,
      label,
      tone = 'neutral',
      emphasis,
      size = 'sm',
      selected = false,
      removable = false,
      onRemove,
      disabled = false,
      icon,
      onClick,
      ...props
    },
    ref
  ) => {
    const isInteractive = !!onClick && !disabled
    const effectiveEmphasis: Emphasis = emphasis ?? (selected ? 'solid' : 'subtle')
    const closeIconSize = size === 'xs' ? 10 : size === 'sm' ? 12 : 14

    const chipClassNames = cn(
      chipVariants({ tone, emphasis: effectiveEmphasis, size }),
      toneClasses(tone, effectiveEmphasis),
      isInteractive && 'cursor-pointer active:scale-95',
      disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
      className
    )

    if (isInteractive && !removable) {
      return (
        <button
          ref={ref as unknown as React.Ref<HTMLButtonElement>}
          type="button"
          disabled={disabled}
          aria-pressed={selected}
          onClick={onClick as unknown as React.MouseEventHandler<HTMLButtonElement>}
          className={chipClassNames}
          {...(props as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="truncate">{label}</span>
        </button>
      )
    }

    return (
      <div
        ref={ref}
        className={chipClassNames}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="truncate">{label}</span>
        {removable && onRemove && (
          <button
            type="button"
            tabIndex={0}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="relative ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-surface-card-hover text-fg-muted hover:text-fg-primary transition-colors opacity-70 hover:opacity-100 cursor-pointer after:content-[''] after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:min-h-[44px] after:min-w-[44px] after:w-full after:h-full sm:after:hidden"
            aria-label="Xóa"
          >
            <X size={closeIconSize} />
          </button>
        )}
      </div>
    )
  }
)
Chip.displayName = 'Chip'

