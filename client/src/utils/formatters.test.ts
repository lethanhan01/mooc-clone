import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatVnd,
  formatVndCompact,
  formatDate,
  formatNumber,
} from './formatters'

describe('Centralized Formatters (formatters.ts)', () => {
  describe('formatCurrency & formatVnd', () => {
    it('formats VND currency with correct symbol and grouping', () => {
      const formatted = formatVnd(500000)
      // Normalizing non-breaking space for node Intl output
      expect(formatted.replace(/\s+/g, ' ')).toMatch(/500\.000\s*₫/)
    })

    it('formats other currencies like USD and JPY', () => {
      const usd = formatCurrency(100, 'USD', 'en-US')
      expect(usd).toBe('$100.00')

      const jpy = formatCurrency(1000, 'JPY', 'ja-JP')
      expect(jpy).toBe('￥1,000')
    })

    it('handles string input and NaN gracefully', () => {
      expect(formatVnd('1500000').replace(/\s+/g, ' ')).toMatch(/1\.500\.000\s*₫/)
      expect(formatVnd('invalid')).toBe('0 ₫')
    })
  })

  describe('formatVndCompact', () => {
    it('formats large VND amounts into compact notation', () => {
      const compact = formatVndCompact(1000000)
      expect(compact).toBeDefined()
      expect(compact.length).toBeLessThan(15)
    })
  })

  describe('formatDate', () => {
    it('formats ISO-8601 UTC date string into locale date', () => {
      const formatted = formatDate('2026-10-15T08:30:00.000Z', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      expect(formatted).toBeDefined()
      expect(formatted).toContain('2026')
    })

    it('handles empty or invalid date safely', () => {
      expect(formatDate('')).toBe('')
      expect(formatDate('invalid-date')).toBe('')
    })
  })

  describe('formatNumber', () => {
    it('formats number with grouping separators', () => {
      const formatted = formatNumber(1234567.89, { maximumFractionDigits: 2 })
      expect(formatted).toMatch(/1\.234\.567,89|1,234,567\.89/)
    })
  })
})
