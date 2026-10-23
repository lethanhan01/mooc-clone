import { describe, it, expect } from 'vitest'
import {
  maskPhone,
  maskEmail,
  maskCitizenId,
  maskBankAccount,
  maskPII,
  maskObjectPII,
} from './pii-masker'

describe('PII Masker Utility (pii-masker.ts)', () => {
  describe('maskPhone', () => {
    it('masks standard 10-digit Vietnam phone number', () => {
      expect(maskPhone('0912345678')).toBe('091****678')
    })

    it('handles short or empty phone input safely', () => {
      expect(maskPhone('')).toBe('')
      expect(maskPhone('123')).toBe('***')
    })
  })

  describe('maskEmail', () => {
    it('masks standard email with multi-character username', () => {
      expect(maskEmail('an.le@domain.com')).toBe('a***e@domain.com')
      expect(maskEmail('john.doe@example.com')).toBe('j***e@example.com')
    })

    it('masks short username email gracefully', () => {
      expect(maskEmail('me@domain.com')).toBe('m*@domain.com')
      expect(maskEmail('')).toBe('')
    })
  })

  describe('maskCitizenId', () => {
    it('masks 12-digit citizen ID (CCCD)', () => {
      expect(maskCitizenId('001201012345')).toBe('0012****2345')
    })
  })

  describe('maskBankAccount', () => {
    it('masks bank account keeping only last 4 digits', () => {
      expect(maskBankAccount('1903456789012')).toBe('*********9012')
    })
  })

  describe('maskPII dispatcher', () => {
    it('dispatches to appropriate masking function', () => {
      expect(maskPII('0912345678', 'phone')).toBe('091****678')
      expect(maskPII('test@domain.com', 'email')).toBe('t***t@domain.com')
    })
  })

  describe('maskObjectPII', () => {
    it('recursively masks identified PII fields inside object structures', () => {
      const input = {
        id: 'user-123',
        name: 'Nguyen Van A',
        phone: '0987654321',
        email: 'user@example.com',
        cccd: '079199001234',
        bankAccount: '1234567890',
        metadata: {
          mobile: '0912345678',
          notes: 'Regular member',
        },
      }

      const masked = maskObjectPII(input)

      expect(masked.id).toBe('user-123')
      expect(masked.name).toBe('Nguyen Van A')
      expect(masked.phone).toBe('098****321')
      expect(masked.email).toBe('u***r@example.com')
      expect(masked.cccd).toBe('0791****1234')
      expect(masked.bankAccount).toBe('******7890')
      expect(masked.metadata.mobile).toBe('091****678')
      expect(masked.metadata.notes).toBe('Regular member')
    })
  })
})
