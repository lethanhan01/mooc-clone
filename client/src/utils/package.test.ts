import { describe, expect, it } from 'vitest'
import { parsePackageBenefits } from './package'

describe('parsePackageBenefits (package.ts)', () => {
  it('returns empty array when input is null or empty', () => {
    expect(parsePackageBenefits(null)).toEqual([])
    expect(parsePackageBenefits('')).toEqual([])
  })

  it('parses JSON string array correctly', () => {
    const jsonStr = JSON.stringify(['Khăn tập miễn phí', 'Tủ locker riêng', 'Xông hơi'])
    expect(parsePackageBenefits(jsonStr)).toEqual([
      'Khăn tập miễn phí',
      'Tủ locker riêng',
      'Xông hơi',
    ])
  })

  it('falls back to newline-delimited text if not valid JSON', () => {
    const newlineStr = 'Tập gym không giới hạn\n1 buổi định hướng HLV\nMiễn phí gửi xe\n'
    expect(parsePackageBenefits(newlineStr)).toEqual([
      'Tập gym không giới hạn',
      '1 buổi định hướng HLV',
      'Miễn phí gửi xe',
    ])
  })
})
