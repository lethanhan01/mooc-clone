import { describe, expect, it } from 'vitest'
import { formatVnd, formatVndCompact } from './currency'

describe('currency formatters (currency.ts)', () => {
  it('formats regular amounts as standard VND with currency symbol', () => {
    expect(formatVnd(1500000).replace(/\s+/g, ' ')).toMatch(/1\.500\.000\s*₫/)
    expect(formatVnd(0).replace(/\s+/g, ' ')).toMatch(/0\s*₫/)
  })

  it('formats compact amounts into friendly Vietnamese abbreviations', () => {
    expect(formatVndCompact(15000000).replace(/\s+/g, ' ')).toMatch(/15\s*Tr\s*₫/)
    expect(formatVndCompact(1500000).replace(/\s+/g, ' ')).toMatch(/1,5\s*Tr\s*₫/)
    expect(formatVndCompact(500000).replace(/\s+/g, ' ')).toMatch(/500\s*N\s*₫/)
  })
})
