import { type ChangeEvent } from 'react'
import { parse, isValid } from 'date-fns'
import type { DropdownProps } from 'react-day-picker'
import { Select } from './Select'
import { cn } from '@/utils'

export const DEFAULT_FROM_YEAR = 1900
export const DEFAULT_FUTURE_YEARS = 20

export const PARSE_FORMATS = [
  'yyyy-MM-dd',
  'yyyy/MM/dd',
  'dd/MM/yyyy',
  'd/M/yyyy',
  'dd-MM-yyyy',
  'd-M-yyyy',
  'dd.MM.yyyy',
  'ddMMyyyy',
  'yyyyMMdd',
  'dd/MM/yy',
]

export function tryParseUserInput(text: string): Date | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  for (const fmt of PARSE_FORMATS) {
    const d = parse(trimmed, fmt, new Date())
    if (isValid(d) && d.getFullYear() >= 1900 && d.getFullYear() <= 2100) {
      return d
    }
  }
  return null
}

export function resolveCalendarFromDate(fromDate?: Date, fromYear?: number): Date {
  if (fromDate) return fromDate
  return new Date(fromYear ?? DEFAULT_FROM_YEAR, 0, 1)
}

export function resolveCalendarToDate(
  toDate?: Date,
  toYear?: number,
  fromDate?: Date,
  currentYear = new Date().getFullYear()
): Date {
  if (toDate) return toDate
  if (toYear) return new Date(toYear, 11, 31)
  const baseYear = fromDate
    ? Math.max(currentYear + DEFAULT_FUTURE_YEARS, fromDate.getFullYear() + DEFAULT_FUTURE_YEARS)
    : currentYear + DEFAULT_FUTURE_YEARS
  return new Date(baseYear, 11, 31)
}

export function resolveInitialMonth(
  validSelected?: Date,
  defaultMonth?: Date,
  toDate?: Date
): Date | undefined {
  if (validSelected) return validSelected
  if (defaultMonth) return defaultMonth
  if (toDate && toDate.getTime() < Date.now()) return toDate
  return undefined
}

export function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function inRange(value: number, min: number, max: number, fallback: number): number {
  return Number.isInteger(value) && value >= min && value <= max ? value : fallback
}

export function CalendarDropdown({
  children,
  className,
  name,
  onChange,
  style,
  value,
  'aria-label': ariaLabel,
}: Readonly<DropdownProps>) {
  function handleValueChange(nextValue: string) {
    onChange?.({ target: { value: nextValue } } as ChangeEvent<HTMLSelectElement>)
  }

  return (
    <div className={className} style={style}>
      <Select
        name={name}
        ariaLabel={ariaLabel}
        className="rogym-date-picker__select"
        contentClassName="rogym-date-picker__select-content"
        value={String(value ?? '')}
        onValueChange={handleValueChange}
      >
        {children}
      </Select>
    </div>
  )
}

export function isDayPickerDropdownTarget(target: HTMLElement | null): boolean {
  if (!target) return false
  return Boolean(
    target.closest('.rogym-date-picker__select-content') ||
    target.closest('[data-radix-select-content]') ||
    target.closest('[data-radix-popper-content-wrapper]')
  )
}

export const dayPickerClassNames = {
  root: 'rdp rogym-date-picker',
  months: 'flex flex-col',
  month: 'space-y-1',
  caption: 'rogym-date-picker__caption',
  caption_dropdowns: 'rogym-date-picker__caption-dropdowns',
  caption_label: 'rogym-date-picker__caption-label',
  dropdown_month: 'rogym-date-picker__dropdown is-month',
  dropdown_year: 'rogym-date-picker__dropdown is-year',
  table: 'w-full border-collapse',
  head_row: 'flex',
  head_cell: 'text-fg-muted w-8 text-center text-xs font-normal pb-0.5',
  row: 'flex w-full mt-0.5',
  cell: 'h-8 w-8 text-center text-sm relative',
  day: cn(
    'h-8 w-8 p-0 font-normal rounded-lg',
    'text-fg-secondary',
    'hover:bg-action-primary hover:text-action-primary-fg',
    'transition-colors'
  ),
  day_selected: cn(
    'bg-action-primary text-action-primary-fg',
    'font-semibold',
    'hover:bg-action-primary-hover'
  ),
  day_today: 'border border-action-accent text-accent font-semibold',
  day_outside: 'text-fg-disabled opacity-40',
  day_disabled: 'text-fg-disabled/50 cursor-not-allowed',
  day_hidden: 'invisible',
} as const
