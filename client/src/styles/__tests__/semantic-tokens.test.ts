import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import postcss from 'postcss'
import { parseCssTokens, resolveCssVariables } from './token-test-helpers'

const stylesDir = path.resolve(__dirname, '..')
const tokensDir = path.join(stylesDir, 'tokens')
const themeCssPath = path.join(stylesDir, 'theme.css')

describe('P4-07: Semantic Design Tokens Test Suite', () => {
  it('Test 1 (Dual-Theme Symmetry): all --color-* tokens exist symmetrically in dark and light themes', () => {
    const semanticCssPath = path.join(tokensDir, 'semantic.css')
    const css = fs.readFileSync(semanticCssPath, 'utf-8')
    const root = postcss.parse(css)

    const darkTokens: string[] = []
    const lightTokens: string[] = []

    root.walkRules((rule) => {
      const isDark = rule.selector.includes("data-theme='dark'") || rule.selector.includes(':root')
      const isLight = rule.selector.includes("data-theme='light'")

      rule.walkDecls((decl) => {
        if (decl.prop.startsWith('--color-')) {
          if (isDark && !darkTokens.includes(decl.prop)) {
            darkTokens.push(decl.prop)
          }
          if (isLight && !lightTokens.includes(decl.prop)) {
            lightTokens.push(decl.prop)
          }
        }
      })
    })

    expect(darkTokens.length).toBeGreaterThan(0)
    expect(lightTokens.length).toBeGreaterThan(0)

    // Symmetrical parity
    const missingInLight = darkTokens.filter((t) => !lightTokens.includes(t))
    const missingInDark = lightTokens.filter((t) => !darkTokens.includes(t))

    expect(missingInLight).toEqual([])
    expect(missingInDark).toEqual([])
    expect(darkTokens.sort()).toEqual(lightTokens.sort())
  })

  it('Test 2 (No HEX Leak Outside Primitive): semantic and compatibility token files contain no raw HEX colors', () => {
    const colorFiles = ['semantic.css', 'compat.css', 'shadcn.css']
    const hexPattern = /#([0-9a-fA-F]{3,8})\b/g

    for (const fileName of colorFiles) {
      const filePath = path.join(tokensDir, fileName)
      if (!fs.existsSync(filePath)) continue

      const content = fs.readFileSync(filePath, 'utf-8')
      // Strip comments to ignore doc comments like /* @deprecated -> #ffffff */
      const strippedContent = content.replace(/\/\*[\s\S]*?\*\//g, '')
      const matches = strippedContent.match(hexPattern) || []

      expect(
        matches,
        `Found raw HEX leak in tokens/${fileName}: ${matches.join(', ')}`
      ).toEqual([])
    }
  })

  it('Test 3 (Oracle Invariance): legacy --rogym-* tokens in compat.css resolve to exact baseline values', () => {
    const rawTokens = parseCssTokens()
    const resolvedTokens = resolveCssVariables(rawTokens)
    const rootScope = resolvedTokens[':root']

    expect(rootScope).toBeDefined()

    // Key baseline anchors from Phase 0 Oracle
    expect(rootScope['--rogym-green']).toBe('#06c384')
    expect(rootScope['--rogym-teal']).toBe('#42e09e')
    expect(rootScope['--rogym-bg-base']).toBe('#080e0b')
    expect(rootScope['--rogym-bg-card']).toBe('#0f1c16')
    expect(rootScope['--rogym-text-primary']).toBe('#ffffff')
    expect(rootScope['--rogym-text-secondary']).toBe('#bbcabf')
    expect(rootScope['--rogym-border-subtle']).toBe('#ffffff12')
    expect(rootScope['--rogym-border-teal-focus']).toBe('#42e09e')
    expect(rootScope['--rogym-error']).toBe('#ff6b6b')

    // Every --rogym-* token in compat.css must resolve to a valid non-empty value (no unresolved var())
    const compatCssPath = path.join(tokensDir, 'compat.css')
    const compatCss = fs.readFileSync(compatCssPath, 'utf-8')
    const root = postcss.parse(compatCss)

    const compatTokens: string[] = []
    root.walkDecls((decl) => {
      if (decl.prop.startsWith('--rogym-')) {
        compatTokens.push(decl.prop)
      }
    })

    expect(compatTokens.length).toBeGreaterThanOrEqual(36)
    for (const token of compatTokens) {
      const resolved = rootScope[token]
      expect(resolved, `Token ${token} should be resolved in :root`).toBeDefined()
      expect(resolved, `Token ${token} should not contain unresolved var()`).not.toContain('var(')
    }
  })

  it('Test 4 (Tailwind Exposure): all semantic tokens in semantic.css are registered in theme.css under @theme inline', () => {
    const semanticCssPath = path.join(tokensDir, 'semantic.css')
    const semanticCss = fs.readFileSync(semanticCssPath, 'utf-8')
    const semanticRoot = postcss.parse(semanticCss)

    const semanticProps = new Set<string>()
    semanticRoot.walkDecls((decl) => {
      if (decl.prop.startsWith('--color-')) {
        semanticProps.add(decl.prop)
      }
    })

    const themeCss = fs.readFileSync(themeCssPath, 'utf-8')
    const themeRoot = postcss.parse(themeCss)

    const themeProps = new Set<string>()
    themeRoot.walkAtRules('theme', (atRule) => {
      if (atRule.params.includes('inline')) {
        atRule.walkDecls((decl) => {
          if (decl.prop.startsWith('--color-')) {
            themeProps.add(decl.prop)
          }
        })
      }
    })

    for (const prop of semanticProps) {
      expect(
        themeProps.has(prop),
        `Semantic token ${prop} must be exposed in theme.css under @theme inline`
      ).toBe(true)
    }
  })

  it('Test 5 (Primitive Isolation): compat.css and shadcn.css only reference semantic tokens, not primitive tokens', () => {
    const filesToCheck = ['compat.css', 'shadcn.css']

    for (const fileName of filesToCheck) {
      const filePath = path.join(tokensDir, fileName)
      if (!fs.existsSync(filePath)) continue

      const content = fs.readFileSync(filePath, 'utf-8')
      const strippedContent = content.replace(/\/\*[\s\S]*?\*\//g, '')

      expect(
        strippedContent.includes('--primitive-'),
        `${fileName} must NOT reference --primitive-* variables directly`
      ).toBe(false)
    }
  })
})
