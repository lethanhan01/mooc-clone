import { describe, it, expect } from 'vitest'
import { TONES, EMPHASES, SIZES, isValidTone, isValidEmphasis, isValidSize } from '../variants'
import { TONE_STYLES, toneClasses } from '../tone-styles'

describe('Semantic Variants & Tone Styles Engine', () => {
  describe('variants.ts contracts', () => {
    it('defines the standard 6 business intent tones', () => {
      expect(TONES).toEqual(['success', 'warning', 'danger', 'info', 'neutral', 'accent'])
      expect(TONES).toHaveLength(6)
    })

    it('defines the standard 3 emphasis visual levels', () => {
      expect(EMPHASES).toEqual(['solid', 'subtle', 'outline'])
      expect(EMPHASES).toHaveLength(3)
    })

    it('defines standard 5 Tailwind spacing scale sizes', () => {
      expect(SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl'])
      expect(SIZES).toHaveLength(5)
    })

    it('validates tones correctly with isValidTone', () => {
      expect(isValidTone('success')).toBe(true)
      expect(isValidTone('warning')).toBe(true)
      expect(isValidTone('danger')).toBe(true)
      expect(isValidTone('info')).toBe(true)
      expect(isValidTone('neutral')).toBe(true)
      expect(isValidTone('accent')).toBe(true)
      // Disallowed legacy names
      expect(isValidTone('error')).toBe(false)
      expect(isValidTone('muted')).toBe(false)
      expect(isValidTone('teal')).toBe(false)
      expect(isValidTone('purple')).toBe(false)
      expect(isValidTone('')).toBe(false)
      expect(isValidTone(null)).toBe(false)
    })

    it('validates emphases correctly with isValidEmphasis', () => {
      expect(isValidEmphasis('solid')).toBe(true)
      expect(isValidEmphasis('subtle')).toBe(true)
      expect(isValidEmphasis('outline')).toBe(true)
      expect(isValidEmphasis('filled')).toBe(false)
      expect(isValidEmphasis('')).toBe(false)
    })

    it('validates sizes correctly with isValidSize', () => {
      expect(isValidSize('xs')).toBe(true)
      expect(isValidSize('sm')).toBe(true)
      expect(isValidSize('md')).toBe(true)
      expect(isValidSize('lg')).toBe(true)
      expect(isValidSize('xl')).toBe(true)
      expect(isValidSize('default')).toBe(false)
      expect(isValidSize('compact')).toBe(false)
      expect(isValidSize('wide')).toBe(false)
    })
  })

  describe('tone-styles.ts matrix', () => {
    it('provides valid CSS classes for all 18 combinations (6 Tones × 3 Emphases)', () => {
      let count = 0
      for (const tone of TONES) {
        for (const emphasis of EMPHASES) {
          count++
          const classString = TONE_STYLES[tone][emphasis]
          expect(typeof classString).toBe('string')
          expect(classString.length).toBeGreaterThan(0)
          expect(classString).not.toContain('undefined')
          expect(classString).not.toContain('null')
          // Must not contain arbitrary pixels or raw hex in utility classes
          expect(classString).not.toMatch(/\[\d+px\]/)
          expect(classString).not.toMatch(/#[\da-fA-F]{3,8}/)
        }
      }
      expect(count).toBe(18)
    })

    it('helper function toneClasses returns identical matrix mapping', () => {
      for (const tone of TONES) {
        for (const emphasis of EMPHASES) {
          expect(toneClasses(tone, emphasis)).toBe(TONE_STYLES[tone][emphasis])
        }
      }
    })

    it('defaults toneClasses to neutral subtle when called without arguments', () => {
      expect(toneClasses()).toBe(TONE_STYLES.neutral.subtle)
    })
  })
})
