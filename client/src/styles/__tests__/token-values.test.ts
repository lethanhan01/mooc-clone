import { describe, expect, it } from 'vitest'
import {
  ROGYM_THEME_TOKENS,
  SEMANTIC_TOKEN_COLORS,
  TOKEN_COLOR_CSS_VARS,
  TOKEN_COLORS,
  getTokenColor,
  type SemanticTokenColorKey,
  type TokenColorKey,
} from '../token-values'

import { parseCssTokens, resolveCssVariables } from './token-test-helpers'

describe('token-values.ts — Single Source of Truth & Drift Prevention', () => {
  it('exports valid 6-digit or 8-digit HEX codes for all color tokens in legacy TOKEN_COLORS', () => {
    const hexRegex = /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
    for (const [key, value] of Object.entries(TOKEN_COLORS)) {
      expect(value, `Key "${key}" must be a valid 6 or 8-digit hex`).toMatch(hexRegex)
    }
  })

  it('guarantees bidirectional synchronization with tokens.css and tokens/compat.css', () => {
    const rawTokens = parseCssTokens()
    const computedTokens = resolveCssVariables(rawTokens, ':root')
    const rootTokens = computedTokens[':root'] || {}

    // 1. Direction 1: Every CSS color variable mapped in TOKEN_COLOR_CSS_VARS must match TOKEN_COLORS
    for (const [key, cssVar] of Object.entries(TOKEN_COLOR_CSS_VARS) as [TokenColorKey, string][]) {
      const computedHex = rootTokens[cssVar]
      expect(
        computedHex,
        `CSS variable "${cssVar}" mapped from "${key}" must exist and resolve in :root`
      ).toBeDefined()
      expect(
        computedHex?.toLowerCase(),
        `Computed hex value for "${cssVar}" must match "${key}" in TOKEN_COLORS`
      ).toBe(TOKEN_COLORS[key].toLowerCase())
    }

    // 2. Direction 2: Every key in TOKEN_COLORS must map to a valid resolved variable in tokens.css
    for (const key of Object.keys(TOKEN_COLORS) as TokenColorKey[]) {
      const cssVar = TOKEN_COLOR_CSS_VARS[key]
      expect(cssVar, `Key "${key}" must have a CSS variable mapping`).toBeDefined()
      expect(
        TOKEN_COLORS[key].toLowerCase(),
        `Value for "${key}" in TOKEN_COLORS must match computed ${cssVar}`
      ).toBe(rootTokens[cssVar]?.toLowerCase())
    }
  })

  it('getTokenColor returns the exact value of the token key for both legacy and semantic keys', () => {
    // Legacy keys
    for (const key of Object.keys(TOKEN_COLORS) as TokenColorKey[]) {
      expect(getTokenColor(key)).toBe(TOKEN_COLORS[key])
    }

    // Semantic keys
    for (const key of Object.keys(SEMANTIC_TOKEN_COLORS) as SemanticTokenColorKey[]) {
      expect(getTokenColor(key)).toBe(SEMANTIC_TOKEN_COLORS[key])
    }
  })

  it('ROGYM_THEME_TOKENS is identical to TOKEN_COLORS alias', () => {
    expect(ROGYM_THEME_TOKENS).toBe(TOKEN_COLORS)
  })

  it('exports valid var(--color-*) CSS variables for all keys in SEMANTIC_TOKEN_COLORS', () => {
    const rawTokens = parseCssTokens()
    const computedTokens = resolveCssVariables(rawTokens, ':root')
    const rootTokens = computedTokens[':root'] || {}

    for (const [key, value] of Object.entries(SEMANTIC_TOKEN_COLORS)) {
      expect(value, `Semantic token "${key}" must use var(--color-*) format`).toMatch(
        /^var\(--color-[a-z0-9-]+\)$/
      )

      // Trích xuất tên biến CSS bên trong var(...)
      const varName = value.slice(4, -1)
      const resolved = rootTokens[varName]
      expect(
        resolved,
        `Semantic CSS variable "${varName}" for key "${key}" must resolve to a valid color in :root`
      ).toBeDefined()
    }
  })
})
