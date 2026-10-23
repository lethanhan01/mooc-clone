import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  Children,
  isValidElement,
} from 'react'
import { Select as RadixSelect, Popover as RadixPopover } from 'radix-ui'
import { useFormField } from './form-field-context'
import {
  SelectContext,
  EMPTY_SELECT_VALUE,
  normalizeSelectSize,
  filterOptions,
  extractOptionsFromChildren,
  type SelectContextValue,
  type SelectProps,
} from './select-utils'
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectSearchInput,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectEmpty,
} from './select-subcomponents'

export type { SelectOption, SelectOptionProps, SelectProps } from './select-utils'

export function Select({
  id,
  children,
  className,
  contentClassName,
  value,
  defaultValue = '',
  onValueChange,
  onChange,
  disabled,
  required,
  name,
  ariaLabel,
  error,
  size = 'md',
  inputSize,
  searchable = false,
  options,
  placeholder = 'Chọn một tùy chọn...',
  searchPlaceholder = 'Tìm kiếm...',
  emptyText = 'Không tìm thấy kết quả phù hợp.',
  clearable = true,
}: Readonly<SelectProps>) {
  const formField = useFormField()
  const resolvedId = id ?? formField?.id
  const resolvedDisabled = disabled ?? formField?.disabled ?? false
  const resolvedRequired = required ?? formField?.required ?? false
  const resolvedError = error ?? formField?.error
  const hasError = Boolean(resolvedError)
  const effectiveSize = normalizeSelectSize(size ?? inputSize)

  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const effectiveValue = isControlled ? value : internalValue
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  const hasLegacyOptions = useMemo(
    () => Children.toArray(children).some((c) => isValidElement(c) && c.type === 'option'),
    [children]
  )

  const rawOptions = useMemo(() => {
    if (options) return options
    if (hasLegacyOptions) return extractOptionsFromChildren(children)
    return []
  }, [options, hasLegacyOptions, children])

  const filteredOptions = useMemo(
    () => (searchable ? filterOptions(rawOptions, search) : rawOptions),
    [searchable, rawOptions, search]
  )

  const emptyOption = rawOptions.find((opt) => opt.value === '')
  const selectedValue = effectiveValue || (resolvedRequired ? '' : EMPTY_SELECT_VALUE)
  const isShorthand = Boolean(options) || hasLegacyOptions || !children

  const handleSelectValue = useCallback(
    (nextVal: string) => {
      const finalVal = nextVal === EMPTY_SELECT_VALUE ? '' : nextVal
      if (!isControlled) setInternalValue(finalVal)
      onValueChange?.(finalVal)
      onChange?.(finalVal)
      if (searchable) setOpen(false)
    },
    [isControlled, onValueChange, onChange, searchable]
  )

  const describedBy = [formField?.hasError ? formField.errorId : formField?.hintId]
    .filter(Boolean)
    .join(' ') || undefined

  const contextValue: SelectContextValue = useMemo(
    () => ({
      value: effectiveValue,
      onSelectValue: handleSelectValue,
      open,
      setOpen,
      searchable,
      search,
      setSearch,
      disabled: resolvedDisabled,
      required: resolvedRequired,
      size: effectiveSize,
      hasError,
      triggerId: resolvedId,
      listboxId: resolvedId ? `${resolvedId}-listbox` : 'rogym-select-listbox',
      describedBy,
      name,
      clearable,
      options: rawOptions,
      filteredOptions,
    }),
    [
      effectiveValue,
      handleSelectValue,
      open,
      searchable,
      search,
      resolvedDisabled,
      resolvedRequired,
      effectiveSize,
      hasError,
      resolvedId,
      describedBy,
      name,
      clearable,
      rawOptions,
      filteredOptions,
    ]
  )

  if (searchable) {
    return (
      <SelectContext.Provider value={contextValue}>
        <RadixPopover.Root open={open} onOpenChange={resolvedDisabled ? undefined : setOpen}>
          {name && <input type="hidden" name={name} value={effectiveValue} required={resolvedRequired} />}
          {isShorthand ? (
            <>
              <SelectTrigger className={className} ariaLabel={ariaLabel}>
                <SelectValue placeholder={placeholder ?? emptyOption?.label} />
              </SelectTrigger>
              <SelectContent className={contentClassName}>
                <SelectSearchInput placeholder={searchPlaceholder} />
                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {filteredOptions.length === 0 ? (
                    <SelectEmpty>{emptyText}</SelectEmpty>
                  ) : (
                    filteredOptions.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        disabled={opt.disabled}
                        icon={opt.icon}
                        badge={opt.badge}
                        description={opt.description}
                      >
                        {opt.label}
                      </SelectItem>
                    ))
                  )}
                </div>
              </SelectContent>
            </>
          ) : (
            children
          )}
        </RadixPopover.Root>
      </SelectContext.Provider>
    )
  }

  return (
    <SelectContext.Provider value={contextValue}>
      <RadixSelect.Root
        value={selectedValue}
        onValueChange={handleSelectValue}
        disabled={resolvedDisabled}
        required={resolvedRequired}
        name={name}
      >
        {isShorthand ? (
          <>
            <SelectTrigger className={className} ariaLabel={ariaLabel}>
              <SelectValue placeholder={placeholder ?? emptyOption?.label} />
            </SelectTrigger>
            <SelectContent className={contentClassName}>
              {filteredOptions
                .filter((opt) => !resolvedRequired || opt.value !== '')
                .map((opt) => (
                  <SelectItem
                    key={opt.value || EMPTY_SELECT_VALUE}
                    value={opt.value}
                    disabled={opt.disabled}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </>
        ) : (
          children
        )}
      </RadixSelect.Root>
    </SelectContext.Provider>
  )
}

Select.Trigger = SelectTrigger
Select.Value = SelectValue
Select.Content = SelectContent
Select.SearchInput = SelectSearchInput
Select.Group = SelectGroup
Select.Item = SelectItem
Select.Separator = SelectSeparator
Select.Empty = SelectEmpty

export {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectSearchInput,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectEmpty,
}
