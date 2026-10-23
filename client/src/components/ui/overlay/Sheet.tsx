import * as React from 'react'
import { Dialog as RadixDialog } from 'radix-ui'
import { X } from 'lucide-react'
import { Button } from '../actions/Button'
import { cn } from '@/utils'

export const Sheet = RadixDialog.Root
export const SheetTrigger = RadixDialog.Trigger
export const SheetClose = RadixDialog.Close
export const SheetPortal = RadixDialog.Portal

export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay>
>(({ className, ...props }, ref) => (
  <RadixDialog.Overlay
    className={cn(
      'fixed inset-0 z-modal bg-surface-overlay/80 backdrop-blur-[2px] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = RadixDialog.Overlay.displayName

export type SheetSide = 'top' | 'bottom' | 'left' | 'right'

const sideVariants: Record<SheetSide, string> = {
  top: 'inset-x-0 top-0 border-b border-line-accent-subtle data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top max-h-[85vh]',
  bottom:
    'inset-x-0 bottom-0 border-t border-line-accent-subtle rounded-t-3xl data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom max-h-[90vh]',
  left: 'inset-y-0 left-0 h-full w-3/4 border-r border-line-accent-subtle data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
  right:
    'inset-y-0 right-0 h-full w-full sm:w-3/4 border-l border-line-accent-subtle data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-md',
}

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof RadixDialog.Content> {
  side?: SheetSide
  showCloseButton?: boolean
  showHandle?: boolean
}

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Content>,
  SheetContentProps
>(
  (
    {
      side = 'right',
      className,
      children,
      showCloseButton = true,
      showHandle = side === 'bottom',
      ...props
    },
    ref
  ) => (
    <SheetPortal>
      <SheetOverlay />
      <RadixDialog.Content
        ref={ref}
        className={cn(
          'fixed z-modal flex flex-col gap-4 bg-surface-card p-6 text-fg-primary shadow-2xl transition ease-in-out duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300 outline-hidden overflow-y-auto',
          sideVariants[side],
          className
        )}
        {...props}
      >
        {showHandle && (
          <div className="mx-auto -mt-2 mb-1 h-1.5 w-12 rounded-full bg-line-default shrink-0" />
        )}
        {children}
        {showCloseButton && (
          <RadixDialog.Close asChild>
            <Button
              variant="icon"
              size="sm"
              className="absolute right-4 top-4"
              aria-label="Đóng"
            >
              <X size={16} />
            </Button>
          </RadixDialog.Close>
        )}
      </RadixDialog.Content>
    </SheetPortal>
  )
)
SheetContent.displayName = RadixDialog.Content.displayName

export const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col space-y-1 text-left pr-8', className)}
    {...props}
  />
)
SheetHeader.displayName = 'SheetHeader'

export const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-auto pt-4 border-t border-line-subtle',
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = 'SheetFooter'

export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Title>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Title>
>(({ className, ...props }, ref) => (
  <RadixDialog.Title
    ref={ref}
    className={cn('text-lg font-bold text-fg-primary', className)}
    {...props}
  />
))
SheetTitle.displayName = RadixDialog.Title.displayName

export const SheetDescription = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Description>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Description>
>(({ className, ...props }, ref) => (
  <RadixDialog.Description
    ref={ref}
    className={cn('text-xs text-fg-dim', className)}
    {...props}
  />
))
SheetDescription.displayName = RadixDialog.Description.displayName
