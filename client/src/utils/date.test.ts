import { describe, expect, it } from 'vitest'
import { localDateTimeInputToIso } from './date'

describe('localDateTimeInputToIso', () => {
  it('converts a valid Vietnam local datetime to ISO', () => {
    expect(localDateTimeInputToIso('2026-07-27T02:27')).toBe('2026-07-26T19:27:00.000Z')
  })

  it.each(['', '2026-07-27T', '2026-07-27T24:00', '2026-02-30T10:00', 'not-a-date'])(
    'returns an empty value for invalid input %p',
    (value) => {
      expect(localDateTimeInputToIso(value)).toBe('')
    },
  )
})
