import fs from 'node:fs'
import path from 'node:path'
import postcss, { type Root, type Rule, type AtRule, type Declaration } from 'postcss'

export interface TokenMap {
  [selectorOrScope: string]: {
    [tokenName: string]: string
  }
}

/**
 * Resolver for CSS variables supporting recursion, fallback values, and circular reference guard.
 */
export function resolveCssVariables(rawMap: TokenMap, rootScopeKey = ':root'): TokenMap {
  const resolved: TokenMap = {}
  const rootScope = rawMap[rootScopeKey] || {}

  function resolveValue(
    value: string,
    currentScope: Record<string, string>,
    chain: string[] = []
  ): string {
    let result = ''
    let i = 0

    while (i < value.length) {
      if (value.startsWith('var(', i)) {
        // Find matching closing parenthesis
        let openParens = 1
        let j = i + 4
        while (j < value.length && openParens > 0) {
          if (value[j] === '(') openParens++
          else if (value[j] === ')') openParens--
          j++
        }

        if (openParens === 0) {
          const inner = value.slice(i + 4, j - 1).trim()
          // Split inner into varName and fallback (first comma at depth 0)
          let commaIdx = -1
          let innerParens = 0
          for (let k = 0; k < inner.length; k++) {
            if (inner[k] === '(') innerParens++
            else if (inner[k] === ')') innerParens--
            else if (inner[k] === ',' && innerParens === 0) {
              commaIdx = k
              break
            }
          }

          let varName = inner
          let fallback: string | undefined

          if (commaIdx !== -1) {
            varName = inner.slice(0, commaIdx).trim()
            fallback = inner.slice(commaIdx + 1).trim()
          }

          if (chain.includes(varName)) {
            throw new Error(
              `Circular CSS variable reference detected: ${[...chain, varName].join(' -> ')}`
            )
          }

          if (chain.length > 5) {
            throw new Error(`Maximum variable recursion depth (5) exceeded for: ${varName}`)
          }

          const nextChain = [...chain, varName]
          const targetVal =
            currentScope[varName] !== undefined ? currentScope[varName] : rootScope[varName]

          let replacement: string
          if (targetVal !== undefined) {
            replacement = resolveValue(targetVal, currentScope, nextChain)
          } else if (fallback !== undefined) {
            replacement = resolveValue(fallback, currentScope, nextChain)
          } else {
            replacement = `var(${varName})`
          }

          result += replacement
          i = j
          continue
        }
      }

      result += value[i]
      i++
    }

    return result
  }

  const sortedScopes = Object.keys(rawMap).sort()
  for (const scope of sortedScopes) {
    resolved[scope] = {}
    const scopeTokens = rawMap[scope]
    const sortedTokenNames = Object.keys(scopeTokens).sort()

    for (const tokenName of sortedTokenNames) {
      const rawVal = scopeTokens[tokenName]
      resolved[scope][tokenName] = resolveValue(rawVal, scopeTokens)
    }
  }

  return resolved
}

/**
 * Parses CSS files with PostCSS to extract CSS variable declarations, resolving @import statements.
 */
export function parseCssTokens(): TokenMap {
  const stylesDir = path.resolve(__dirname, '..')
  const tokensCssPath = path.join(stylesDir, 'tokens.css')
  const componentsDir = path.join(stylesDir, 'components')

  const rawTokens: TokenMap = {}

  function addDecl(scope: string, prop: string, value: string) {
    if (!prop.startsWith('--')) return
    if (!rawTokens[scope]) {
      rawTokens[scope] = {}
    }
    rawTokens[scope][prop] = value.trim()
  }

  function parseFile(filePath: string, visited: Set<string> = new Set()) {
    if (visited.has(filePath) || !fs.existsSync(filePath)) return
    visited.add(filePath)

    const css = fs.readFileSync(filePath, 'utf-8')
    const rootNode = postcss.parse(css, { from: filePath })

    rootNode.walk((node) => {
      if (node.type === 'atrule' && node.name === 'import') {
        const importMatch = node.params.match(/['"](.*?)['"]/)
        if (importMatch) {
          const importedFile = path.resolve(path.dirname(filePath), importMatch[1])
          parseFile(importedFile, visited)
        }
      } else if (node.type === 'decl' && node.prop.startsWith('--')) {
        const decl = node as Declaration
        const parent = decl.parent as Rule | undefined
        if (!parent || parent.type !== 'rule') return

        let scope = parent.selector
        const grandParent = parent.parent as AtRule | Root | undefined

        if (grandParent && grandParent.type === 'atrule') {
          if (grandParent.name === 'media') {
            scope = `@media ${grandParent.params} > ${parent.selector}`
          } else if (grandParent.name === 'layer') {
            scope = parent.selector // Keep :root or .theme, .dark
          }
        }

        addDecl(scope, decl.prop, decl.value)

        const isInsideMedia =
          grandParent && grandParent.type === 'atrule' && grandParent.name === 'media'

        // Nếu selector ghép có chứa :root (vd: :root, [data-theme='dark']), gán thêm vào :root (trừ media query)
        const parts = parent.selector.split(',').map((s) => s.trim())
        if (parts.includes(':root') && scope !== ':root' && !isInsideMedia) {
          addDecl(':root', decl.prop, decl.value)
        }
      }
    })
  }

  // 1. Parse tokens.css (and its @imports)
  if (fs.existsSync(tokensCssPath)) {
    parseFile(tokensCssPath)
  }

  // 2. Parse styles/components/*.css
  if (fs.existsSync(componentsDir)) {
    const compFiles = fs
      .readdirSync(componentsDir)
      .filter((file: string) => file.endsWith('.css'))
      .sort()

    for (const compFile of compFiles) {
      const compPath = path.join(componentsDir, compFile)
      const css = fs.readFileSync(compPath, 'utf-8')
      const rootNode = postcss.parse(css, { from: compPath })

      rootNode.walkDecls((decl) => {
        if (decl.prop.startsWith('--')) {
          const parent = decl.parent as Rule | undefined
          const selector = parent && parent.type === 'rule' ? parent.selector : ':root'
          const scope = `components/${compFile} > ${selector}`
          addDecl(scope, decl.prop, decl.value)
        }
      })
    }
  }

  return rawTokens
}
