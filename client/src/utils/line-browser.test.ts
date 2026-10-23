import { describe, expect, it } from 'vitest'
import { isLineInAppBrowser } from './line-browser'

describe('isLineInAppBrowser', () => {
  it('detects LINE in-app browser user agents case-insensitively', () => {
    expect(isLineInAppBrowser('Mozilla/5.0 Line/13.0.0')).toBe(true)
    expect(isLineInAppBrowser('mozilla/5.0 line/13.0.0')).toBe(true)
  })

  it('does not match regular browsers', () => {
    expect(isLineInAppBrowser('Mozilla/5.0 Chrome/126.0.0.0 Safari/537.36')).toBe(false)
  })
})
