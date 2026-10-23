import { forwardRef, isValidElement } from 'react'
import { X, type LucideIcon } from 'lucide-react'
import { cn } from '@/utils'
import { toneClasses } from '@/lib/tone-styles'
import { Icon } from '../typography/Icon'
import { Button } from '../actions/Button'
import {
  alertVariants, getDefaultAlertIconComponent, useAlertRuntimeProps, useAlertContext,
  AlertContext, hasChildComponent, type AlertTitleProps, type AlertDescriptionProps,
  type AlertIconProps, type AlertActionProps, type AlertCloseButtonProps,
  type AlertProgressBarProps, type AlertProps,
} from './alert-utils'

export type {
  AlertTone, AlertEmphasis, AlertVariantProps, AlertContextValue,
  AlertTitleProps, AlertDescriptionProps, AlertIconProps, AlertActionProps,
  AlertCloseButtonProps, AlertProgressBarProps, AlertProps,
} from './alert-utils'

export const AlertTitle = forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h4 ref={ref} className={cn('font-semibold tracking-wide mb-0.5 text-inherit', className)} {...props}>
      {children}
    </h4>
  )
)
AlertTitle.displayName = 'Alert.Title'

export const AlertDescription = forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn('text-xs sm:text-sm leading-relaxed text-inherit opacity-90', className)} {...props}>
      {children}
    </p>
  )
)
AlertDescription.displayName = 'Alert.Description'

export const AlertIcon = forwardRef<HTMLSpanElement, AlertIconProps>(
  ({ icon, size = 18, className, children, ...props }, ref) => {
    const context = useAlertContext()
    const IconComp = (icon as LucideIcon) ?? getDefaultAlertIconComponent(context?.tone ?? 'info')

    return (
      <span
        ref={ref}
        className={cn('shrink-0 mt-0.5 text-inherit inline-flex items-center justify-center', className)}
        aria-hidden="true"
        {...props}
      >
        {children ?? (isValidElement(icon) ? icon : <Icon icon={IconComp} size={size} />)}
      </span>
    )
  }
)
AlertIcon.displayName = 'Alert.Icon'

export const AlertAction = forwardRef<HTMLElement, AlertActionProps>(
  ({ className, children, ...props }, ref) => (
    <footer ref={ref} className={cn('mt-2.5 flex items-center gap-2', className)} {...props}>
      {children}
    </footer>
  )
)
AlertAction.displayName = 'Alert.Action'

export const AlertCloseButton = forwardRef<HTMLButtonElement, AlertCloseButtonProps>(
  ({ className, children, onClick, ...props }, ref) => {
    const context = useAlertContext()
    const ariaLabel = props['aria-label'] ?? context?.closeAriaLabel ?? 'Close alert'
    return (
      <Button
        ref={ref}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={ariaLabel}
        onClick={(e) => {
          onClick?.(e)
          if (!e.defaultPrevented) context?.onClose?.()
        }}
        className={cn(
          'shrink-0 h-7 w-7 min-h-0 min-w-0 p-1 -m-1 rounded-lg opacity-70 hover:opacity-100 transition-all text-inherit',
          className
        )}
        {...props}
      >
        {children ?? <Icon icon={X} size={15} />}
      </Button>
    )
  }
)
AlertCloseButton.displayName = 'Alert.CloseButton'

export const AlertProgressBar = forwardRef<HTMLProgressElement, AlertProgressBarProps>(
  ({ duration, className, ...props }, ref) => {
    const context = useAlertContext()
    const effectiveDuration = duration ?? context?.autoDismiss ?? 0
    if (!effectiveDuration || effectiveDuration <= 0) return null
    return (
      <progress
        ref={ref}
        aria-label="Alert auto-dismiss countdown"
        className={cn(
          'absolute bottom-0 inset-x-0 h-1 w-full appearance-none rounded-b-xl overflow-hidden pointer-events-none bg-transparent border-none text-inherit block [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-current [&::-webkit-progress-value]:opacity-35 [&::-moz-progress-bar]:bg-current [&::-moz-progress-bar]:opacity-35',
          className
        )}
        style={{
          animation: `alert-progress-shrink ${effectiveDuration}ms linear forwards`,
          animationPlayState: context?.isPaused ? 'paused' : 'running',
          transformOrigin: 'left',
        }}
        {...props}
      />
    )
  }
)
AlertProgressBar.displayName = 'Alert.ProgressBar'

const AlertRoot = forwardRef<HTMLElement, AlertProps>(
  (
    {
      as: Component = 'aside', tone = 'info', emphasis = 'subtle', title, description, icon, action,
      autoDismiss, showProgressBar, onClose, closeAriaLabel = 'Close alert',
      className, children, role, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props
    },
    ref
  ) => {
    const runtime = useAlertRuntimeProps({ tone, emphasis, autoDismiss, onClose, closeAriaLabel, role })
    const isShorthand = Boolean(title || description || action || icon !== undefined)
    const hasCloseBtn = hasChildComponent(children, 'Alert.CloseButton')
    const hasProgress = hasChildComponent(children, 'Alert.ProgressBar')
    const shouldRenderProgressBar = Boolean((showProgressBar || (isShorthand && autoDismiss)) && autoDismiss && autoDismiss > 0 && !hasProgress)
    const shouldRenderClose = Boolean(onClose && !hasCloseBtn)

    return (
      <AlertContext.Provider value={runtime.contextValue}>
        <Component
          ref={ref as unknown as React.Ref<never>}
          role={runtime.effectiveRole}
          aria-live={runtime.ariaLive}
          onMouseEnter={(e) => { runtime.pause(); onMouseEnter?.(e) }}
          onMouseLeave={(e) => { runtime.resume(); onMouseLeave?.(e) }}
          onFocus={(e) => { runtime.pause(); onFocus?.(e) }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) runtime.resume()
            onBlur?.(e)
          }}
          className={cn(alertVariants({ tone, emphasis }), toneClasses(tone, emphasis), className)}
          {...props}
        >
          {isShorthand ? (
            <>
              <AlertIcon icon={icon} />
              <section className="flex-1 min-w-0">
                {title && <AlertTitle>{title}</AlertTitle>}
                {description && <AlertDescription>{description}</AlertDescription>}
                {children}
                {action && <AlertAction>{action}</AlertAction>}
              </section>
              {shouldRenderClose && <AlertCloseButton aria-label={closeAriaLabel} />}
            </>
          ) : (
            <>
              {children}
              {shouldRenderClose && <AlertCloseButton aria-label={closeAriaLabel} />}
            </>
          )}

          {shouldRenderProgressBar && <AlertProgressBar />}
        </Component>
      </AlertContext.Provider>
    )
  }
)
AlertRoot.displayName = 'Alert'

export const Alert = Object.assign(AlertRoot, {
  Title: AlertTitle,
  Description: AlertDescription,
  Icon: AlertIcon,
  Action: AlertAction,
  CloseButton: AlertCloseButton,
  ProgressBar: AlertProgressBar,
})
