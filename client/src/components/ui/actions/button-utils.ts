import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils'
import type { Tone, Size } from '@/lib/variants'

export type ModernButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link' | 'plain'
export type DeprecatedButtonVariant =
  | 'outline-white' | 'outline-green' | 'outline-green-light' | 'dark'
  | 'elevated' | 'icon' | 'text' | 'text-muted' | 'text-accent' | 'nav-link'
export type ButtonVariant = ModernButtonVariant | DeprecatedButtonVariant
export type ModernButtonSize = Size | 'icon'
export type DeprecatedButtonSize = 'default' | 'compact' | 'wide' | 'hero' | 'nav'
export type ButtonSize = ModernButtonSize | DeprecatedButtonSize
export type ButtonWidth = 'auto' | 'full' | 'mobile-full'

export interface BaseButtonProps {
  variant?: ButtonVariant
  tone?: Tone
  size?: ButtonSize
  width?: ButtonWidth
  iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  loading?: boolean
  loadingText?: string
  fullWidth?: boolean
  wide?: boolean
  mobileFull?: boolean
  responsiveIconOnly?: boolean
  truncate?: boolean
  touchTarget?: boolean
  'data-no-sweep'?: string | boolean
}

export const buttonVariants = cva(
  'relative inline-flex items-center justify-center font-medium select-none shrink-0 transition-all duration-150 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 touch-manipulation',
  {
    variants: {
      variant: {
        primary: 'bg-action-primary text-action-primary-fg hover:bg-action-primary-hover active:bg-action-primary-active border border-transparent shadow-xs rogym-sweep',
        secondary: 'bg-surface-elevated text-fg-primary hover:bg-surface-card-hover active:bg-surface-sunken border border-line-subtle shadow-xs rogym-sweep',
        outline: 'bg-transparent text-fg-primary border border-line-subtle hover:bg-surface-card-hover hover:border-line-strong active:bg-surface-sunken rogym-sweep',
        ghost: 'bg-transparent text-fg-secondary hover:bg-surface-card-hover hover:text-fg-primary active:bg-surface-sunken border-0',
        danger: 'bg-status-danger-solid text-status-danger-on-solid hover:opacity-90 active:scale-95 border-transparent shadow-xs rogym-sweep',
        link: 'bg-transparent text-action-primary underline-offset-4 hover:underline border-0 p-0 h-auto font-medium',
        plain: 'bg-transparent p-0 border-0 outline-hidden',
      },
      tone: {
        neutral: '',
        accent: 'text-action-accent',
        danger: 'text-status-danger-fg',
        warning: 'text-status-warning-fg',
        success: 'text-status-success-fg',
        info: 'text-status-info-fg',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-lg min-h-[28px]',
        sm: 'h-8 px-3 text-xs gap-2 rounded-lg min-h-[32px]',
        md: 'h-10 px-4 text-sm gap-2.5 rounded-xl min-h-[40px]',
        lg: 'h-12 px-5 text-base gap-3 rounded-xl min-h-[48px]',
        xl: 'h-14 px-6 text-lg gap-3.5 rounded-2xl min-h-[56px]',
        icon: 'h-10 w-10 p-0 rounded-xl aspect-square shrink-0',
      },
      width: {
        auto: 'w-auto',
        full: 'w-full',
        'mobile-full': 'w-full sm:w-auto',
      },
      touchTarget: {
        true: 'after:content-[""] after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:min-h-[44px] after:min-w-[44px] after:w-full after:h-full sm:after:hidden',
        false: '',
      },
      truncate: {
        true: 'max-w-full overflow-hidden text-ellipsis whitespace-nowrap',
        false: '',
      },
    },
    compoundVariants: [
      { variant: 'outline', tone: 'accent', class: 'border-line-accent-subtle text-action-accent hover:border-line-accent-hover hover:bg-action-accent-soft' },
      { variant: 'outline', tone: 'danger', class: 'border-status-danger-border text-status-danger-fg hover:bg-status-danger-surface' },
      { variant: 'outline', tone: 'success', class: 'border-status-success-border text-status-success-fg hover:bg-status-success-surface' },
      { variant: 'outline', tone: 'warning', class: 'border-status-warning-border text-status-warning-fg hover:bg-status-warning-surface' },
      { variant: 'link', tone: 'accent', class: 'text-action-accent hover:text-action-accent-hover font-semibold' },
      { variant: 'link', tone: 'neutral', class: 'text-fg-muted hover:text-fg-primary' },
      { variant: 'ghost', tone: 'accent', class: 'text-action-accent hover:bg-action-accent-soft' },
      { variant: 'ghost', tone: 'danger', class: 'text-status-danger-fg hover:bg-status-danger-surface' },
    ],
    defaultVariants: {
      variant: 'primary',
      tone: 'neutral',
      size: 'md',
      width: 'auto',
      touchTarget: true,
    },
  }
)

export type ButtonVariantsProps = VariantProps<typeof buttonVariants>

export interface ButtonContextValue {
  size: ModernButtonSize
  variant: ModernButtonVariant
  tone: Tone
  loading: boolean
  disabled: boolean
}

export const ButtonContext = createContext<ButtonContextValue | null>(null)
export const useButtonContext = () => useContext(ButtonContext)

const ICON_SIZE_CLASSES: Record<string, string> = {
  xs: 'h-7 w-7 p-0 rounded-lg aspect-square shrink-0',
  sm: 'h-8 w-8 p-0 rounded-lg aspect-square shrink-0',
  md: 'h-10 w-10 p-0 rounded-xl aspect-square shrink-0',
  lg: 'h-12 w-12 p-0 rounded-xl aspect-square shrink-0',
  xl: 'h-14 w-14 p-0 rounded-2xl aspect-square shrink-0',
}

export function normalizeButtonVariant(
  variant: ButtonVariant = 'primary',
  tone?: Tone
): { variant: ModernButtonVariant; tone: Tone; isIconVariant?: boolean } {
  switch (variant) {
    case 'secondary':
    case 'dark':
    case 'elevated':
      return { variant: 'secondary', tone: tone ?? 'neutral' }
    case 'outline':
    case 'outline-white':
      return { variant: 'outline', tone: tone ?? 'neutral' }
    case 'outline-green':
    case 'outline-green-light':
      return { variant: 'outline', tone: 'accent' }
    case 'danger':
      return { variant: 'danger', tone: tone ?? 'danger' }
    case 'ghost':
    case 'text-muted':
      return { variant: 'ghost', tone: tone ?? 'neutral' }
    case 'text':
    case 'nav-link':
    case 'link':
      return { variant: 'link', tone: tone ?? 'neutral' }
    case 'text-accent':
      return { variant: 'link', tone: 'accent' }
    case 'plain':
      return { variant: 'plain', tone: tone ?? 'neutral' }
    case 'icon':
      return { variant: 'secondary', tone: tone ?? 'neutral', isIconVariant: true }
    default:
      return { variant: 'primary', tone: tone ?? 'neutral' }
  }
}

export function normalizeButtonSize(size: ButtonSize = 'md', isIconVariant = false): ModernButtonSize {
  if (isIconVariant || size === 'icon') return 'icon'
  switch (size) {
    case 'xs': return 'xs'
    case 'sm':
    case 'compact':
    case 'nav': return 'sm'
    case 'lg': return 'lg'
    case 'xl':
    case 'hero': return 'xl'
    default: return 'md'
  }
}

export function getSpinnerClass(size: ButtonSize = 'md'): string {
  switch (normalizeButtonSize(size)) {
    case 'xs': return 'h-3 w-3 border-[1.5px]'
    case 'sm': return 'h-3.5 w-3.5 border-2'
    case 'lg':
    case 'xl': return 'h-5 w-5 border-2'
    default: return 'h-4 w-4 border-2'
  }
}

export function resolveButtonWidth(
  width?: ButtonWidth,
  fullWidth?: boolean,
  wide?: boolean,
  mobileFull?: boolean,
  size?: ButtonSize
): ButtonWidth {
  if (width) return width
  if (mobileFull) return 'mobile-full'
  if (fullWidth || wide || size === 'wide') return 'full'
  return 'auto'
}

function resolveLegacyIconKey(sizeStr: string): BaseButtonProps['iconSize'] {
  if (sizeStr === 'compact') return 'sm'
  if (sizeStr === 'hero') return 'xl'
  if (sizeStr === 'xs' || sizeStr === 'sm' || sizeStr === 'md' || sizeStr === 'lg' || sizeStr === 'xl') {
    return sizeStr
  }
  return undefined
}

export function getButtonClasses({
  variant = 'primary',
  tone,
  size = 'md',
  width,
  iconSize,
  fullWidth,
  wide,
  mobileFull,
  truncate,
  touchTarget,
  className,
}: BaseButtonProps & { className?: string }): string {
  const normVariant = normalizeButtonVariant(variant, tone)
  const isIcon = normVariant.isIconVariant || size === 'icon'
  const normSize = normalizeButtonSize(size, normVariant.isIconVariant)
  const resolvedWidth = resolveButtonWidth(width, fullWidth, wide, mobileFull, size)
  const isInline = normVariant.variant === 'link' || normVariant.variant === 'plain'
  const effectiveTouchTarget = touchTarget ?? !isInline

  const cvaClass = buttonVariants({
    variant: normVariant.variant,
    tone: normVariant.tone,
    size: isIcon ? 'icon' : normSize,
    width: resolvedWidth,
    touchTarget: effectiveTouchTarget,
    truncate: Boolean(truncate),
  })

  const rawSizeStr = String(size)
  const legacyIconMatch = ['xs', 'sm', 'compact', 'lg', 'xl', 'hero'].includes(rawSizeStr)
  let resolvedIconKey = iconSize
  if (!resolvedIconKey && normVariant.isIconVariant && legacyIconMatch) {
    resolvedIconKey = resolveLegacyIconKey(rawSizeStr)
  }

  const iconOverride = isIcon && resolvedIconKey ? ICON_SIZE_CLASSES[resolvedIconKey] : undefined
  return cn('rogym-btn', cvaClass, iconOverride, className)
}

export interface ButtonRuntimePropsOptions extends BaseButtonProps {
  disabled?: boolean
  className?: string
}

export function useButtonRuntimeProps<T extends ButtonRuntimePropsOptions>({
  variant = 'primary',
  tone,
  size = 'md',
  width,
  iconSize,
  fullWidth,
  wide,
  mobileFull,
  truncate,
  touchTarget,
  loading = false,
  disabled = false,
  className,
  ...rest
}: T) {
  const isActuallyDisabled = Boolean(disabled || loading)
  const normVariant = normalizeButtonVariant(variant, tone)
  const normSize = normalizeButtonSize(size, normVariant.isIconVariant)
  const isPlainOrLink = normVariant.variant === 'plain' || normVariant.variant === 'link'

  const contextValue = useMemo(
    () => ({
      size: normSize,
      variant: normVariant.variant,
      tone: normVariant.tone,
      loading,
      disabled: Boolean(disabled),
    }),
    [normSize, normVariant.variant, normVariant.tone, loading, disabled]
  )

  const buttonClasses = getButtonClasses({
    variant,
    tone,
    size,
    width,
    iconSize,
    fullWidth,
    wide,
    mobileFull,
    truncate,
    touchTarget,
    className,
  })

  return {
    isActuallyDisabled,
    normSize,
    normVariant,
    isPlainOrLink,
    contextValue,
    buttonClasses,
    domProps: rest,
  }
}
