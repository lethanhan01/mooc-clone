import i18n from '@/lib/i18n'


function getIntlLocale(): string {
  return i18n.language === 'ja' ? 'ja-JP' : 'vi-VN'
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return i18n.t('common:date.notAvailable')
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return i18n.t('common:date.invalid')
  return new Intl.DateTimeFormat(getIntlLocale(), {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return i18n.t('common:date.notAvailable')
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return i18n.t('common:date.invalid')
  return new Intl.DateTimeFormat(getIntlLocale(), {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatTime(value?: string | Date | null): string {
  if (!value) return i18n.t('common:date.notAvailable')
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return i18n.t('common:date.invalid')
  return new Intl.DateTimeFormat(getIntlLocale(), {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function toDateInput(value?: string | Date | null): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function toDateTimeLocalInput(value?: string | Date | null): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`
}

export function localDateTimeInputToIso(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match) return ''

  const [, yearValue, monthValue, dayValue, hourValue, minuteValue] = match
  const year = Number(yearValue)
  const month = Number(monthValue)
  const day = Number(dayValue)
  const hour = Number(hourValue)
  const minute = Number(minuteValue)
  const localDate = new Date(Date.UTC(year, month - 1, day, hour, minute))

  if (
    localDate.getUTCFullYear() !== year ||
    localDate.getUTCMonth() !== month - 1 ||
    localDate.getUTCDate() !== day ||
    localDate.getUTCHours() !== hour ||
    localDate.getUTCMinutes() !== minute
  ) {
    return ''
  }

  return new Date(localDate.getTime() - 7 * 60 * 60 * 1000).toISOString()
}

export function startOfLocalDayIso(dateInput: string): string {
  return new Date(`${dateInput}T00:00:00+07:00`).toISOString()
}

export function endOfLocalDayIso(dateInput: string): string {
  return new Date(`${dateInput}T23:59:59.999+07:00`).toISOString()
}

export function todayInput(): string {
  return toDateInput(new Date())
}

export function monthStart(): string {
  const now = new Date()
  return toDateInput(new Date(now.getFullYear(), now.getMonth(), 1))
}
