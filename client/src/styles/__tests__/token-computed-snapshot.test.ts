import { describe, expect, it } from 'vitest'
import {
  type TokenMap,
  parseCssTokens,
  resolveCssVariables,
} from './token-test-helpers'

export { parseCssTokens, resolveCssVariables, type TokenMap }

describe('Phase 0 Oracle: CSS Token Computed Snapshot (P0-02)', () => {
  it('parses tokens.css and components/*.css and generates reproducible computed token snapshot', () => {
    const rawTokens = parseCssTokens()
    expect(Object.keys(rawTokens).length).toBeGreaterThan(0)
    expect(rawTokens[':root']).toBeDefined()

    const computedTokens = resolveCssVariables(rawTokens, ':root')

    // Verify key core tokens are properly resolved to hex/string values
    expect(computedTokens[':root']['--rogym-green']).toBe('#06c384')
    expect(computedTokens[':root']['--rogym-teal']).toBe('#42e09e')
    expect(computedTokens[':root']['--primary']).toBe('#06c384')
    expect(computedTokens[':root']['--background']).toBe('#080e0b')
    expect(computedTokens[':root']['--border-teal-focus']).toBeUndefined() // check correct name
    expect(computedTokens[':root']['--rogym-border-teal-focus']).toBe('#42e09e')

    // Snapshot Oracle lock: Đảm bảo 100% token gốc của Phase 0 không bị thay đổi giá trị
    const legacyScope: TokenMap = {}
    for (const [scope, tokens] of Object.entries(computedTokens)) {
      const scopeTokens: Record<string, string> = {}
      for (const [prop, val] of Object.entries(tokens)) {
        // Chỉ so khớp các token thuộc phạm vi baseline Phase 0 (bỏ qua token mới bổ sung của Phase 4+)
        if (
          !prop.startsWith('--primitive-') &&
          !prop.startsWith('--brand-line-') &&
          !prop.startsWith('--color-') &&
          !prop.startsWith('--shadow-') &&
          !prop.startsWith('--z-') &&
          !prop.startsWith('--radius-') &&
          prop !== '--font-body' &&
          prop !== '--font-display' &&
          prop !== '--ease-standard' &&
          !prop.startsWith('--duration-') &&
          !prop.startsWith('--bottom-nav-')
        ) {
          scopeTokens[prop] = val
        }
      }
      if (Object.keys(scopeTokens).length > 0) {
        legacyScope[scope] = scopeTokens
      }
    }
    expect(legacyScope).toMatchSnapshot()
  })

  it('correctly handles circular references and prevents infinite loops', () => {
    const circularMap: TokenMap = {
      ':root': {
        '--var-a': 'var(--var-b)',
        '--var-b': 'var(--var-c)',
        '--var-c': 'var(--var-a)',
      },
    }

    expect(() => resolveCssVariables(circularMap, ':root')).toThrowError(
      /Circular CSS variable reference/
    )
  })

  it('correctly resolves fallback values when variable is undefined', () => {
    const fallbackMap: TokenMap = {
      ':root': {
        '--defined-var': '#111111',
        '--using-fallback': 'var(--undefined-var, #ff00ff)',
        '--using-nested-fallback': 'var(--missing-1, var(--defined-var, #000000))',
      },
    }

    const resolved = resolveCssVariables(fallbackMap, ':root')
    expect(resolved[':root']['--using-fallback']).toBe('#ff00ff')
    expect(resolved[':root']['--using-nested-fallback']).toBe('#111111')
  })
})
