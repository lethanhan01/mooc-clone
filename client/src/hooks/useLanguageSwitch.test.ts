import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLanguageSwitch } from './useLanguageSwitch'
import i18n from '@/lib/i18n'

describe('useLanguageSwitch Hook (useLanguageSwitch.ts)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('vi')
  })

  it('initializes with current i18n language', () => {
    const { result } = renderHook(() => useLanguageSwitch())
    expect(result.current.currentLanguage).toBe('vi')
    expect(result.current.isRTL).toBe(false)
    expect(document.documentElement.lang).toBe('vi')
    expect(document.documentElement.dir).toBe('ltr')
  })

  it('switches language and synchronizes document attributes', async () => {
    const { result } = renderHook(() => useLanguageSwitch())

    await act(async () => {
      await result.current.changeLanguage('ja')
    })

    expect(result.current.currentLanguage).toBe('ja')
    expect(document.documentElement.lang).toBe('ja')
    expect(document.documentElement.dir).toBe('ltr')
    expect(localStorage.getItem('gym-locale')).toBe('ja')
  })
})
