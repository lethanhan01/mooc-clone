import { describe, expect, it } from 'vitest'
import { scoreTone, scoreColor, scoreLabel } from './score-utils'
import { SEMANTIC_TOKEN_COLORS } from '@/styles/token-values'

describe('score-utils (score-utils.ts)', () => {
  it('correctly calculates scoreTone based on threshold', () => {
    expect(scoreTone(null)).toBe('neutral')
    expect(scoreTone(1.0)).toBe('success')
    expect(scoreTone(1.5)).toBe('success')
    expect(scoreTone(2.0)).toBe('warning')
    expect(scoreTone(2.5)).toBe('warning')
    expect(scoreTone(3.0)).toBe('danger')
  })

  it('correctly maps semantic token colors via scoreColor', () => {
    expect(scoreColor(null)).toBe(SEMANTIC_TOKEN_COLORS.fgMuted)
    expect(scoreColor(1.2)).toBe(SEMANTIC_TOKEN_COLORS.statusSuccessSolid)
    expect(scoreColor(2.2)).toBe(SEMANTIC_TOKEN_COLORS.statusWarningSolid)
    expect(scoreColor(3.5)).toBe(SEMANTIC_TOKEN_COLORS.statusDangerSolid)
  })

  it('formats scoreLabel to 1 decimal place or dash', () => {
    expect(scoreLabel(null)).toBe('—')
    expect(scoreLabel(2)).toBe('2.0')
    expect(scoreLabel(1.75)).toBe('1.8')
  })
})
