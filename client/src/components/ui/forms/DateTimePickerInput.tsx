import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { Popover } from 'radix-ui'
import { Calendar, Clock3 } from 'lucide-react'
import { format, parse, isValid } from 'date-fns'
import { vi, ja } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils'
import { Button } from '../actions/Button'
import { Input } from './Input'
import {
  CalendarDropdown,
  dayPickerClassNames,
  inRange,
  isDayPickerDropdownTarget,
  pad,
  resolveCalendarFromDate,
  resolveCalendarToDate,
} from './date-picker-utils'
import 'react-day-picker/dist/style.css'

export interface DateTimePickerInputProps {
  value: string // format: 'yyyy-MM-ddTHH:mm'
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  min?: string // 'yyyy-MM-dd' or 'yyyy-MM-ddTHH:mm'
  max?: string
  fromYear?: number
  toYear?: number
  'aria-label'?: string
  className?: string
  minuteStep?: number
  error?: boolean | string
}

function parseIsoDate(datePart?: string): Date | undefined {
  if (!datePart) return undefined
  const parsed = parse(datePart, 'yyyy-MM-dd', new Date())
  return isValid(parsed) ? parsed : undefined
}

function parseBoundDate(val?: string): Date | undefined {
  if (!val) return undefined
  const parsed = parse(val.slice(0, 10), 'yyyy-MM-dd', new Date())
  return isValid(parsed) ? parsed : undefined
}

function parseTimePart(timePart?: string): { hour: number | undefined; minute: number | undefined } {
  if (!timePart) return { hour: undefined, minute: undefined }
  const [hStr, mStr] = timePart.split(':')
  return {
    hour: hStr ? Number.parseInt(hStr, 10) : undefined,
    minute: mStr ? Number.parseInt(mStr, 10) : undefined,
  }
}

function formatDisplayValue(
  validDate?: Date,
  hour?: number,
  minute?: number
): string {
  if (!validDate) return ''
  const dateStr = format(validDate, 'dd/MM/yyyy')
  if (hour === undefined) return dateStr
  return `${dateStr} ${pad(hour)}:${pad(minute ?? 0)}`
}

export function DateTimePickerInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  min,
  max,
  fromYear,
  toYear,
  'aria-label': ariaLabel,
  className,
  minuteStep = 5,
  error,
}: Readonly<DateTimePickerInputProps>) {
  const { t, i18n } = useTranslation('common')
  const effectivePlaceholder = placeholder ?? t('datePicker.placeholder', 'DD/MM/YYYY HH:mm')
  const calendarLocale = i18n.language === 'ja' ? ja : vi
  const [open, setOpen] = useState(false)

  const [datePart, timePart] = (value || '').split('T')
  const validDate = parseIsoDate(datePart)
  const { hour: selectedHour, minute: selectedMinute } = parseTimePart(timePart)

  const fromDate = parseBoundDate(min)
  const toDate = parseBoundDate(max)
  const calendarFromDate = resolveCalendarFromDate(fromDate, fromYear)
  const calendarToDate = resolveCalendarToDate(toDate, toYear, fromDate)

  function handleDateSelect(date: Date | undefined) {
    if (!date) return
    const d = format(date, 'yyyy-MM-dd')
    const h = inRange(selectedHour ?? 8, 0, 23, 8)
    const m = inRange(selectedMinute ?? 0, 0, 59, 0)
    onChange(`${d}T${pad(h)}:${pad(m)}`)
  }

  function handleHourSelect(h: number) {
    const d = validDate ? format(validDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    const m = inRange(selectedMinute ?? 0, 0, 59, 0)
    onChange(`${d}T${pad(inRange(h, 0, 23, selectedHour ?? 8))}:${pad(m)}`)
  }

  function handleMinuteSelect(m: number) {
    const d = validDate ? format(validDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    const h = inRange(selectedHour ?? 8, 0, 23, 8)
    onChange(`${d}T${pad(h)}:${pad(inRange(m, 0, 59, selectedMinute ?? 0))}`)
  }

  const displayValue = formatDisplayValue(validDate, selectedHour, selectedMinute)

  return (
    <Popover.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            'flex items-center justify-between gap-2 text-left min-h-[44px] w-full font-normal',
            !displayValue && 'text-fg-disabled',
            error && 'border-status-danger-border focus:border-status-danger-fg focus:ring-1 focus:ring-status-danger-border',
            className
          )}
        >
          <span>{displayValue || effectivePlaceholder}</span>
          <Calendar size={16} className="shrink-0 text-fg-muted" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="rogym-date-picker__popover"
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
            selected={validDate}
            onSelect={handleDateSelect}
            locale={calendarLocale}
            fromDate={calendarFromDate}
            toDate={calendarToDate}
            captionLayout="dropdown"
            components={{ Dropdown: CalendarDropdown }}
            showOutsideDays
            classNames={dayPickerClassNames}
          />

          {/* Time picker section with explicit accessible labels */}
          <div className="mt-2 border-t border-line-subtle pt-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Clock3 size={13} className="text-fg-muted" />
              <span className="text-xs font-medium text-fg-secondary">
                {t('datePicker.time', 'Thời gian')}
              </span>
              {selectedHour !== undefined && (
                <span className="ml-auto font-mono text-sm font-semibold text-action-accent">
                  {pad(selectedHour)}:{pad(selectedMinute ?? 0)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={23}
                step={1}
                aria-label={t('common:time.hour', 'Giờ (HH)')}
                value={selectedHour ?? ''}
                onChange={(e) => handleHourSelect(Number(e.target.value))}
                className="w-16 text-center font-mono min-h-[44px]"
                placeholder="HH"
              />
              <span className="text-base font-bold text-fg-muted select-none">:</span>
              <Input
                type="number"
                min={0}
                max={59}
                step={minuteStep}
                aria-label={t('common:time.minute', 'Phút (MM)')}
                value={selectedMinute ?? ''}
                onChange={(e) => handleMinuteSelect(Number(e.target.value))}
                className="w-16 text-center font-mono min-h-[44px]"
                placeholder="MM"
              />
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
