#!/usr/bin/env node
/**
 * @fileoverview props-migrate.mjs — RoGym Semantic Props Migration Scanner & Codemod
 *
 * Quét toàn bộ mã nguồn TSX/TS, phát hiện các prop cũ vi phạm SEM-PROPS-001..003:
 * - tone="muted|error|default|teal|cyan|purple|primary"
 * - inputSize=, badgeSize=, checkboxSize=
 * - variant="outline-white|outline-green*|dark|elevated|text-*"
 * - variant="filled" trên Alert
 *
 * Hỗ trợ các cờ lệnh:
 *   --summary : In bảng tổng kết số lượng vi phạm theo từng component/prop
 *   --report  : In chi tiết vị trí file:line và mã hiện tại
 *   --apply   : Áp dụng thay thế tự động cho các ánh xạ 1-1 an toàn
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientRoot = path.resolve(__dirname, '../..')
const srcRoot = path.join(clientRoot, 'src')

// Các ánh xạ 1-1 an toàn tuyệt đối
export const SAFE_REPLACEMENTS = [
  // Tone mappings
  {
    pattern: /\btone=(['"])muted\1/g,
    replacement: 'tone=$1neutral$1',
    label: 'tone="muted" → tone="neutral"',
  },
  {
    pattern: /\btone=(['"])error\1/g,
    replacement: 'tone=$1danger$1',
    label: 'tone="error" → tone="danger"',
  },
  {
    pattern: /\btone=(['"])default\1/g,
    replacement: 'tone=$1neutral$1',
    label: 'tone="default" → tone="neutral"',
  },
  // Size prop duplicates
  {
    pattern: /\bbadgeSize=(['"])(xs|sm|md|lg|xl)\1/g,
    replacement: 'size=$1$2$1',
    label: 'badgeSize="X" → size="X"',
  },
  {
    pattern: /\binputSize=(['"])(xs|sm|md|lg|xl)\1/g,
    replacement: 'size=$1$2$1',
    label: 'inputSize="X" → size="X"',
  },
  {
    pattern: /\bcheckboxSize=(['"])(xs|sm|md|lg|xl)\1/g,
    replacement: 'size=$1$2$1',
    label: 'checkboxSize="X" → size="X"',
  },
  // Button variant mappings
  {
    pattern: /\bvariant=(['"])outline-white\1/g,
    replacement: 'variant=$1outline$1',
    label: 'variant="outline-white" → variant="outline"',
  },
  {
    pattern: /\bvariant=(['"])outline-green(?:-light)?\1/g,
    replacement: 'variant=$1outline$1 tone=$1accent$1',
    label: 'variant="outline-green*" → variant="outline" tone="accent"',
  },
  {
    pattern: /\bvariant=(['"])text-accent\1/g,
    replacement: 'variant=$1link$1 tone=$1accent$1',
    label: 'variant="text-accent" → variant="link" tone="accent"',
  },
  {
    pattern: /\bvariant=(['"])text-muted\1/g,
    replacement: 'variant=$1ghost$1',
    label: 'variant="text-muted" → variant="ghost"',
  },
  {
    pattern: /\bvariant=(['"])(?:dark|elevated)\1/g,
    replacement: 'variant=$1secondary$1',
    label: 'variant="dark|elevated" → variant="secondary"',
  },
  // Alert variant mapping
  {
    pattern: /<Alert\b([^>]*)\bvariant=(['"])filled\2([^>]*)/g,
    replacement: '<Alert$1emphasis=$2solid$2$3',
    label: '<Alert variant="filled"> → <Alert emphasis="solid">',
  },
]

function walkDir(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === '.git' ||
        entry.name === '__tests__'
      ) {
        continue
      }
      walkDir(fullPath, callback)
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) &&
      !entry.name.endsWith('.test.tsx') &&
      !entry.name.endsWith('.test.ts') &&
      !entry.name.endsWith('.d.ts')
    ) {
      callback(fullPath)
    }
  }
}

export function scanSourceFiles(apply = false) {
  const stats = {
    scannedFiles: 0,
    filesWithMatches: 0,
    totalViolations: 0,
    byCategory: {},
    items: [],
  }

  for (const rep of SAFE_REPLACEMENTS) {
    stats.byCategory[rep.label] = 0
  }
  stats.byCategory['tone="primary|cyan|purple|teal" (manual context)'] = 0

  walkDir(srcRoot, (filePath) => {
    stats.scannedFiles++
    let content = fs.readFileSync(filePath, 'utf8')
    let fileModified = false
    const lines = content.split('\n')
    const relPath = path.relative(clientRoot, filePath).replaceAll('\\', '/')

    // Scan line by line for report
    lines.forEach((line, idx) => {
      for (const rep of SAFE_REPLACEMENTS) {
        if (rep.pattern.test(line)) {
          stats.totalViolations++
          stats.byCategory[rep.label]++
          stats.items.push({
            file: relPath,
            line: idx + 1,
            label: rep.label,
            content: line.trim(),
          })
        }
      }

      // Check context-dependent tone values (primary, cyan, purple, teal)
      if (/\btone=(['"])(primary|cyan|purple|teal)\1/.test(line)) {
        stats.totalViolations++
        stats.byCategory['tone="primary|cyan|purple|teal" (manual context)']++
        stats.items.push({
          file: relPath,
          line: idx + 1,
          label: 'tone="primary|cyan|purple|teal" (manual context)',
          content: line.trim(),
        })
      }
    })

    if (apply) {
      let newContent = content
      for (const rep of SAFE_REPLACEMENTS) {
        if (rep.pattern.test(newContent)) {
          newContent = newContent.replaceAll(rep.pattern, rep.replacement)
          fileModified = true
        }
      }
      if (fileModified) {
        fs.writeFileSync(filePath, newContent, 'utf8')
        stats.filesWithMatches++
      }
    }
  })

  return stats
}

// CLI Execution
const args = new Set(process.argv.slice(2))
const isApply = args.has('--apply')
const isReport = args.has('--report')

const results = scanSourceFiles(isApply)

console.log('==============================================================================')
console.log('RoGym Semantic Props Migration Tool (Task P6-01 / P6-03)')
console.log(`Scan Target: ${srcRoot}`)
console.log(`Scanned: ${results.scannedFiles} files | Violations found: ${results.totalViolations}`)
console.log('==============================================================================\n')

console.log('BẢNG TỔNG KẾT VI PHẠM PROPS CŨ:')
console.table(
  Object.entries(results.byCategory).map(([Rule, Count]) => ({
    Rule,
    Count,
    Status: Count === 0 ? 'CLEAN' : 'NEEDS_MIGRATION',
  }))
)

if (isReport && results.items.length > 0) {
  console.log('\nDANH SÁCH CHI TIẾT TỪNG VỊ TRÍ CẦN MIGRATION:')
  results.items.slice(0, 50).forEach((item) => {
    console.log(`  ${item.file}:${item.line} -> [${item.label}]`)
    console.log(`     "${item.content}"\n`)
  })
  if (results.items.length > 50) {
    console.log(`  ... và ${results.items.length - 50} vị trí khác.`)
  }
}

if (isApply) {
  console.log(`\n[SUCCESS] Đã tự động thay thế an toàn trên ${results.filesWithMatches} files.`)
}
