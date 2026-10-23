import * as React from 'react'
import { Tooltip as RadixTooltip } from 'radix-ui'
import { cn } from '@/utils'

export const TooltipProvider = RadixTooltip.Provider
export const TooltipRoot = RadixTooltip.Root
export const TooltipTrigger = RadixTooltip.Trigger
export const TooltipPortal = RadixTooltip.Portal

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof RadixTooltip.Content>,
  React.ComponentPropsWithoutRef<typeof RadixTooltip.Content> & {
    showArrow?: boolean
  }
>(({ className, sideOffset = 6, showArrow = true, children, ...props }, ref) => (
  <RadixTooltip.Portal>
    <RadixTooltip.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-toast max-w-xs overflow-hidden rounded-lg border border-line-accent-subtle bg-surface-card px-3 py-1.5 text-xs text-fg-primary shadow-xl backdrop-blur-md duration-150 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-1.5 data-[side=left]:slide-in-from-right-1.5 data-[side=right]:slide-in-from-left-1.5 data-[side=top]:slide-in-from-bottom-1.5',
        className
      )}
      {...props}
    >
      {children}
      {showArrow && (
        <RadixTooltip.Arrow className="fill-surface-card stroke-line-accent-subtle" />
      )}
    </RadixTooltip.Content>
  </RadixTooltip.Portal>
))
TooltipContent.displayName = RadixTooltip.Content.displayName

export interface TooltipProps {
  content?: React.ReactNode
  label?: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  disabled?: boolean
  className?: string
  showArrow?: boolean
}

/**
 * Convenient shorthand Tooltip component.
 * Usage: <Tooltip content="Edit profile"><Button .../></Tooltip>
 */
export function Tooltip({
  content,
  label,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  disabled = false,
  className,
  showArrow = true,
}: Readonly<TooltipProps>) {
  const tooltipText = content ?? label
  if (disabled || !tooltipText) {
    return <>{children}</>
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align} showArrow={showArrow} className={className}>
          {tooltipText}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}
