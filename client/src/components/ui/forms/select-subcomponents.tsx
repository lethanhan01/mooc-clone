import { forwardRef, useRef, useEffect, type Ref, type ReactNode } from 'react'
import { Check, ChevronDown, ChevronsUpDown, Search, X } from 'lucide-react'
import { Select as RadixSelect, Popover as RadixPopover } from 'radix-ui'
import { cn } from '@/utils'
import {
  useSelectContext,
  selectTriggerVariants,
  selectContentVariants,
  selectItemVariants,
  EMPTY_SELECT_VALUE,
  type SelectTriggerProps,
  type SelectValueProps,
  type SelectContentProps,
  type SelectSearchInputProps,
  type SelectGroupProps,
  type SelectItemProps,
} from './select-utils'

export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger({ className, children, id, ariaLabel, ...props }, ref) {
    const ctx = useSelectContext()
    const resolvedId = id ?? ctx.triggerId
    const triggerClass = cn(
      selectTriggerVariants({ size: ctx.size, hasError: ctx.hasError }),
      ctx.searchable && 'group',
      className
    )

    if (!ctx.searchable) {
      return (
        <RadixSelect.Trigger
          ref={ref}
          id={resolvedId}
          className={triggerClass}
          aria-label={ariaLabel}
          aria-invalid={ctx.hasError}
          aria-describedby={ctx.describedBy}
          disabled={ctx.disabled}
          data-no-sweep
          {...props}
        >
          {children}
          <RadixSelect.Icon className="inline-flex shrink-0 text-fg-dim"><ChevronDown size={17} /></RadixSelect.Icon>
        </RadixSelect.Trigger>
      )
    }

    const selectedOption = ctx.options.find((opt) => opt.value === ctx.value)
    const listboxId = ctx.listboxId ?? (resolvedId ? `${resolvedId}-listbox` : 'rogym-select-listbox')

    return (
      <div className={triggerClass}>
        <RadixPopover.Trigger asChild>
          <button
            ref={ref}
            type="button"
            role="combobox" // NOSONAR
            aria-controls={listboxId}
            aria-expanded={ctx.open}
            aria-label={ariaLabel}
            aria-invalid={ctx.hasError}
            aria-describedby={ctx.describedBy}
            id={resolvedId}
            disabled={ctx.disabled}
            className="flex items-center gap-2.5 min-w-0 flex-1 text-left bg-transparent border-0 p-0 outline-hidden cursor-pointer"
            {...props}
          >
            {children}
          </button>
        </RadixPopover.Trigger>
        <div className="flex items-center gap-1 shrink-0 text-fg-dim">
          {ctx.clearable && selectedOption && !ctx.disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                ctx.onSelectValue('')
              }}
              className="p-0.5 rounded-md hover:bg-surface-card-hover hover:text-fg-primary transition-colors cursor-pointer"
              aria-label="Xóa lựa chọn"
            >
              <X size={14} />
            </button>
          )}
          <ChevronsUpDown size={15} className="opacity-60 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    )
  }
)
SelectTrigger.displayName = 'SelectTrigger'

export function SelectValue({ className, placeholder }: Readonly<SelectValueProps>) {
  const { searchable, value, options } = useSelectContext()
  if (!searchable) return <RadixSelect.Value className={className} placeholder={placeholder} />

  const selected = options.find((opt) => opt.value === value)
  return (
    <div className={cn('flex items-center gap-2 min-w-0 flex-1', className)}>
      {selected?.icon && <span className="shrink-0 text-fg-dim">{selected.icon}</span>}
      {selected ? (
        <span className="truncate text-fg-primary font-medium">{selected.label}</span>
      ) : (
        <span className="truncate text-fg-dim">{placeholder}</span>
      )}
      {selected?.badge && <span className="shrink-0">{selected.badge}</span>}
    </div>
  )
}

export const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  function SelectContent({ className, children, sideOffset = 8, align = 'start' }, ref) {
    const { searchable } = useSelectContext()
    if (!searchable) {
      return (
        <RadixSelect.Portal>
          <RadixSelect.Content ref={ref} className={cn(selectContentVariants({ searchable: false }), className)} position="popper" sideOffset={sideOffset} align={align}>
            <RadixSelect.Viewport className="p-1">{children}</RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      )
    }

    return (
      <RadixPopover.Portal>
        <RadixPopover.Content ref={ref} sideOffset={sideOffset} align={align} className={cn('w-[var(--radix-popover-trigger-width)]', selectContentVariants({ searchable: true }), className)}>
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    )
  }
)
SelectContent.displayName = 'SelectContent'

export const SelectSearchInput = forwardRef<HTMLInputElement, SelectSearchInputProps>(
  function SelectSearchInput({ className, placeholder = 'Tìm kiếm...', inputRef, ...props }, ref) {
    const { search, setSearch, open } = useSelectContext()
    const internalRef = useRef<HTMLInputElement>(null)
    const resolvedRef = (ref ?? inputRef ?? internalRef) as React.RefObject<HTMLInputElement>

    useEffect(() => {
      if (open) {
        const timer = setTimeout(() => resolvedRef.current?.focus(), 50)
        return () => clearTimeout(timer)
      }
    }, [open, resolvedRef])

    return (
      <div className="relative mb-2 flex items-center border-b border-line-subtle pb-2 px-1">
        <Search size={15} className="absolute left-2.5 text-fg-dim" />
        <input
          ref={resolvedRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-lg bg-surface-sunken py-1.5 pl-8 pr-3 text-xs text-fg-primary placeholder:text-fg-disabled focus:outline-hidden focus:ring-1 focus:ring-line-focus',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
SelectSearchInput.displayName = 'SelectSearchInput'

export function SelectGroup({ label, children, className, ...props }: Readonly<SelectGroupProps>) {
  const { searchable } = useSelectContext()
  if (!searchable) {
    return (
      <RadixSelect.Group className={className}>
        {label && <RadixSelect.Label className="px-3 py-1.5 text-[11px] font-semibold text-fg-dim uppercase tracking-wider">{label}</RadixSelect.Label>}
        {children}
      </RadixSelect.Group>
    )
  }

  return (
    <div className={cn('py-1', className)} {...props}>
      {label && <p className="px-3 py-1.5 text-[11px] font-semibold text-fg-dim uppercase tracking-wider">{label}</p>}
      {children}
    </div>
  )
}

export const SelectItem = forwardRef<HTMLButtonElement | HTMLDivElement, SelectItemProps>(
  function SelectItem({ value, disabled, children, className, icon, badge, description }, ref) {
    const { searchable, size, value: selectedValue, onSelectValue } = useSelectContext()

    if (!searchable) {
      const optionValue = value || EMPTY_SELECT_VALUE
      return (
        <RadixSelect.Item
          ref={ref as Ref<HTMLDivElement>}
          className={cn(selectItemVariants({ size }), 'justify-between pl-3 pr-8', className)}
          value={optionValue}
          disabled={disabled}
        >
          <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
          <RadixSelect.ItemIndicator className="absolute right-2 inline-flex items-center text-action-accent">
            <Check size={15} />
          </RadixSelect.ItemIndicator>
        </RadixSelect.Item>
      )
    }

    const isSelected = value === selectedValue
    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        disabled={disabled}
        onClick={() => onSelectValue(value)}
        className={cn(selectItemVariants({ size, isSelected, disabled }), 'justify-between gap-2.5', className)}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {icon && <span className="shrink-0">{icon}</span>}
          <div className="min-w-0 flex-1">
            <p className="truncate">{children}</p>
            {description && <p className="text-[10px] text-fg-dim truncate">{description}</p>}
          </div>
          {badge && <span className="shrink-0">{badge}</span>}
        </div>
        {isSelected && <Check size={14} className="text-action-accent shrink-0" />}
      </button>
    )
  }
)
SelectItem.displayName = 'SelectItem'

export function SelectSeparator({ className }: Readonly<{ className?: string }>) {
  const { searchable } = useSelectContext()
  if (!searchable) return <RadixSelect.Separator className={cn('h-px my-1 bg-line-subtle', className)} />
  return <hr className={cn('h-px my-1 border-0 bg-line-subtle', className)} />
}

export function SelectEmpty({ children, className }: Readonly<{ children?: ReactNode; className?: string }>) {
  return <p className={cn('py-6 text-center text-xs text-fg-dim', className)}>{children ?? 'Không tìm thấy kết quả phù hợp.'}</p>
}
