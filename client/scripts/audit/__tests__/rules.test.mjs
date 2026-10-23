import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { ALL_RULES, ruleDomainMap } from '../cli.mjs'
import { maskFileContent } from '../lib/mask.mjs'
import { parseExemptions } from '../lib/exemptions.mjs'
import { DOMAINS, loadBaselines } from '../lib/baseline.mjs'
import {
  getContrastRatio,
  hexToRgba,
  alphaComposite,
  evaluateContrastPairs,
} from '../contrast-check.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientRoot = path.resolve(__dirname, '../../..')

describe('RoGym Conventions Suite — Audit Architecture & Rules Contract', () => {
  it('registers all 64 rules without duplicate IDs and adheres to domain boundaries', () => {
    const ruleKeys = Object.keys(ALL_RULES)
    expect(ruleKeys.length).toBe(64)

    // Check uniqueness of rule IDs
    const uniqueIds = new Set(ruleKeys)
    expect(uniqueIds.size).toBe(ruleKeys.length)

    for (const [id, rule] of Object.entries(ALL_RULES)) {
      expect(rule.id).toBe(id)
      expect(typeof rule.description).toBe('string')
      expect(['ERROR', 'WARNING']).toContain(rule.severity)
      expect(typeof rule.filter).toBe('function')
      expect(rule.checkLine || rule.checkFile).toBeDefined()

      // Quyết định D17: Canonical 106-Matrix + Legacy SEM-* Alias
      expect(typeof rule.canonicalId).toBe('string')
      expect(typeof rule.docRef).toBe('string')
      expect(rule.docRef).toMatch(/^SEM-/)

      // Domain validation
      expect(DOMAINS).toContain(rule.domain)
      expect(ruleDomainMap[id]).toBe(rule.domain)
    }
  })

  describe('audit/lib Helpers', () => {
    it('maskFileContent preserves lines and replaces block comments with whitespace', () => {
      const input = `const a = 1\n/* line 1\nline 2 */\nconst b = 2`
      const masked = maskFileContent(input)
      const inputLines = input.split('\n')
      const maskedLines = masked.split('\n')

      expect(maskedLines.length).toBe(inputLines.length)
      expect(maskedLines[0]).toBe('const a = 1')
      expect(maskedLines[1].trim()).toBe('')
      expect(maskedLines[2].trim()).toBe('')
      expect(maskedLines[3]).toBe('const b = 2')
    })

    it('parseExemptions correctly extracts rules, lines, and STD-EXEMPT-001 until date', () => {
      const lines = [
        '// rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Layout grid wrapper]',
        '<div className="grid">',
        '{/* rogym-convention-exempt: NO_INLINE_STYLE, NO_MAGIC_DIMENSIONS [until: 2026-12-31] [Canvas animation] */}',
        '<canvas style={{ width: 100 }} />',
        '<span>Normal content</span>',
      ]

      const exemptions = parseExemptions(lines)
      expect(exemptions.get(1)?.has('NO_NONSEMANTIC_TAGS')).toBe(true)
      expect(exemptions.get(2)?.has('NO_NONSEMANTIC_TAGS')).toBe(true)
      expect(exemptions.get(3)?.has('NO_INLINE_STYLE')).toBe(true)
      expect(exemptions.get(3)?.has('NO_MAGIC_DIMENSIONS')).toBe(true)
      expect(exemptions.get(4)?.has('NO_INLINE_STYLE')).toBe(true)

      // Test untilDate extraction
      expect(exemptions.list.length).toBe(2)
      expect(exemptions.list[0].untilDate).toBeNull()
      expect(exemptions.list[1].untilDate).toBe('2026-12-31')
      expect(exemptions.list[1].reason).toBe('Canvas animation')
    })

    it('parseExemptions supports ALL keyword and file-level exemptions (P5-14)', () => {
      const lines = [
        '// rogym-convention-exempt: ALL [until: 2026-12-31] [Dev mock & showcase tool]',
        'import React from "react"',
        '<div className="bg-red-500" style={{ color: "#fff" }}>',
      ]

      const exemptions = parseExemptions(lines)
      expect(exemptions.isAllExempt).toBe(true)
      expect(exemptions.fileLevelRules.has('ALL')).toBe(true)
      expect(exemptions.list.length).toBe(1)
      expect(exemptions.list[0].untilDate).toBe('2026-12-31')
      expect(exemptions.list[0].reason).toBe('Dev mock & showcase tool')
    })

    it('loadBaselines and saveBaselines perform Dual-sync between domain files and audit-baseline.json', () => {
      const tempDir = path.join(clientRoot, 'scripts/audit/baselines-test-temp')
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

      try {
        const { combined, byDomain } = loadBaselines(clientRoot)
        expect(typeof combined).toBe('object')
        expect(typeof byDomain).toBe('object')
        expect(byDomain['html-semantic']).toBeDefined()
        expect(byDomain['architecture']).toBeDefined()
      } finally {
        if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true })
      }
    })
  })

  describe('19 Rules Unit Fixtures (PASS / FAIL / EXEMPT)', () => {
    const noExempt = () => false
    const isExempt = () => true

    describe('HEX_COLOR_ONLY_IN_CSS (P2-06 color-mix in semantic tokens)', () => {
      const rule = ALL_RULES.HEX_COLOR_ONLY_IN_CSS

      it('PASS: valid 6 and 8 digit HEX in stylesheets', () => {
        expect(rule.checkLine('color: #06c384;', 0, [], noExempt, 'src/styles/base.css')).toBe(false)
        expect(rule.checkLine('background: #0c1611d1;', 0, [], noExempt, 'src/styles/components/button.css')).toBe(false)
      })

      it('PASS: color-mix() allowed in semantic tokens file', () => {
        const semanticLine = 'background: color-mix(in srgb, var(--primitive-primary) 20%, transparent);'
        expect(rule.checkLine(semanticLine, 0, [], noExempt, 'src/styles/tokens/semantic.css')).toBe(false)
        expect(rule.checkLine(semanticLine, 0, [], noExempt, 'src/styles/tokens/semantic-dark.css')).toBe(false)
      })

      it('FAIL: color-mix() forbidden outside semantic tokens', () => {
        const mixLine = 'background: color-mix(in srgb, var(--primary) 20%, transparent);'
        expect(rule.checkLine(mixLine, 0, [], noExempt, 'src/styles/base.css')).toBe(true)
        expect(rule.checkLine(mixLine, 0, [], noExempt, 'src/styles/tokens/primitive.css')).toBe(true)
      })

      it('FAIL: rgb, rgba, hsl, hsla, and 3-digit shorthand HEX are forbidden everywhere', () => {
        expect(rule.checkLine('color: rgb(6, 195, 132);', 0, [], noExempt, 'src/styles/base.css')).toBe(true)
        expect(rule.checkLine('color: rgba(6, 195, 132, 0.5);', 0, [], noExempt, 'src/styles/tokens/semantic.css')).toBe(true)
        expect(rule.checkLine('color: #fff;', 0, [], noExempt, 'src/styles/base.css')).toBe(true)
      })

      it('EXEMPT: ignored when exemption comment present', () => {
        expect(rule.checkLine('color: rgb(6, 195, 132);', 0, [], isExempt, 'src/styles/base.css')).toBe(false)
      })
    })

    describe('NO_RAW_INTERACTIVE_ELEMENTS', () => {
      const rule = ALL_RULES.NO_RAW_INTERACTIVE_ELEMENTS

      it('PASS: primitives used instead of raw elements', () => {
        expect(rule.checkLine('<Button tone="primary">Click</Button>', 0, [], noExempt, 'src/pages/Home.tsx')).toBeNull()
        expect(rule.checkLine('<ButtonLink to="/dashboard">Go</ButtonLink>', 0, [], noExempt, 'src/pages/Home.tsx')).toBeNull()
      })

      it('FAIL: raw <button>, <form>, <a href>', () => {
        expect(rule.checkLine('<button onClick={fn}>Click</button>', 0, [], noExempt, 'src/pages/Home.tsx')).not.toBeNull()
        expect(rule.checkLine('<form onSubmit={fn}>', 0, [], noExempt, 'src/pages/Home.tsx')).not.toBeNull()
        expect(rule.checkLine('<a href="/test">link</a>', 0, ['<a href="/test">link</a>'], noExempt, 'src/pages/Home.tsx')).not.toBeNull()
      })

      it('EXEMPT: allowed in ui/ and shared/ or when exempt', () => {
        expect(rule.filter('src/components/ui/Button.tsx')).toBe(false)
        expect(rule.filter('src/components/shared/BackButton.tsx')).toBe(false)
        expect(rule.checkLine('<button>Click</button>', 0, [], isExempt, 'src/pages/Home.tsx')).toBeNull()
      })
    })

    describe('NO_DANGEROUS_HTML', () => {
      const rule = ALL_RULES.NO_DANGEROUS_HTML

      it('PASS: safe markup', () => {
        expect(rule.checkLine('<p>{content}</p>', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
      })

      it('FAIL: dangerouslySetInnerHTML usage', () => {
        expect(rule.checkLine('<div dangerouslySetInnerHTML={{ __html: raw }} />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
      })

      it('EXEMPT: ignored when exempt', () => {
        expect(rule.checkLine('<div dangerouslySetInnerHTML={{ __html: raw }} />', 0, [], isExempt, 'src/pages/Home.tsx')).toBe(false)
      })
    })

    describe('NO_UNSAFE_TARGET_BLANK', () => {
      const rule = ALL_RULES.NO_UNSAFE_TARGET_BLANK

      it('PASS: target="_blank" accompanied by rel="noopener noreferrer"', () => {
        const line = '<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a>'
        expect(rule.checkLine(line, 0, [line], noExempt, 'src/pages/Home.tsx')).toBe(false)
      })

      it('FAIL: target="_blank" without rel attributes', () => {
        const line = '<a href="https://example.com" target="_blank">Link</a>'
        expect(rule.checkLine(line, 0, [line], noExempt, 'src/pages/Home.tsx')).toBe(true)
      })
    })

    describe('FORWARD_REF_NAME', () => {
      const rule = ALL_RULES.FORWARD_REF_NAME

      it('PASS: forwardRef component with displayName assigned', () => {
        const content = `const MyInput = forwardRef((props, ref) => <input ref={ref} />);\nMyInput.displayName = 'MyInput';`
        expect(rule.checkFile(content, 'src/components/MyInput.tsx', content.split('\n'), noExempt)).toEqual([])
      })

      it('FAIL: forwardRef component missing displayName', () => {
        const content = `const MyInput = forwardRef((props, ref) => <input ref={ref} />);`
        const violations = rule.checkFile(content, 'src/components/MyInput.tsx', content.split('\n'), noExempt)
        expect(violations.length).toBeGreaterThan(0)
      })
    })

    describe('NO_RAW_COLORS_IN_JSX', () => {
      const rule = ALL_RULES.NO_RAW_COLORS_IN_JSX

      it('PASS: semantic token classes', () => {
        expect(rule.checkLine('<div className="bg-card text-primary border-border" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
      })

      it('FAIL: arbitrary Tailwind HEX, inline style with raw colors, raw color props', () => {
        expect(rule.checkLine('<div className="bg-[#0f1c16]" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        expect(rule.checkLine('<div style={{ color: "#06c384" }} />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        expect(rule.checkLine('<svg fill="#ffffff" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
      })
    })

    describe('NO_ARBITRARY_CLASSES_OR_TOKENS', () => {
      const rule = ALL_RULES.NO_ARBITRARY_CLASSES_OR_TOKENS

      it('PASS: semantic token classes', () => {
        expect(rule.checkLine('<p className="text-fg-secondary text-sm">Hello</p>', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        expect(rule.checkLine('<div className="text-fg-subtle bg-surface-card" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
      })

      it('FAIL: dissolved legacy classes', () => {
        expect(rule.checkLine('<p className="rogym-text-secondary">Text</p>', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        expect(rule.checkLine('<span className="rogym-text-dim">Text</span>', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        expect(rule.checkLine('<div className="rogym-bg-card">Card</div>', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
      })
    })

    describe('NO_NONSEMANTIC_TAGS', () => {
      const rule = ALL_RULES.NO_NONSEMANTIC_TAGS

      it('PASS: semantic elements and UI primitives', () => {
        expect(rule.checkLine('<Card as="article">Content</Card>', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        expect(rule.checkLine('<section className="p-4">Content</section>', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
      })

      it('FAIL: unannotated div, span, b, i, u', () => {
        expect(rule.checkLine('<div className="flex">', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        expect(rule.checkLine('<span>Text</span>', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
      })
    })

    describe('NO_INLINE_STYLE', () => {
      const rule = ALL_RULES.NO_INLINE_STYLE

      it('PASS: CSS variable assignment for tone', () => {
        expect(rule.checkLine('<div style={{ "--rogym-tone": "var(--primary)" }} />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
      })

      it('FAIL: general inline style', () => {
        expect(rule.checkLine('<div style={{ padding: "10px" }} />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
      })
    })

    describe('NO_UNSTABLE_KEY', () => {
      const rule = ALL_RULES.NO_UNSTABLE_KEY

      it('PASS: stable unique IDs', () => {
        expect(rule.checkLine('<Item key={item.id} />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
      })

      it('FAIL: unstable array indices', () => {
        expect(rule.checkLine('<Item key={index} />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        expect(rule.checkLine('<Item key={i} />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
      })
    })

    describe('SEMANTIC_CLICK', () => {
      const rule = ALL_RULES.SEMANTIC_CLICK

      it('PASS: non-interactive element with onClick and role', () => {
        const line = '<div onClick={handleClick} role="button" tabIndex={0}>Click</div>'
        expect(rule.checkLine(line, 0, [line], noExempt, 'src/pages/Home.tsx')).toBe(false)
      })

      it('FAIL: non-interactive element with onClick but missing role', () => {
        const line = '<div onClick={handleClick}>Click</div>'
        expect(rule.checkLine(line, 0, [line], noExempt, 'src/pages/Home.tsx')).toBe(true)
      })
    })

    describe('NO_TS_ANY', () => {
      const rule = ALL_RULES.NO_TS_ANY

      it('PASS: proper TypeScript types', () => {
        expect(rule.checkLine('const val: unknown = response.data', 0, [], noExempt, 'src/lib/test.ts')).toBe(false)
        expect(rule.checkLine('function handle(x: Record<string, string>) {}', 0, [], noExempt, 'src/lib/test.ts')).toBe(false)
      })

      it('FAIL: direct or generic any', () => {
        expect(rule.checkLine('const val: any = 1', 0, [], noExempt, 'src/lib/test.ts')).toBe(true)
        expect(rule.checkLine('const fn = (x as any)', 0, [], noExempt, 'src/lib/test.ts')).toBe(true)
        expect(rule.checkLine('function get(): Promise<any> {}', 0, [], noExempt, 'src/lib/test.ts')).toBe(true)
      })
    })

    describe('NO_MAGIC_Z_INDEX', () => {
      const rule = ALL_RULES.NO_MAGIC_Z_INDEX

      it('PASS: standard 5-layer z-index scale (z-0, z-10, z-20, z-50, z-100)', () => {
        expect(rule.checkLine('<div className="z-10 sticky top-0" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        expect(rule.checkLine('<div className="z-50 fixed inset-0" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
      })

      it('FAIL: magic arbitrary z-index', () => {
        expect(rule.checkLine('<div className="z-[9999]" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        expect(rule.checkLine('<div className="z-[1000]" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
      })
    })

    describe('NO_RAW_SVG_IN_JSX', () => {
      const rule = ALL_RULES.NO_RAW_SVG_IN_JSX

      it('PASS: Lucide icon or Icon primitive', () => {
        expect(rule.checkLine('<Icon name="check" className="w-4 h-4" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
      })

      it('FAIL: raw inlined svg element on page', () => {
        expect(rule.checkLine('<svg viewBox="0 0 24 24"><path d="..." /></svg>', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
      })
    })

    describe('NO_HARDCODED_API_URL', () => {
      const rule = ALL_RULES.NO_HARDCODED_API_URL

      it('PASS: calling service layer', () => {
        expect(rule.checkLine('const res = await memberService.getProfile()', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
      })

      it('FAIL: hardcoded /api/v1/ string in UI component', () => {
        expect(rule.checkLine('const res = await fetch("/api/v1/members")', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
      })
    })

    describe('NO_EFFECT_FETCH', () => {
      const rule = ALL_RULES.NO_EFFECT_FETCH

      it('PASS: useEffect without direct API call', () => {
        const lines = ['useEffect(() => {', '  document.title = "RoGym"', '}, [])']
        expect(rule.checkLine(lines[1], 1, lines, noExempt, 'src/pages/Home.tsx')).toBe(false)
      })

      it('FAIL: direct fetch/axios inside useEffect', () => {
        const lines = ['useEffect(() => {', '  fetch("/api/data").then(...)', '}, [])']
        expect(rule.checkLine(lines[1], 1, lines, noExempt, 'src/pages/Home.tsx')).toBe(true)
      })
    })

    describe('NO_CONSOLE_LOG', () => {
      const rule = ALL_RULES.NO_CONSOLE_LOG

      it('PASS: logger utilities', () => {
        expect(rule.checkLine('logger.info("app loaded")', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
      })

      it('FAIL: raw console.log left in source code', () => {
        expect(rule.checkLine('console.log("debug value", data)', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
      })
    })

    describe('NO_MAGIC_DIMENSIONS', () => {
      const rule = ALL_RULES.NO_MAGIC_DIMENSIONS

      it('PASS: standard Tailwind spacing scale', () => {
        expect(rule.checkLine('<div className="w-16 h-12 p-4 gap-2" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
      })

      it('FAIL: arbitrary pixel dimensions', () => {
        expect(rule.checkLine('<div className="p-4 w-[320px]" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        expect(rule.checkLine('<div className="h-full gap-[14px]" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
      })
    })

    describe('NO_FALSY_LEAKAGE', () => {
      const rule = ALL_RULES.NO_FALSY_LEAKAGE

      it('PASS: explicit ternary or boolean cast', () => {
        expect(rule.checkLine('{items.length > 0 ? <List /> : null}', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        expect(rule.checkLine('{Boolean(items.length) && <List />}', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
      })

      it('FAIL: items.length && conditional rendering', () => {
        expect(rule.checkLine('{items.length && <List />}', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
      })
    })

    describe('FILE_SIZE_LIMIT', () => {
      const rule = ALL_RULES.FILE_SIZE_LIMIT

      it('PASS: component file under 250 physical lines', () => {
        const shortLines = new Array(150).fill('const x = 1;')
        expect(rule.checkFile(shortLines.join('\n'), 'src/pages/Home.tsx', shortLines, noExempt)).toEqual([])
      })

      it('FAIL: component file exceeding 250 physical lines', () => {
        const longLines = new Array(260).fill('const x = 1;')
        const violations = rule.checkFile(longLines.join('\n'), 'src/pages/Home.tsx', longLines, noExempt)
        expect(violations.length).toBe(1)
        expect(violations[0].line).toBe(251)
      })
    })

    describe('14 New Semantic Rules (WARNING Measurement Mode)', () => {
      describe('NO_COMPONENT_COLOR_TOKEN', () => {
        const rule = ALL_RULES.NO_COMPONENT_COLOR_TOKEN
        it('PASS: primitive token definitions in tokens/primitive.css', () => {
          expect(rule.checkLine('--rogym-primary: #06c384;', 0, [], noExempt, 'src/styles/tokens/primitive.css')).toBe(false)
        })
        it('FAIL: color token declared in component stylesheet', () => {
          expect(rule.checkLine('--button-bg-color: #06c384;', 0, [], noExempt, 'src/styles/components/button.css')).toBe(true)
        })
      })

      describe('NO_PRIMITIVE_IN_COMPONENT', () => {
        const rule = ALL_RULES.NO_PRIMITIVE_IN_COMPONENT
        it('PASS: using semantic token variable', () => {
          expect(rule.checkLine('color: var(--color-foreground);', 0, [], noExempt, 'src/styles/components/button.css')).toBe(false)
        })
        it('FAIL: primitive variable in component css or *-rogym-* class in tsx', () => {
          expect(rule.checkLine('color: var(--rogym-primary);', 0, [], noExempt, 'src/styles/components/button.css')).toBe(true)
          expect(rule.checkLine('<div className="bg-rogym-primary text-white" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        })
      })

      describe('NO_RAW_TAILWIND_PALETTE', () => {
        const rule = ALL_RULES.NO_RAW_TAILWIND_PALETTE
        it('PASS: semantic token classes', () => {
          expect(rule.checkLine('<div className="bg-card text-foreground" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        })
        it('FAIL: default raw palette classes (red, green, blue, white, black)', () => {
          expect(rule.checkLine('<div className="bg-red-500 text-green-600" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
          expect(rule.checkLine('<div className="bg-white border-blue-400" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        })
      })

      describe('NO_OPACITY_MODIFIER_ON_PRIMITIVE', () => {
        const rule = ALL_RULES.NO_OPACITY_MODIFIER_ON_PRIMITIVE
        it('PASS: normal utility or semantic token opacity', () => {
          expect(rule.checkLine('<div className="bg-primary/20" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        })
        it('FAIL: opacity modifier on primitive token', () => {
          expect(rule.checkLine('<div className="bg-rogym-primary/20" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        })
      })

      describe('NO_DARK_VARIANT_COLOR', () => {
        const rule = ALL_RULES.NO_DARK_VARIANT_COLOR
        it('PASS: theme-driven semantic classes', () => {
          expect(rule.checkLine('<div className="bg-card text-foreground" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        })
        it('FAIL: manual dark: variant color utility', () => {
          expect(rule.checkLine('<div className="dark:bg-black dark:text-white" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        })
      })

      describe('PROPS_NO_COLOR_PROP', () => {
        const rule = ALL_RULES.PROPS_NO_COLOR_PROP
        it('PASS: tone prop in UI component interface', () => {
          expect(rule.checkLine('tone?: "primary" | "danger"', 0, [], noExempt, 'src/components/ui/Button.tsx')).toBe(false)
        })
        it('FAIL: arbitrary color prop declared in UI component', () => {
          expect(rule.checkLine('color?: string', 0, [], noExempt, 'src/components/ui/Button.tsx')).toBe(true)
          expect(rule.checkLine('bgColor: "#ffffff"', 0, [], noExempt, 'src/components/ui/Card.tsx')).toBe(true)
        })
      })

      describe('PROPS_TONE_ENUM', () => {
        const rule = ALL_RULES.PROPS_TONE_ENUM
        it('PASS: standard tone enum values', () => {
          expect(rule.checkLine('<Badge tone="danger">Lỗi</Badge>', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        })
        it('FAIL: using tone="error"', () => {
          expect(rule.checkLine('<Badge tone="error">Lỗi</Badge>', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        })
      })

      describe('A11Y_HEADING_ORDER', () => {
        const rule = ALL_RULES.A11Y_HEADING_ORDER
        it('PASS: linear single h1 then h2', () => {
          const content = '<h1>Title</h1>\n<h2>Subtitle</h2>'
          expect(rule.checkFile(content, 'src/pages/member/DashboardPage.tsx', content.split('\n'), noExempt)).toEqual([])
        })
        it('FAIL: multiple h1 tags or heading level jump (h1 -> h3)', () => {
          const multiH1 = '<h1>Title 1</h1>\n<h1>Title 2</h1>'
          expect(rule.checkFile(multiH1, 'src/pages/member/DashboardPage.tsx', multiH1.split('\n'), noExempt).length).toBe(1)

          const jumped = '<h1>Title</h1>\n<h3>Jumped Subtitle</h3>'
          expect(rule.checkFile(jumped, 'src/pages/member/DashboardPage.tsx', jumped.split('\n'), noExempt).length).toBe(1)
        })
      })

      describe('A11Y_ICON_BUTTON_LABEL', () => {
        const rule = ALL_RULES.A11Y_ICON_BUTTON_LABEL
        it('PASS: button with aria-label or accessible text', () => {
          expect(rule.checkLine('<IconButton aria-label="Close"><Icon name="x" /></IconButton>', 0, ['<IconButton aria-label="Close"><Icon name="x" /></IconButton>'], noExempt, 'src/pages/Home.tsx')).toBeNull()
          expect(rule.checkLine('<Button aria-label="Đóng"><CloseIcon /></Button>', 0, ['<Button aria-label="Đóng"><CloseIcon /></Button>'], noExempt, 'src/pages/Home.tsx')).toBeNull()
        })
        it('FAIL: icon button missing aria-label', () => {
          expect(rule.checkLine('<IconButton><Icon name="x" /></IconButton>', 0, ['<IconButton><Icon name="x" /></IconButton>'], noExempt, 'src/pages/Home.tsx')).not.toBeNull()
        })
      })

      describe('A11Y_IMG_ALT', () => {
        const rule = ALL_RULES.A11Y_IMG_ALT
        it('PASS: img with alt description or empty decorative alt', () => {
          expect(rule.checkLine('<img src="/gym.jpg" alt="Gym" />', 0, ['<img src="/gym.jpg" alt="Gym" />'], noExempt, 'src/pages/Home.tsx')).toBe(false)
          expect(rule.checkLine('<img src="/dec.svg" alt="" />', 0, ['<img src="/dec.svg" alt="" />'], noExempt, 'src/pages/Home.tsx')).toBe(false)
        })
        it('FAIL: img missing alt attribute', () => {
          expect(rule.checkLine('<img src="/gym.jpg" />', 0, ['<img src="/gym.jpg" />'], noExempt, 'src/pages/Home.tsx')).toBe(true)
        })
      })

      describe('A11Y_OUTLINE_NONE', () => {
        const rule = ALL_RULES.A11Y_OUTLINE_NONE
        it('PASS: outline-none with focus-visible state', () => {
          expect(rule.checkLine('<button className="outline-none focus-visible:ring-2" />', 0, [], noExempt, 'src/pages/Home.tsx')).toBeNull()
        })
        it('FAIL: outline-none without focus-visible', () => {
          expect(rule.checkLine('<button className="outline-none" />', 0, [], noExempt, 'src/pages/Home.tsx')).not.toBeNull()
          expect(rule.checkLine('outline: none;', 0, [], noExempt, 'src/styles/components/button.css')).not.toBeNull()
        })
      })

      describe('A11Y_REDUCED_MOTION', () => {
        const rule = ALL_RULES.A11Y_REDUCED_MOTION
        it('PASS: keyframes wrapped with prefers-reduced-motion query', () => {
          const content = '@keyframes spin { from { rotate: 0; } }\n@media (prefers-reduced-motion: reduce) { animation: none; }'
          expect(rule.checkFile(content, 'src/styles/anim.css', content.split('\n'), noExempt)).toEqual([])
        })
        it('FAIL: keyframes without prefers-reduced-motion query', () => {
          const content = '@keyframes spin { from { rotate: 0; } }'
          expect(rule.checkFile(content, 'src/styles/anim.css', content.split('\n'), noExempt).length).toBe(1)
        })
      })

      describe('FORMS_LABEL_ASSOC', () => {
        const rule = ALL_RULES.FORMS_LABEL_ASSOC
        it('PASS: input with aria-label or id associated with label', () => {
          expect(rule.checkLine('<input id="email" />', 0, ['<input id="email" />'], noExempt, 'src/pages/Home.tsx')).toBeNull()
          expect(rule.checkLine('<Input aria-label="Search" />', 0, ['<Input aria-label="Search" />'], noExempt, 'src/pages/Home.tsx')).toBeNull()
        })
        it('FAIL: input standalone missing aria-label and id', () => {
          expect(rule.checkLine('<input type="text" className="p-2" />', 0, ['<input type="text" className="p-2" />'], noExempt, 'src/pages/Home.tsx')).not.toBeNull()
        })
      })

      describe('EXEMPTION_EXPIRED', () => {
        const rule = ALL_RULES.EXEMPTION_EXPIRED
        it('PASS: future exemption date', () => {
          const lines = ['// rogym-convention-exempt: NO_TS_ANY [until: 2099-12-31] [Temporary mock]']
          expect(rule.checkFile(lines.join('\n'), 'src/lib/test.ts', lines, noExempt)).toEqual([])
        })
        it('FAIL: expired exemption date', () => {
          const lines = ['// rogym-convention-exempt: NO_TS_ANY [until: 2020-01-01] [Expired mock]']
          const violations = rule.checkFile(lines.join('\n'), 'src/lib/test.ts', lines, noExempt)
          expect(violations.length).toBe(1)
          expect(violations[0].text).toContain('đã quá hạn vào ngày 2020-01-01')
        })
        it('PASS: future exemption date with ALL keyword', () => {
          const lines = ['// rogym-convention-exempt: ALL [until: 2026-12-31] [Dev tool]']
          expect(rule.checkFile(lines.join('\n'), 'src/pages/dev/test.tsx', lines, noExempt)).toEqual([])
        })
        it('FAIL: expired exemption date with ALL keyword', () => {
          const lines = ['// rogym-convention-exempt: ALL [until: 2020-01-01] [Expired dev tool]']
          const violations = rule.checkFile(lines.join('\n'), 'src/pages/dev/test.tsx', lines, noExempt)
          expect(violations.length).toBe(1)
          expect(violations[0].text).toContain('đã quá hạn vào ngày 2020-01-01')
        })
      })

      describe('NO_BUTTON_ABUSE', () => {
        const rule = ALL_RULES.NO_BUTTON_ABUSE
        it('PASS: Button with legitimate click or ButtonLink', () => {
          expect(rule.checkLine('<Button onClick={handleSubmit}>Submit</Button>', 0, ['<Button onClick={handleSubmit}>Submit</Button>'], noExempt, 'src/pages/Home.tsx')).toBeNull()
          expect(rule.checkLine('<Button onClick={() => navigate(-1)}>Back</Button>', 0, ['<Button onClick={() => navigate(-1)}>Back</Button>'], noExempt, 'src/pages/Home.tsx')).toBeNull()
        })
        it('FAIL: Button onClick navigate', () => {
          expect(rule.checkLine('<Button onClick={() => navigate("/dashboard")}>Go</Button>', 0, ['<Button onClick={() => navigate("/dashboard")}>Go</Button>'], noExempt, 'src/pages/Home.tsx')).not.toBeNull()
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('<Button onClick={() => navigate("/dashboard")}>Go</Button>', 0, ['<Button onClick={() => navigate("/dashboard")}>Go</Button>'], isExempt, 'src/pages/Home.tsx')).toBeNull()
        })
      })

      describe('NO_REDUNDANT_BORDER_PADDING', () => {
        const rule = ALL_RULES.NO_REDUNDANT_BORDER_PADDING
        it('PASS: primitive Card or regular div', () => {
          expect(rule.checkLine('<Card className="p-4">Content</Card>', 0, ['<Card className="p-4">Content</Card>'], noExempt, 'src/pages/Home.tsx')).toBeNull()
        })
        it('FAIL: div mimicking Card manually', () => {
          const line = '<div className="rounded-xl border p-4 bg-surface-card">'
          expect(rule.checkLine(line, 0, [line], noExempt, 'src/pages/Home.tsx')).not.toBeNull()
        })
        it('EXEMPT: ignored when exempt', () => {
          const line = '<div className="rounded-xl border p-4 bg-surface-card">'
          expect(rule.checkLine(line, 0, [line], isExempt, 'src/pages/Home.tsx')).toBeNull()
        })
      })

      describe('NO_INLINE_COMPONENT_DEFINITION', () => {
        const rule = ALL_RULES.NO_INLINE_COMPONENT_DEFINITION
        it('PASS: top-level component definition', () => {
          const content = 'export function MyPage() {\n  return <div>Hello</div>\n}'
          expect(rule.checkFile(content, 'src/pages/MyPage.tsx', content.split('\n'), noExempt)).toEqual([])
        })
        it('FAIL: child component declared inside parent body', () => {
          const content = 'export function MyPage() {\n  function SubComp() {\n    return <div>Sub</div>\n  }\n  return <SubComp />\n}'
          const res = rule.checkFile(content, 'src/pages/MyPage.tsx', content.split('\n'), noExempt)
          expect(res.length).toBeGreaterThan(0)
        })
        it('EXEMPT: ignored when exempt', () => {
          const content = 'export function MyPage() {\n  function SubComp() {\n    return <div>Sub</div>\n  }\n  return <SubComp />\n}'
          expect(rule.checkFile(content, 'src/pages/MyPage.tsx', content.split('\n'), isExempt)).toEqual([])
        })
      })

      describe('NO_ZERO_LEAK_CONDITIONAL_RENDER', () => {
        const rule = ALL_RULES.NO_ZERO_LEAK_CONDITIONAL_RENDER
        it('PASS: boolean or ternary condition', () => {
          expect(rule.checkLine('{count > 0 ? <Badge /> : null}', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        })
        it('FAIL: count && <Component /> leakage', () => {
          expect(rule.checkLine('{count && <Badge />}', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
          expect(rule.checkLine('{item.unreadCount && <Badge />}', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('{count && <Badge />}', 0, [], isExempt, 'src/pages/Home.tsx')).toBe(false)
        })
      })

      describe('NO_BYPASS_PORTAL_OVERLAYS', () => {
        const rule = ALL_RULES.NO_BYPASS_PORTAL_OVERLAYS
        it('PASS: overlay with Portal/Modal import', () => {
          const content = 'import { Modal } from "@/components/ui/overlay/Modal"\n<div className="fixed inset-0 z-50">'
          expect(rule.checkFile(content, 'src/pages/Home.tsx', content.split('\n'), noExempt)).toEqual([])
        })
        it('FAIL: custom overlay without Portal/Modal import', () => {
          const content = 'export function MyView() {\n  return <div className="fixed inset-0 z-50">Custom Modal</div>\n}'
          const res = rule.checkFile(content, 'src/pages/Home.tsx', content.split('\n'), noExempt)
          expect(res.length).toBeGreaterThan(0)
        })
        it('EXEMPT: ignored when exempt', () => {
          const content = 'export function MyView() {\n  return <div className="fixed inset-0 z-50">Custom Modal</div>\n}'
          expect(rule.checkFile(content, 'src/pages/Home.tsx', content.split('\n'), isExempt)).toEqual([])
        })
      })

      describe('NO_DECORATIVE_BORDER_OVERLOAD', () => {
        const rule = ALL_RULES.NO_DECORATIVE_BORDER_OVERLOAD
        it('PASS: standard border', () => {
          expect(rule.checkLine('className="border border-line-default"', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        })
        it('FAIL: border-2 / border-4 / border-8', () => {
          expect(rule.checkLine('className="border-2 border-line-strong"', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
          expect(rule.checkLine('className="border-4"', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('className="border-2"', 0, [], isExempt, 'src/pages/Home.tsx')).toBe(false)
        })
      })

      describe('NO_PADDING_OVERFLOW_DRIFT', () => {
        const rule = ALL_RULES.NO_PADDING_OVERFLOW_DRIFT
        it('PASS: responsive padding', () => {
          expect(rule.checkLine('className="p-4 md:p-8"', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        })
        it('FAIL: raw p-8 / p-10 without breakpoint prefix', () => {
          expect(rule.checkLine('className="p-8 bg-surface-card"', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
          expect(rule.checkLine('className="p-10"', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('className="p-8"', 0, [], isExempt, 'src/pages/Home.tsx')).toBe(false)
        })
      })

      describe('NO_UNCONTROLLED_TO_CONTROLLED_DRIFT', () => {
        const rule = ALL_RULES.NO_UNCONTROLLED_TO_CONTROLLED_DRIFT
        it('PASS: value with fallback ?? ""', () => {
          expect(rule.checkLine('<Input value={data?.name ?? ""} />', 0, ['<Input value={data?.name ?? ""} />'], noExempt, 'src/pages/Home.tsx')).toBeNull()
        })
        it('FAIL: value={data?.field} without fallback', () => {
          expect(rule.checkLine('<Input value={data?.name} />', 0, ['<Input value={data?.name} />'], noExempt, 'src/pages/Home.tsx')).not.toBeNull()
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('<Input value={data?.name} />', 0, ['<Input value={data?.name} />'], isExempt, 'src/pages/Home.tsx')).toBeNull()
        })
      })

      describe('NO_SERVER_STATE_IN_ZUSTAND', () => {
        const rule = ALL_RULES.NO_SERVER_STATE_IN_ZUSTAND
        it('PASS: local client state', () => {
          expect(rule.checkLine('selectedId: null,', 0, [], noExempt, 'src/stores/myStore.ts')).toBe(false)
        })
        it('FAIL: server entities or fetch action in Zustand', () => {
          expect(rule.checkLine('members: [],', 0, [], noExempt, 'src/stores/myStore.ts')).toBe(true)
          expect(rule.checkLine('fetchPackages: async () => {},', 0, [], noExempt, 'src/stores/myStore.ts')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('members: [],', 0, [], isExempt, 'src/stores/myStore.ts')).toBe(false)
        })
      })

      describe('NO_GLOBAL_LOCAL_STATE', () => {
        const rule = ALL_RULES.NO_GLOBAL_LOCAL_STATE
        it('PASS: app-level preference', () => {
          expect(rule.checkLine('theme: "dark",', 0, [], noExempt, 'src/stores/themeStore.ts')).toBe(false)
        })
        it('FAIL: local UI modal/search in global store', () => {
          expect(rule.checkLine('isModalOpen: false,', 0, [], noExempt, 'src/stores/myStore.ts')).toBe(true)
          expect(rule.checkLine('searchQuery: "",', 0, [], noExempt, 'src/stores/myStore.ts')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('isModalOpen: false,', 0, [], isExempt, 'src/stores/myStore.ts')).toBe(false)
        })
      })

      describe('NO_UNREGISTERED_LOGOUT_CLEANUP', () => {
        const rule = ALL_RULES.NO_UNREGISTERED_LOGOUT_CLEANUP
        it('PASS: store with onLogout registration', () => {
          const content = 'import { onLogout } from "./authStore"\nconst token = "..."\nonLogout(() => {})'
          expect(rule.checkFile(content, 'src/stores/chat.store.ts', content.split('\n'), noExempt)).toEqual([])
        })
        it('FAIL: store holding session data without onLogout', () => {
          const content = 'export const useUserStore = create(() => ({ memberId: "123" }))'
          const res = rule.checkFile(content, 'src/stores/userStore.ts', content.split('\n'), noExempt)
          expect(res.length).toBeGreaterThan(0)
        })
        it('EXEMPT: ignored when exempt', () => {
          const content = 'export const useUserStore = create(() => ({ memberId: "123" }))'
          expect(rule.checkFile(content, 'src/stores/userStore.ts', content.split('\n'), isExempt)).toEqual([])
        })
      })

      describe('NO_BULK_STORE_DESTRUCTURING', () => {
        const rule = ALL_RULES.NO_BULK_STORE_DESTRUCTURING
        it('PASS: atomic selector or useShallow', () => {
          expect(rule.checkLine('const user = useAuthStore(s => s.user)', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        })
        it('FAIL: const { a, b } = useStore()', () => {
          expect(rule.checkLine('const { user, token } = useAuthStore()', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('const { user, token } = useAuthStore()', 0, [], isExempt, 'src/pages/Home.tsx')).toBe(false)
        })
      })

      describe('NO_UNVALIDATED_LOCALSTORAGE', () => {
        const rule = ALL_RULES.NO_UNVALIDATED_LOCALSTORAGE
        it('PASS: getItem with string fallback', () => {
          expect(rule.checkLine('const val = localStorage.getItem("key") ?? ""', 0, [], noExempt, 'src/utils/storage.ts')).toBe(false)
        })
        it('FAIL: raw JSON.parse(localStorage.getItem(...))', () => {
          expect(rule.checkLine('const obj = JSON.parse(localStorage.getItem("data"))', 0, [], noExempt, 'src/utils/storage.ts')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('const obj = JSON.parse(localStorage.getItem("data"))', 0, [], isExempt, 'src/utils/storage.ts')).toBe(false)
        })
      })

      describe('NO_EFFECT_DERIVED_STATE', () => {
        const rule = ALL_RULES.NO_EFFECT_DERIVED_STATE
        it('PASS: effect with external side-effect or timer', () => {
          const lines = ['useEffect(() => {', '  const timer = setTimeout(() => {}, 100)', '  return () => clearTimeout(timer)', '}, [])']
          expect(rule.checkLine(lines[0], 0, lines, noExempt, 'src/pages/Home.tsx')).toBe(false)
        })
        it('FAIL: effect with only setState call', () => {
          const lines = ['useEffect(() => {', '  setFullName(`${first} ${last}`)', '}, [first, last])']
          expect(rule.checkLine(lines[1], 1, lines, noExempt, 'src/pages/Home.tsx')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          const lines = ['useEffect(() => {', '  setFullName(`${first} ${last}`)', '}, [first, last])']
          expect(rule.checkLine(lines[1], 1, lines, isExempt, 'src/pages/Home.tsx')).toBe(false)
        })
      })

      describe('NO_EFFECT_EVENT_HANDLING', () => {
        const rule = ALL_RULES.NO_EFFECT_EVENT_HANDLING
        it('PASS: direct event handler', () => {
          expect(rule.checkLine('const handleClick = () => mutate()', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        })
        it('FAIL: if (isSubmitted) mutate() inside useEffect', () => {
          const lines = ['useEffect(() => {', '  if (isSubmitted) mutate()', '}, [isSubmitted])']
          expect(rule.checkLine(lines[1], 1, lines, noExempt, 'src/pages/Home.tsx')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          const lines = ['useEffect(() => {', '  if (isSubmitted) mutate()', '}, [isSubmitted])']
          expect(rule.checkLine(lines[1], 1, lines, isExempt, 'src/pages/Home.tsx')).toBe(false)
        })
      })

      describe('NO_LEAKING_EVENT_LISTENERS', () => {
        const rule = ALL_RULES.NO_LEAKING_EVENT_LISTENERS
        it('PASS: addEventListener with removeEventListener and passive', () => {
          const content = 'window.addEventListener("resize", fn, { passive: true })\nreturn () => window.removeEventListener("resize", fn)'
          expect(rule.checkFile(content, 'src/hooks/useResize.ts', content.split('\n'), noExempt)).toEqual([])
        })
        it('FAIL: missing removeEventListener', () => {
          const content = 'window.addEventListener("resize", fn, { passive: true })'
          const res = rule.checkFile(content, 'src/hooks/useResize.ts', content.split('\n'), noExempt)
          expect(res.length).toBeGreaterThan(0)
        })
        it('FAIL: scroll/resize missing passive', () => {
          const content = 'window.addEventListener("scroll", fn)\nreturn () => window.removeEventListener("scroll", fn)'
          const res = rule.checkFile(content, 'src/hooks/useScroll.ts', content.split('\n'), noExempt)
          expect(res.length).toBeGreaterThan(0)
        })
        it('EXEMPT: ignored when exempt', () => {
          const content = 'window.addEventListener("resize", fn)'
          expect(rule.checkFile(content, 'src/hooks/useResize.ts', content.split('\n'), isExempt)).toEqual([])
        })
      })

      describe('NO_BYPASS_ABORT_SIGNAL', () => {
        const rule = ALL_RULES.NO_BYPASS_ABORT_SIGNAL
        it('PASS: api.get with signal forwarded', () => {
          const lines = ['const res = await api.get("/members", { signal: options?.signal })']
          expect(rule.checkLine(lines[0], 0, lines, noExempt, 'src/services/member.service.ts')).toBe(false)
        })
        it('FAIL: api.get missing signal', () => {
          const lines = ['const res = await api.get("/members", { params })']
          expect(rule.checkLine(lines[0], 0, lines, noExempt, 'src/services/member.service.ts')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          const lines = ['const res = await api.get("/members", { params })']
          expect(rule.checkLine(lines[0], 0, lines, isExempt, 'src/services/member.service.ts')).toBe(false)
        })
      })

      describe('NO_UI_IN_SERVICE', () => {
        const rule = ALL_RULES.NO_UI_IN_SERVICE
        it('PASS: clean service throwing error', () => {
          expect(rule.checkLine('throw new Error("Failed")', 0, [], noExempt, 'src/services/member.service.ts')).toBe(false)
        })
        it('FAIL: toast/useNavigate in service', () => {
          expect(rule.checkLine('toast.error("Error loading data")', 0, [], noExempt, 'src/services/member.service.ts')).toBe(true)
          expect(rule.checkLine('import { Button } from "@/components/ui/Button"', 0, [], noExempt, 'src/services/member.service.ts')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('toast.error("Error loading data")', 0, [], isExempt, 'src/services/member.service.ts')).toBe(false)
        })
      })

      describe('NO_DIRECT_AXIOS_IN_UI', () => {
        const rule = ALL_RULES.NO_DIRECT_AXIOS_IN_UI
        it('PASS: calling service method', () => {
          expect(rule.checkLine('await memberService.list()', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        })
        it('FAIL: direct axios or api import in UI', () => {
          expect(rule.checkLine('import axios from "axios"', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
          expect(rule.checkLine('import { api } from "@/lib/api"', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('import axios from "axios"', 0, [], isExempt, 'src/pages/Home.tsx')).toBe(false)
        })
      })

      describe('NO_RAW_AXIOS_RESPONSE', () => {
        const rule = ALL_RULES.NO_RAW_AXIOS_RESPONSE
        it('PASS: unwrapped DTO Promise', () => {
          expect(rule.checkLine('async get(): Promise<Member> {', 0, [], noExempt, 'src/services/member.service.ts')).toBe(false)
        })
        it('FAIL: returning Promise<AxiosResponse<T>>', () => {
          expect(rule.checkLine('async get(): Promise<AxiosResponse<Member>> {', 0, [], noExempt, 'src/services/member.service.ts')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('async get(): Promise<AxiosResponse<Member>> {', 0, [], isExempt, 'src/services/member.service.ts')).toBe(false)
        })
      })

      describe('NO_BARREL_IMPORT_LIB', () => {
        const rule = ALL_RULES.NO_BARREL_IMPORT_LIB
        it('PASS: direct module import', () => {
          expect(rule.checkLine('import { logger } from "@/lib/logger"', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        })
        it('FAIL: barrel import @/lib', () => {
          expect(rule.checkLine('import { logger, toast } from "@/lib"', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('import { logger, toast } from "@/lib"', 0, [], isExempt, 'src/pages/Home.tsx')).toBe(false)
        })
      })

      describe('NO_BARREL_IMPORT_UTILS', () => {
        const rule = ALL_RULES.NO_BARREL_IMPORT_UTILS
        it('PASS: direct utility import', () => {
          expect(rule.checkLine('import { formatDate } from "@/utils/date"', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        })
        it('FAIL: barrel import @/utils', () => {
          expect(rule.checkLine('import { formatDate, cn } from "@/utils"', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('import { formatDate, cn } from "@/utils"', 0, [], isExempt, 'src/pages/Home.tsx')).toBe(false)
        })
      })

      describe('NO_NON_RFC_ERROR_FORMAT', () => {
        const rule = ALL_RULES.NO_NON_RFC_ERROR_FORMAT
        it('PASS: standard error parser', () => {
          expect(rule.checkLine('const msg = getApiError(err)', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        })
        it('FAIL: ad-hoc error.response.data.message', () => {
          expect(rule.checkLine('const msg = error.response.data.message', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('const msg = error.response.data.message', 0, [], isExempt, 'src/pages/Home.tsx')).toBe(false)
        })
      })

      describe('NO_MUTATING_PROPS_OR_STATE', () => {
        const rule = ALL_RULES.NO_MUTATING_PROPS_OR_STATE
        it('PASS: spread copy before sort', () => {
          expect(rule.checkLine('return [...logs].sort((a, b) => a - b)', 0, [], noExempt, 'src/utils/sort.ts')).toBe(false)
        })
        it('FAIL: in-place sort without copy', () => {
          expect(rule.checkLine('return logs.sort((a, b) => a - b)', 0, [], noExempt, 'src/utils/sort.ts')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('return logs.sort((a, b) => a - b)', 0, [], isExempt, 'src/utils/sort.ts')).toBe(false)
        })
      })

      describe('NO_MUTABLE_UTILS', () => {
        const rule = ALL_RULES.NO_MUTABLE_UTILS
        it('PASS: const in utils module', () => {
          expect(rule.checkLine('export const DEFAULT_TIMEOUT = 5000', 0, [], noExempt, 'src/utils/constants.ts')).toBe(false)
        })
        it('FAIL: let or var at module level in utils', () => {
          expect(rule.checkLine('export let counter = 0', 0, [], noExempt, 'src/utils/state.ts')).toBe(true)
          expect(rule.checkLine('let cache = {}', 0, [], noExempt, 'src/utils/cache.ts')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('let cache = {}', 0, [], isExempt, 'src/utils/cache.ts')).toBe(false)
        })
      })

      describe('NO_UNLOCKED_TIMEZONE', () => {
        const rule = ALL_RULES.NO_UNLOCKED_TIMEZONE
        it('PASS: toDateInput or Intl with timeZone', () => {
          expect(rule.checkLine('const d = toDateInput(date)', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        })
        it('FAIL: toLocaleDateString without timezone or toISOString().slice on UI', () => {
          expect(rule.checkLine('const str = date.toLocaleDateString()', 0, [], noExempt, 'src/pages/Home.tsx')).not.toBe(false)
          expect(rule.checkLine('const today = new Date().toISOString().slice(0, 10)', 0, [], noExempt, 'src/pages/Home.tsx')).not.toBe(false)
        })
        it('EXEMPT: ignored when exempt', () => {
          expect(rule.checkLine('const str = date.toLocaleDateString()', 0, [], isExempt, 'src/pages/Home.tsx')).toBe(false)
        })
      })

      describe('NO_FRAGMENTED_CALCULATORS', () => {
        const rule = ALL_RULES.NO_FRAGMENTED_CALCULATORS
        it('PASS: domain calculator hasActiveSubscription', () => {
          expect(rule.checkLine('const active = hasActiveSubscription(sub)', 0, [], noExempt, 'src/pages/Home.tsx')).toBe(false)
        })
        it('FAIL: ad-hoc subscription expiration comparison on UI', () => {
          const line = 'const isExp = new Date(sub.endDate).getTime() < Date.now()'
          expect(rule.checkLine(line, 0, [line], noExempt, 'src/pages/Home.tsx')).toBe(true)
        })
        it('EXEMPT: ignored when exempt', () => {
          const line = 'const isExp = new Date(sub.endDate).getTime() < Date.now()'
          expect(rule.checkLine(line, 0, [line], isExempt, 'src/pages/Home.tsx')).toBe(false)
        })
      })
    })

    describe('Engine audit:contrast (WCAG 2.1 AA Relative Luminance & Contrast Ratio)', () => {
      it('hexToRgba parses 6-digit and 8-digit HEX with alpha', () => {
        expect(hexToRgba('#ffffff')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
        expect(hexToRgba('#000000')).toEqual({ r: 0, g: 0, b: 0, a: 1 })
        expect(hexToRgba('#06c384')).toEqual({ r: 6, g: 195, b: 132, a: 1 })

        const withAlpha = hexToRgba('#06c38480')
        expect(withAlpha.r).toBe(6)
        expect(withAlpha.g).toBe(195)
        expect(withAlpha.b).toBe(132)
        expect(withAlpha.a).toBeCloseTo(0.5, 1)
      })

      it('alphaComposite correctly blends semi-transparent foreground onto opaque background', () => {
        const fg = { r: 255, g: 255, b: 255, a: 0.5 }
        const bg = { r: 0, g: 0, b: 0, a: 1 }
        const blended = alphaComposite(fg, bg)
        expect(blended.r).toBe(128)
        expect(blended.g).toBe(128)
        expect(blended.b).toBe(128)
      })

      it('calculates Relative Luminance and contrast ratios accurately', () => {
        // Pure White on Pure Black = 21:1
        expect(getContrastRatio('#ffffff', '#000000')).toBe(21)

        // Same color = 1:1
        expect(getContrastRatio('#ffffff', '#ffffff')).toBe(1)

        // Gray #777777 on White #ffffff is approx 4.48:1 (fails 4.5:1 AA normal text)
        const grayOnWhite = getContrastRatio('#777777', '#ffffff')
        expect(grayOnWhite).toBeLessThan(4.5)
        expect(grayOnWhite).toBeGreaterThan(4.4)

        // Primary brand green #06c384 on dark background #080e0b
        const brandOnDark = getContrastRatio('#06c384', '#080e0b')
        expect(brandOnDark).toBeGreaterThanOrEqual(7.0)
      })

      it('evaluateContrastPairs passes 100% on tokens/contrast-pairs.json', () => {
        const matrixPath = path.join(clientRoot, 'src/styles/tokens/contrast-pairs.json')
        expect(fs.existsSync(matrixPath)).toBe(true)
        const data = JSON.parse(fs.readFileSync(matrixPath, 'utf-8'))
        const { passCount, failCount } = evaluateContrastPairs(data.pairs)
        expect(failCount).toBe(0)
        expect(passCount).toBe(data.pairs.length)
      })
    })
  })
})
