import { useEffect, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { Popover } from 'radix-ui'
import { Calendar } from 'lucide-react'
import { format, parse, isValid, isAfter, isBefore } from 'date-fns'
import { vi, ja } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils'
import { Input } from './Input'
import { Button } from '../actions/Button'
import {
  CalendarDropdown,
  dayPickerClassNames,
  isDayPickerDropdownTarget,
  resolveCalendarFromDate,
  resolveCalendarToDate,
  resolveInitialMonth,
  tryParseUserInput,
} from './date-picker-utils'
import 'react-day-picker/dist/style.css'

export interface DatePickerInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  min?: string
  max?: string
  fromYear?: number
  toYear?: number
  'aria-label'?: string
  required?: boolean
  className?: string
  error?: boolean | string
  defaultMonth?: Date
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  disabled = false,
  min,
  max,
  fromYear,
  toYear,
  'aria-label': ariaLabel,
  required = false,
  className,
  error,
  defaultMonth,
}: Readonly<DatePickerInputProps>) {
  const { t, i18n } = useTranslation('common')
  const calendarLocale = i18n.language === 'ja' ? ja : vi
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [inputText, setInputText] = useState('')

  const selected = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const validSelected = selected && isValid(selected) ? selected : undefined

  const parsedMin = min ? parse(min, 'yyyy-MM-dd', new Date()) : undefined
  const parsedMax = max ? parse(max, 'yyyy-MM-dd', new Date()) : undefined
  const fromDate = parsedMin && isValid(parsedMin) ? parsedMin : undefined
  const toDate = parsedMax && isValid(parsedMax) ? parsedMax : undefined
  const calendarFromDate = resolveCalendarFromDate(fromDate, fromYear)
  const calendarToDate = resolveCalendarToDate(toDate, toYear, fromDate)
  const initialMonth = resolveInitialMonth(validSelected, defaultMonth, toDate)
  const formattedSelected = validSelected ? format(validSelected, 'dd/MM/yyyy') : ''

  // Sync display text from external value when not actively typing
  useEffect(() => {
    if (!focused) {
      setInputText(formattedSelected)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function handleSelect(date: Date | undefined) {
    if (!date) return
    onChange(format(date, 'yyyy-MM-dd'))
    setOpen(false)
  }

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value
    setInputText(text)

    if (text === '') {
      onChange('')
      return
    }

    const parsed = tryParseUserInput(text)
    if (parsed) {
      if (isBefore(parsed, calendarFromDate) || isAfter(parsed, calendarToDate)) return
      onChange(format(parsed, 'yyyy-MM-dd'))
    }
  }

  function handleFocus() {
    setFocused(true)
    setOpen(true)
  }

  function handleBlur() {
    setFocused(false)
    const trimmed = inputText.trim()
    if (trimmed) {
      const parsed = tryParseUserInput(trimmed)
      if (parsed && !isBefore(parsed, calendarFromDate) && !isAfter(parsed, calendarToDate)) {
        const formatted = format(parsed, 'yyyy-MM-dd')
        if (formatted !== value) {
          onChange(formatted)
        }
        setInputText(format(parsed, 'dd/MM/yyyy'))
        return
      }
    }
    // Normalize to canonical display format, or clear if input can't be parsed
    setInputText(formattedSelected)
  }

  const displayText = focused ? inputText : formattedSelected

  return (
    <Popover.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
      <Popover.Anchor asChild>
        <div className={cn('relative', className)}>
          <Input
            type="text"
            disabled={disabled}
            required={required}
            aria-label={ariaLabel}
            error={error}
            value={displayText}
            onChange={handleTextChange}
            onFocus={handleFocus}
            onClick={() => setOpen(true)}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn('pr-10', !displayText && 'placeholder:text-fg-disabled')}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => setOpen(!open)}
            className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center min-w-[44px] min-h-[44px] h-full text-fg-muted hover:text-fg-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50 bg-transparent hover:bg-transparent"
            aria-label={t('datePicker.open', 'Mở lịch')}
          >
            <Calendar size={16} className="shrink-0" />
          </Button>
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="rogym-date-picker__popover rogym-date-picker__popover--compact"
          onPointerDownOutside={(e) => {
            if (isDayPickerDropdownTarget(e.target as HTMLElement | null)) {
              e.preventDefault()
            }
          }}
          onInteractOutside={(e) => {
            if (isDayPickerDropdownTarget(e.target as HTMLElement | null)) {
              e.preventDefault()
            }
          }}
        >
          <DayPicker
            mode="single"
            selected={validSelected}
            onSelect={handleSelect}
            defaultMonth={initialMonth}
            locale={calendarLocale}
            fromDate={calendarFromDate}
            toDate={calendarToDate}
            captionLayout="dropdown"
            components={{ Dropdown: CalendarDropdown }}
            showOutsideDays
            classNames={dayPickerClassNames}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
