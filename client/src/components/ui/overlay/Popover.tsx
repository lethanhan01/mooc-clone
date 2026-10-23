import * as React from 'react'
import { Popover as RadixPopover } from 'radix-ui'
import { cn } from '@/utils'

export const Popover = RadixPopover.Root
export const PopoverTrigger = RadixPopover.Trigger
export const PopoverAnchor = RadixPopover.Anchor
export const PopoverPortal = RadixPopover.Portal
export const PopoverClose = RadixPopover.Close

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof RadixPopover.Content>,
  React.ComponentPropsWithoutRef<typeof RadixPopover.Content> & {
    showArrow?: boolean
  }
>(({ className, align = 'center', sideOffset = 6, showArrow = false, children, ...props }, ref) => (
  <RadixPopover.Portal>
    <RadixPopover.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-dropdown w-72 rounded-2xl border border-line-accent-subtle bg-surface-card p-4 text-fg-primary shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl outline-hidden duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    >
      {children}
      {showArrow && (
        <RadixPopover.Arrow className="fill-surface-card stroke-line-accent-subtle" />
      )}
    </RadixPopover.Content>
  </RadixPopover.Portal>
))
PopoverContent.displayName = RadixPopover.Content.displayName
