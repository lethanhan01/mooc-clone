import { cn } from '@/utils'
import { Select, type SelectOption, type SelectProps } from './Select'

export type ComboboxOption = SelectOption

export interface ComboboxProps extends Omit<SelectProps, 'searchable' | 'options'> {
  options: ComboboxOption[]
  triggerClassName?: string
}

/**
 * @deprecated Sử dụng `<Select searchable={true} ... />` thay thế để tuân thủ kiến trúc RoGym UI Primitives All-in-One.
 */
export function Combobox({
  className,
  triggerClassName,
  ...props
}: Readonly<ComboboxProps>) {
  return (
    <Select
      searchable
      className={cn(className, triggerClassName)}
      {...props}
    />
  )
}
