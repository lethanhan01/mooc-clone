import {
  type ButtonHTMLAttributes, type AnchorHTMLAttributes, type HTMLAttributes,
  type ReactNode, forwardRef, Children, isValidElement,
} from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/utils'
import {
  type BaseButtonProps, type ButtonSize, getSpinnerClass,
  useButtonRuntimeProps, ButtonContext, useButtonContext,
} from './button-utils'

export type {
  ButtonVariant, ButtonSize, ModernButtonVariant, ModernButtonSize,
  BaseButtonProps, ButtonVariantsProps, ButtonWidth, ButtonContextValue,
} from './button-utils'

export interface ButtonIconProps extends HTMLAttributes<HTMLSpanElement> {
  position?: 'left' | 'right'
  children?: ReactNode
}

export function ButtonIcon({ position = 'left', className, children, ...props }: Readonly<ButtonIconProps>) {
  const context = useButtonContext()
  if (context?.loading && position === 'left') return null
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center', className)} aria-hidden="true" {...props}>
      {children}
    </span>
  )
}
ButtonIcon.displayName = 'Button.Icon'

export interface ButtonSpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: ButtonSize
}

export function ButtonSpinner({ size, className, ...props }: Readonly<ButtonSpinnerProps>) {
  const context = useButtonContext()
  const effectiveSize = size ?? context?.size ?? 'md'
  return (
    <span
      className={cn('inline-block animate-spin rounded-full border-current border-t-transparent shrink-0', getSpinnerClass(effectiveSize), className)}
      aria-hidden="true"
      {...props}
    />
  )
}
ButtonSpinner.displayName = 'Button.Spinner'

export interface ButtonTextProps extends HTMLAttributes<HTMLSpanElement> {
  truncate?: boolean
  responsiveHideOnMobile?: boolean
  children?: ReactNode
}

export function ButtonText({ truncate, responsiveHideOnMobile, className, children, ...props }: Readonly<ButtonTextProps>) {
  return (
    <span
      className={cn('inline-flex items-center justify-center gap-1.5 min-w-0 max-w-full text-center', truncate && 'truncate', responsiveHideOnMobile && 'hidden sm:inline-flex', className)}
      {...props}
    >
      {children}
    </span>
  )
}
ButtonText.displayName = 'Button.Text'

export interface ButtonContentProps extends BaseButtonProps {
  children?: ReactNode
}

export function ButtonContent({
  size = 'md',
  leftIcon,
  rightIcon,
  loading,
  loadingText,
  responsiveIconOnly,
  truncate,
  children,
}: Readonly<ButtonContentProps>) {
  const effectiveContent = loading && loadingText ? loadingText : children
  if (loading) {
    return (
      <>
        <ButtonSpinner size={size} />
        {effectiveContent !== undefined && effectiveContent !== null && (
          <ButtonText truncate={truncate} responsiveHideOnMobile={responsiveIconOnly && Boolean(leftIcon)}>
            {effectiveContent}
          </ButtonText>
        )}
      </>
    )
  }
  return (
    <>
      {leftIcon && <ButtonIcon position="left">{leftIcon}</ButtonIcon>}
      {effectiveContent !== undefined && effectiveContent !== null && (
        <ButtonText truncate={truncate} responsiveHideOnMobile={responsiveIconOnly && Boolean(leftIcon)}>
          {effectiveContent}
        </ButtonText>
      )}
      {rightIcon && <ButtonIcon position="right" className={responsiveIconOnly ? 'hidden sm:inline-flex' : undefined}>{rightIcon}</ButtonIcon>}
    </>
  )
}

function ButtonInner({
  size = 'md',
  leftIcon,
  rightIcon,
  loading,
  loadingText,
  responsiveIconOnly,
  truncate,
  children,
}: Readonly<ButtonContentProps>) {
  if (leftIcon || rightIcon || loadingText || responsiveIconOnly || truncate) {
    return (
      <ButtonContent size={size} leftIcon={leftIcon} rightIcon={rightIcon} loading={loading} loadingText={loadingText} responsiveIconOnly={responsiveIconOnly} truncate={truncate}>
        {children}
      </ButtonContent>
    )
  }
  const hasSpinner = Children.toArray(children).some(
    (c) => isValidElement(c) && (c.type === ButtonSpinner || (c.type as { displayName?: string })?.displayName === 'Button.Spinner')
  )
  return (
    <>
      {loading && !hasSpinner && <ButtonSpinner size={size} />}
      {children}
    </>
  )
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, BaseButtonProps {}

const ButtonRoot = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ leftIcon, rightIcon, loading = false, loadingText, responsiveIconOnly, truncate, children, disabled = false, type = 'button', 'data-no-sweep': dataNoSweepProp, className, ...props }, ref) => {
    const runtime = useButtonRuntimeProps({ loading, disabled, truncate, className, ...props })
    const dataNoSweep = runtime.isPlainOrLink ? '' : dataNoSweepProp

    return (
      <ButtonContext.Provider value={runtime.contextValue}>
        <button
          ref={ref}
          type={type}
          disabled={runtime.isActuallyDisabled}
          aria-busy={loading ? 'true' : undefined}
          aria-disabled={runtime.isActuallyDisabled ? 'true' : undefined}
          data-no-sweep={dataNoSweep}
          className={runtime.buttonClasses}
          {...runtime.domProps}
        >
          <ButtonInner size={props.size} leftIcon={leftIcon} rightIcon={rightIcon} loading={loading} loadingText={loadingText} responsiveIconOnly={responsiveIconOnly} truncate={truncate}>
            {children}
          </ButtonInner>
        </button>
      </ButtonContext.Provider>
    )
  }
)
ButtonRoot.displayName = 'Button'

export interface ButtonLinkProps extends LinkProps, BaseButtonProps {
  disabled?: boolean
}

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ leftIcon, rightIcon, loading = false, loadingText, responsiveIconOnly, truncate, children, disabled = false, to, tabIndex, onClick, className, ...props }, ref) => {
    const runtime = useButtonRuntimeProps({ loading, disabled, truncate, className, ...props })

    return (
      <ButtonContext.Provider value={runtime.contextValue}>
        <Link
          ref={ref}
          to={runtime.isActuallyDisabled ? '#' : to}
          tabIndex={runtime.isActuallyDisabled ? -1 : tabIndex}
          aria-busy={loading ? 'true' : undefined}
          aria-disabled={runtime.isActuallyDisabled ? 'true' : undefined}
          onClick={(e) => {
            if (runtime.isActuallyDisabled) { e.preventDefault(); e.stopPropagation(); return }
            onClick?.(e)
          }}
          className={cn(runtime.buttonClasses, runtime.isActuallyDisabled && 'pointer-events-none opacity-50 cursor-not-allowed')}
          {...runtime.domProps}
        >
          <ButtonInner size={props.size} leftIcon={leftIcon} rightIcon={rightIcon} loading={loading} loadingText={loadingText} responsiveIconOnly={responsiveIconOnly} truncate={truncate}>
            {children}
          </ButtonInner>
        </Link>
      </ButtonContext.Provider>
    )
  }
)
ButtonLink.displayName = 'ButtonLink'

export interface ButtonAnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement>, BaseButtonProps {
  disabled?: boolean
}

export const ButtonAnchor = forwardRef<HTMLAnchorElement, ButtonAnchorProps>(
  ({ leftIcon, rightIcon, loading = false, loadingText, responsiveIconOnly, truncate, children, disabled = false, href, tabIndex, onClick, className, ...props }, ref) => {
    const runtime = useButtonRuntimeProps({ loading, disabled, truncate, className, ...props })

    return (
      <ButtonContext.Provider value={runtime.contextValue}>
        <a
          ref={ref}
          href={runtime.isActuallyDisabled ? '#' : href}
          tabIndex={runtime.isActuallyDisabled ? -1 : tabIndex}
          aria-busy={loading ? 'true' : undefined}
          aria-disabled={runtime.isActuallyDisabled ? 'true' : undefined}
          onClick={(e) => {
            if (runtime.isActuallyDisabled) { e.preventDefault(); e.stopPropagation(); return }
            onClick?.(e)
          }}
          className={cn(runtime.buttonClasses, runtime.isActuallyDisabled && 'pointer-events-none opacity-50 cursor-not-allowed')}
          {...runtime.domProps}
        >
          <ButtonInner size={props.size} leftIcon={leftIcon} rightIcon={rightIcon} loading={loading} loadingText={loadingText} responsiveIconOnly={responsiveIconOnly} truncate={truncate}>
            {children}
          </ButtonInner>
        </a>
      </ButtonContext.Provider>
    )
  }
)
ButtonAnchor.displayName = 'ButtonAnchor'

export const Button = Object.assign(ButtonRoot, {
  Icon: ButtonIcon,
  Spinner: ButtonSpinner,
  Text: ButtonText,
  Link: ButtonLink,
  Anchor: ButtonAnchor,
})
