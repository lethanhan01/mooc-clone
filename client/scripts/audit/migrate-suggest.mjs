#!/usr/bin/env node
/**
 * migrate-suggest.mjs — RoGym Semantic Design Migration Tool (Task P5-00)
 *
 * Quét toàn bộ mã nguồn TSX, so khớp với Bảng ánh xạ §4 (phase-5-css-token-migration.md)
 * và in ra danh sách: file:line old_class → suggested_semantic_class.
 *
 * Cung cấp:
 *   --path=<path>    : Đường dẫn quét (mặc định: src/)
 *   --apply          : Tự động thay thế các ánh xạ 1-1 an toàn tuyệt đối (Bảng 4.A)
 *   --json           : Xuất kết quả dạng JSON
 *   --summary        : Chỉ in bảng tóm tắt số lượng gợi ý
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientRoot = path.resolve(__dirname, '../..')
const srcRoot = path.join(clientRoot, 'src')

// ============================================================================
// BẢNG ÁNH XẠ 4.A: ÁNH XẠ 1-1 AN TOÀN TUYỆT ĐỐI
// ============================================================================
export const SAFE_1_TO_1_MAP = {
  // Brand & Actions
  'rogym-green-hover': 'action-primary-hover',
  'rogym-green-dark': 'action-primary-fg',
  'rogym-green': 'action-primary',
  'rogym-teal': 'action-accent',
  'rogym-error': 'status-danger-fg',

  // Surfaces
  'rogym-bg-base': 'surface-base',
  'rogym-bg-deep-alt': 'surface-deep',
  'rogym-bg-deep': 'surface-deep',
  'rogym-bg-card-hover': 'surface-card-hover',
  'rogym-bg-card-darker': 'surface-card',
  'rogym-bg-card': 'surface-card',
  'rogym-bg-elevated-green': 'surface-elevated',
  'rogym-bg-elevated': 'surface-elevated',
  'rogym-bg-glass': 'surface-overlay',

  // Foregrounds / Text
  'rogym-text-primary': 'fg-primary',
  'rogym-text-secondary': 'fg-secondary',
  'rogym-text-muted': 'fg-muted',
  'rogym-text-dim': 'fg-dim',
  'rogym-text-faint': 'fg-faint',

  // Borders / Lines
  'rogym-border-subtle': 'line-subtle',
  'rogym-border-section': 'line-section',
  'rogym-border-teal-dim': 'line-accent-subtle',
  'rogym-border-teal-hover': 'line-accent-hover',
  'rogym-border-teal-focus': 'line-focus',
  'rogym-border-white-dim': 'line-default',
  'rogym-border-white-hover': 'line-hover',

  // Shadows
  'rogym-shadow-glass': 'shadow-glass',
  'rogym-shadow-card': 'shadow-card',
}

// ============================================================================
// BẢNG ÁNH XẠ 4.B: CẦN NGỮ CẢNH NGHIỆP VỤ (CHỈ GỢI Ý REVIEW, KHÔNG AUTO-APPLY)
// ============================================================================
function getStatusSuffix(prefix) {
  if (prefix === 'text') return 'fg'
  if (prefix === 'border') return 'border'
  return 'solid'
}

function getNeutralSuggestion(prefix) {
  if (prefix === 'text') return 'text-fg-muted'
  if (prefix === 'border') return 'border-line-subtle'
  return 'bg-surface-card'
}

export const CONTEXTUAL_RULES = [
  {
    regex: /\b(text|bg|border)-red-(\d{2,3})\b/g,
    suggest: (_match, prefix) => `${prefix}-status-danger-${getStatusSuffix(prefix)}`,
    category: 'Status Danger',
  },
  {
    regex: /\b(text|bg|border)-(green|emerald|teal)-(\d{2,3})\b/g,
    suggest: (_match, prefix) => `${prefix}-${prefix === 'text' ? 'status-success-fg' : 'action-primary'} (hoặc status-success-solid)`,
    category: 'Status Success / Action Primary',
  },
  {
    regex: /\b(text|bg|border)-(amber|yellow|orange)-(\d{2,3})\b/g,
    suggest: (_match, prefix) => `${prefix}-status-warning-${getStatusSuffix(prefix)}`,
    category: 'Status Warning',
  },
  {
    regex: /\b(text|bg|border)-(blue|sky|indigo)-(\d{2,3})\b/g,
    suggest: (_match, prefix) => `${prefix}-status-info-${getStatusSuffix(prefix)}`,
    category: 'Status Info',
  },
  {
    regex: /\b(text|bg|border)-(purple|violet)-(\d{2,3})\b/g,
    suggest: (_match, prefix) => `${prefix}-status-accent-${getStatusSuffix(prefix)}`,
    category: 'Status Accent (VIP/Highlight)',
  },
  {
    regex: /\b(text|bg|border)-(gray|slate|zinc|neutral)-(\d{2,3})\b/g,
    suggest: (_match, prefix) => getNeutralSuggestion(prefix),
    category: 'Neutral / Muted',
  },
  {
    regex: /\btext-(white|black)\b/g,
    suggest: (_match, color) => color === 'white' ? 'text-fg-primary (hoặc text-fg-on-solid)' : 'text-fg-on-inverse',
    category: 'Pure Monochrome Text',
  },
  {
    regex: /\bbg-(white|black)\b/g,
    suggest: (_match, color) => color === 'white' ? 'bg-surface-card (hoặc bg-surface-base)' : 'bg-surface-base (hoặc bg-surface-overlay)',
    category: 'Pure Monochrome Surface',
  },
]

// ============================================================================
// HÀM TIỆN ÍCH QUÉT TẬP TIN
// ============================================================================
function getAllTsxFiles(dirPath, files = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === '.git' ||
        entry.name === 'coverage'
      ) {
        continue
      }
      getAllTsxFiles(fullPath, files)
    } else if (entry.name.endsWith('.tsx') && !entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
      files.push(fullPath)
    }
  }
  return files
}

function inferNewClassFromToken(oldToken, newToken) {
  if (oldToken.startsWith('rogym-text-')) return `text-${newToken}`
  if (oldToken.startsWith('rogym-bg-')) return `bg-${newToken}`
  if (oldToken.startsWith('rogym-border-')) return `border-${newToken}`
  return newToken
}

function findSafeTokenSuggestions(line, lineNum, relPath) {
  const suggestions = []

  for (const [oldToken, newToken] of Object.entries(SAFE_1_TO_1_MAP)) {
    // Dạng 1: class có prefix (bg-rogym-green, text-rogym-text-primary, border-rogym-border-subtle...)
    const prefixRegex = new RegExp(String.raw`\b(bg|text|border|ring|from|to|via)-${oldToken}\b`, 'g')
    let match
    while ((match = prefixRegex.exec(line)) !== null) {
      const prefix = match[1]
      suggestions.push({
        file: relPath,
        line: lineNum,
        type: '1-to-1-safe',
        oldClass: `${prefix}-${oldToken}`,
        newClass: `${prefix}-${newToken}`,
        isAutoApplicable: true,
      })
    }

    // Dạng 2: class trần (rogym-text-primary, rogym-bg-base...)
    const rawRegex = new RegExp(String.raw`\b${oldToken}\b`, 'g')
    while ((match = rawRegex.exec(line)) !== null) {
      const matchIdx = match.index
      const prevChar = line[matchIdx - 1]
      if (prevChar === '-') continue

      suggestions.push({
        file: relPath,
        line: lineNum,
        type: '1-to-1-safe',
        oldClass: oldToken,
        newClass: inferNewClassFromToken(oldToken, newToken),
        isAutoApplicable: true,
      })
    }

    // Dạng 3: arbitrary variable: bg-[var(--rogym-bg-card)]
    const varRegex = new RegExp(String.raw`\b(bg|text|border|ring)-\[var\(--${oldToken}\)\]`, 'g')
    while ((match = varRegex.exec(line)) !== null) {
      const prefix = match[1]
      suggestions.push({
        file: relPath,
        line: lineNum,
        type: '1-to-1-var',
        oldClass: `${prefix}-[var(--${oldToken})]`,
        newClass: `${prefix}-${newToken}`,
        isAutoApplicable: true,
      })
    }
  }

  return suggestions
}

function findContextualSuggestions(line, lineNum, relPath) {
  const suggestions = []
  for (const rule of CONTEXTUAL_RULES) {
    let cMatch
    while ((cMatch = rule.regex.exec(line)) !== null) {
      suggestions.push({
        file: relPath,
        line: lineNum,
        type: 'contextual-review',
        oldClass: cMatch[0],
        newClass: rule.suggest(cMatch[0], cMatch[1]),
        category: rule.category,
        isAutoApplicable: false,
      })
    }
  }
  return suggestions
}

function applySafeReplacements(content, suggestions) {
  let updated = content
  let changed = false

  const safeReplacements = suggestions
    .filter((s) => s.isAutoApplicable)
    .sort((a, b) => b.oldClass.length - a.oldClass.length)

  for (const s of safeReplacements) {
    if (updated.includes(s.oldClass)) {
      const escaped = s.oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const leftBoundary = /^\w/.test(s.oldClass) ? '(?<=^|[\\s"\'`{}[\\]])' : ''
      const rightBoundary = '(?=[\\s"\'`{}[\\]]|/|$)'
      const replaceRegex = new RegExp(`${leftBoundary}${escaped}${rightBoundary}`, 'g')
      const before = updated
      updated = updated.replace(replaceRegex, s.newClass)
      if (updated !== before) {
        changed = true
      }
    }
  }

  return { updated, changed }
}

export function analyzeFile(filePath, isApply = false) {
  const relPath = path.relative(clientRoot, filePath).replaceAll('\\', '/')
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  const suggestions = []
  lines.forEach((line, lineIdx) => {
    const lineNum = lineIdx + 1
    suggestions.push(...findSafeTokenSuggestions(line, lineNum, relPath))
    suggestions.push(...findContextualSuggestions(line, lineNum, relPath))
  })

  let hasChanges = false
  if (isApply && suggestions.some((s) => s.isAutoApplicable)) {
    const { updated, changed } = applySafeReplacements(content, suggestions)
    if (changed && updated !== content) {
      fs.writeFileSync(filePath, updated, 'utf-8')
      hasChanges = true
    }
  }

  return { suggestions, hasChanges }
}

// ============================================================================
// CLI RUNNER
// ============================================================================
export function runMigrateSuggest() {
  const args = process.argv.slice(2)
  const isApply = args.includes('--apply')
  const isJson = args.includes('--json')
  const isSummary = args.includes('--summary')

  let targetPath = srcRoot
  const pathArg = args.find((a) => a.startsWith('--path='))
  if (pathArg) {
    const rawP = pathArg.split('=')[1]
    targetPath = path.resolve(clientRoot, rawP)
  }

  const filesToScan = fs.statSync(targetPath).isDirectory()
    ? getAllTsxFiles(targetPath)
    : [targetPath]

  const allSuggestions = []
  let totalFilesModified = 0

  for (const f of filesToScan) {
    const { suggestions, hasChanges } = analyzeFile(f, isApply)
    if (suggestions.length > 0) {
      allSuggestions.push(...suggestions)
    }
    if (hasChanges) {
      totalFilesModified++
    }
  }

  const safeCount = allSuggestions.filter((s) => s.isAutoApplicable).length
  const contextualCount = allSuggestions.filter((s) => !s.isAutoApplicable).length

  if (isJson) {
    console.log(
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          targetPath: path.relative(clientRoot, targetPath),
          totalFilesScanned: filesToScan.length,
          filesModified: totalFilesModified,
          safeCount,
          contextualCount,
          suggestions: allSuggestions,
        },
        null,
        2
      )
    )
    return
  }

  console.log('='.repeat(78))
  console.log('RoGym Semantic Design Suite — Công Cụ Phân Tích & Gợi Ý Migrate (P5-00)')
  console.log('='.repeat(78))
  console.log(`Phạm vi quét          : ${path.relative(clientRoot, targetPath)}`)
  console.log(`Số tệp TSX quét       : ${filesToScan.length}`)
  console.log(`Gợi ý An toàn (4.A)   : ${safeCount} vị trí ${isApply ? '(ĐÃ ÁP DỤNG)' : '(có thể dùng --apply)'}`)
  console.log(`Cần Review Thủ Công   : ${contextualCount} vị trí (Bảng 4.B)`)
  if (isApply) {
    console.log(`Số tệp đã cập nhật    : ${totalFilesModified}`)
  }
  console.log('-'.repeat(78))

  if (!isSummary) {
    // In danh sách chi tiết
    const sampleLimit = 40
    const displayed = allSuggestions.slice(0, sampleLimit)

    displayed.forEach((s) => {
      const tag = s.isAutoApplicable ? '[1-to-1 SAFE]' : '[MANUAL REVIEW]'
      console.log(`${tag.padEnd(16)} ${s.file}:${s.line} → ${s.oldClass} => ${s.newClass}`)
    })

    if (allSuggestions.length > sampleLimit) {
      console.log(`... và thêm ${allSuggestions.length - sampleLimit} gợi ý khác. Dùng --json để xuất toàn bộ.`)
    }
  }
  console.log('='.repeat(78))
}

// Chạy trực tiếp từ dòng lệnh
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrateSuggest()
}
