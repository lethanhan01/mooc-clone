/**
 * Centralized Internationalization Formatters (STD-TIME-002, I18N-003)
 * Provides high-performance memoized formatters for currency, dates, and numbers using native Intl API.
 */

// Memoized Cache for Intl instances to avoid costly instantiations
const numberFormatCache = new Map<string, Intl.NumberFormat>()
const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>()

function getNumberFormatter(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const cacheKey = `${locale}-${JSON.stringify(options)}`
  let formatter = numberFormatCache.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options)
    numberFormatCache.set(cacheKey, formatter)
  }
  return formatter
}

function getDateTimeFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const cacheKey = `${locale}-${JSON.stringify(options)}`
  let formatter = dateTimeFormatCache.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options)
    dateTimeFormatCache.set(cacheKey, formatter)
  }
  return formatter
}

/**
 * Formats an amount with the specified currency and locale.
 */
export function formatCurrency(
  amount: number | string,
  currency: 'VND' | 'USD' | 'JPY' | string = 'VND',
  locale = 'vi-VN'
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0 ₫'

  const formatter = getNumberFormatter(locale, {
    style: 'currency',
    currency,
  })
  return formatter.format(num)
}

/**
 * Standard Vietnam Dong (VND) formatter (SSOT consolidated from currency.ts).
 */
export function formatVnd(amount: number | string): string {
  return formatCurrency(amount, 'VND', 'vi-VN')
}

/**
 * Compact VND formatter for large amounts (e.g., 1 Tr, 10 Tr).
 */
export function formatVndCompact(amount: number | string, locale = 'vi-VN'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0'

  const formatter = getNumberFormatter(locale, {
    style: 'currency',
    currency: 'VND',
    notation: 'compact',
    maximumFractionDigits: 1,
  })
  return formatter.format(num)
}

/**
 * Formats a date value with locale-aware format options.
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
  locale = 'vi-VN'
): string {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''

  const formatter = getDateTimeFormatter(locale, options)
  return formatter.format(d)
}

/**
 * Formats standard numbers with grouping separators.
 */
export function formatNumber(
  value: number | string,
  options: Intl.NumberFormatOptions = {},
  locale = 'vi-VN'
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'

  const formatter = getNumberFormatter(locale, options)
  return formatter.format(num)
}
