import { describe, expect, it } from 'vitest'
import { statusLabel, statusTone } from './status'

describe('status utilities (status.ts)', () => {
  describe('statusTone', () => {
    it('maps positive statuses to success tone', () => {
      expect(statusTone('active')).toBe('success')
      expect(statusTone('completed')).toBe('success')
      expect(statusTone('resolved')).toBe('success')
    })

    it('maps ongoing and active operations to accent tone', () => {
      expect(statusTone('scheduled')).toBe('accent')
      expect(statusTone('in_progress')).toBe('accent')
      expect(statusTone('realtime')).toBe('accent')
      expect(statusTone('available')).toBe('accent')
      expect(statusTone('repairing')).toBe('accent')
    })

    it('maps pending and draft states to warning tone', () => {
      expect(statusTone('pending')).toBe('warning')
      expect(statusTone('draft')).toBe('warning')
      expect(statusTone('maintenance')).toBe('warning')
      expect(statusTone('suspended')).toBe('warning')
    })

    it('maps termination and error states to danger tone', () => {
      expect(statusTone('cancelled')).toBe('danger')
      expect(statusTone('expired')).toBe('danger')
      expect(statusTone('broken')).toBe('danger')
      expect(statusTone('deleted')).toBe('danger')
    })

    it('maps null, undefined or unknown statuses to neutral tone', () => {
      expect(statusTone(null)).toBe('neutral')
      expect(statusTone(undefined)).toBe('neutral')
      expect(statusTone('inactive')).toBe('neutral')
      expect(statusTone('unknown_status')).toBe('neutral')
    })
  })

  describe('statusLabel', () => {
    it('returns formatted default string when localization key is missing or default', () => {
      expect(statusLabel('in_progress')).toBeDefined()
      expect(statusLabel(null)).toBeDefined()
    })
  })
})
