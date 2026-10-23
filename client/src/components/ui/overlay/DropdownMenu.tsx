import * as React from 'react'
import { DropdownMenu as RadixDropdownMenu } from 'radix-ui'
import { Check, ChevronRight, Circle } from 'lucide-react'
import { cn } from '@/utils'

export const DropdownMenu = RadixDropdownMenu.Root
export const DropdownMenuTrigger = RadixDropdownMenu.Trigger
export const DropdownMenuGroup = RadixDropdownMenu.Group
export const DropdownMenuPortal = RadixDropdownMenu.Portal
export const DropdownMenuSub = RadixDropdownMenu.Sub
export const DropdownMenuRadioGroup = RadixDropdownMenu.RadioGroup

export const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <RadixDropdownMenu.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-lg px-2.5 py-2 text-sm text-fg-secondary outline-hidden transition-colors focus:bg-surface-card-hover focus:text-fg-primary data-[state=open]:bg-surface-card-hover',
      inset && 'pl-8',
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight size={14} className="ml-auto text-fg-dim" />
  </RadixDropdownMenu.SubTrigger>
))
DropdownMenuSubTrigger.displayName = RadixDropdownMenu.SubTrigger.displayName

export const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.SubContent>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.SubContent>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenu.SubContent
    ref={ref}
    className={cn(
      'z-dropdown min-w-[8rem] overflow-hidden rounded-xl border border-line-accent-subtle bg-surface-card p-1.5 text-fg-primary shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName = RadixDropdownMenu.SubContent.displayName

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Content>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Content>
>(({ className, sideOffset = 6, align = 'end', ...props }, ref) => (
  <RadixDropdownMenu.Portal>
    <RadixDropdownMenu.Content
      ref={ref}
      sideOffset={sideOffset}
      align={align}
      className={cn(
        'z-dropdown min-w-[10rem] overflow-hidden rounded-xl border border-line-accent-subtle bg-surface-card p-1.5 text-fg-primary shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </RadixDropdownMenu.Portal>
))
DropdownMenuContent.displayName = RadixDropdownMenu.Content.displayName

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Item>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Item> & {
    inset?: boolean
    destructive?: boolean
  }
>(({ className, inset, destructive, ...props }, ref) => (
  <RadixDropdownMenu.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-fg-secondary outline-hidden transition-colors focus:bg-surface-card-hover focus:text-fg-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
      inset && 'pl-8',
      destructive &&
        'text-status-danger-fg focus:bg-status-danger-bg focus:text-status-danger-fg data-[highlighted]:bg-status-danger-bg data-[highlighted]:text-status-danger-fg',
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = RadixDropdownMenu.Item.displayName

export const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <RadixDropdownMenu.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-2.5 text-sm text-fg-secondary outline-hidden transition-colors focus:bg-surface-card-hover focus:text-fg-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
      <RadixDropdownMenu.ItemIndicator>
        <Check size={14} className="text-action-accent" />
      </RadixDropdownMenu.ItemIndicator>
    </span>
    {children}
  </RadixDropdownMenu.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  RadixDropdownMenu.CheckboxItem.displayName

export const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.RadioItem>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.RadioItem>
>(({ className, children, ...props }, ref) => (
  <RadixDropdownMenu.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-2.5 text-sm text-fg-secondary outline-hidden transition-colors focus:bg-surface-card-hover focus:text-fg-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
      className
    )}
    {...props}
  >
    <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
      <RadixDropdownMenu.ItemIndicator>
        <Circle size={8} className="fill-action-accent text-action-accent" />
      </RadixDropdownMenu.ItemIndicator>
    </span>
    {children}
  </RadixDropdownMenu.RadioItem>
))
DropdownMenuRadioItem.displayName = RadixDropdownMenu.RadioItem.displayName

export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Label>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <RadixDropdownMenu.Label
    ref={ref}
    className={cn(
      'px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-fg-dim',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = RadixDropdownMenu.Label.displayName

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Separator>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Separator>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenu.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-line-subtle', className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = RadixDropdownMenu.Separator.displayName

export function DropdownMenuShortcut({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLSpanElement>>) {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest text-fg-dim', className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'
