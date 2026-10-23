#!/usr/bin/env node
/**
 * @fileoverview RoGym Deprecated Tokens Ratchet Engine (P4-08 / SEM-TOKEN-008)
 * Quét danh sách token @deprecated trong compat.css và thống kê mức độ sử dụng
 * trên toàn bộ client/src/, xuất báo cáo baseline markdown.
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientRoot = path.resolve(__dirname, '../..')
const projectRoot = path.resolve(clientRoot, '..')

const compatCssPath = path.join(clientRoot, 'src', 'styles', 'tokens', 'compat.css')
const srcDir = path.join(clientRoot, 'src')
const reportPath = path.join(
  projectRoot,
  'docs',
  'VI',
  'semantic-design',
  'reports',
  'deprecated-tokens-baseline.md'
)

// ANSI Helpers
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
}

/**
 * Trích xuất danh sách token deprecated và gợi ý chuyển đổi từ compat.css
 * @returns {Array<{ token: string, target: string, semanticVar: string }>}
 */
export function extractDeprecatedTokens() {
  if (!fs.existsSync(compatCssPath)) {
    throw new Error(`Không tìm thấy file: ${compatCssPath}`)
  }

  const content = fs.readFileSync(compatCssPath, 'utf-8')
  const lines = content.split('\n')
  const tokens = []

  for (const line of lines) {
    const match = line.match(/^\s*(--rogym-[a-zA-Z0-9-]+)\s*:\s*var\((--[a-zA-Z0-9-]+)\);\s*\/\*\s*@deprecated\s*->\s*([a-zA-Z0-9-]+)\s*\*\//)
    if (match) {
      tokens.push({
        token: match[1],
        semanticVar: match[2],
        target: match[3],
      })
    }
  }

  return tokens
}

/**
 * Quét đệ quy tất cả các file nguồn (.css, .tsx, .ts, .html) trong srcDir
 * Loại trừ compat.css và thư mục __tests__
 * @param {string} dir
 * @returns {string[]}
 */
export function getSourceFiles(dir) {
  const files = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === '__snapshots__' || entry.name === 'node_modules') {
        continue
      }
      files.push(...getSourceFiles(fullPath))
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name)
      if (['.css', '.tsx', '.ts', '.html'].includes(ext)) {
        // Bỏ qua compat.css để tránh đếm chính các khai báo alias
        if (fullPath === compatCssPath) continue
        files.push(fullPath)
      }
    }
  }

  return files
}

/**
 * Thống kê mức độ sử dụng của từng token deprecated
 * @returns {{
 *   totalUsage: number,
 *   tokenStats: Array<{ token: string, target: string, semanticVar: string, count: number, files: string[] }>,
 *   fileStats: Array<{ file: string, count: number }>
 * }}
 */
export function analyzeDeprecatedTokens() {
  const deprecatedTokens = extractDeprecatedTokens()
  const sourceFiles = getSourceFiles(srcDir)

  const tokenUsageMap = new Map()
  for (const t of deprecatedTokens) {
    tokenUsageMap.set(t.token, {
      ...t,
      count: 0,
      files: new Set(),
    })
  }

  const fileUsageMap = new Map()

  for (const filePath of sourceFiles) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const relPath = path.relative(clientRoot, filePath).replace(/\\/g, '/')

    for (const [tokenName, stats] of tokenUsageMap.entries()) {
      // Regex tìm token khớp nguyên từ (word boundary / không nối tiếp ký tự CSS identifier)
      const regex = new RegExp(tokenName.replace(/-/g, '\\-') + '(?![a-zA-Z0-9_-])', 'g')
      const matches = content.match(regex)
      if (matches && matches.length > 0) {
        stats.count += matches.length
        stats.files.add(relPath)

        const currentFileCount = fileUsageMap.get(relPath) || 0
        fileUsageMap.set(relPath, currentFileCount + matches.length)
      }
    }
  }

  let totalUsage = 0
  const tokenStats = []

  for (const stats of tokenUsageMap.values()) {
    totalUsage += stats.count
    tokenStats.push({
      token: stats.token,
      target: stats.target,
      semanticVar: stats.semanticVar,
      count: stats.count,
      files: Array.from(stats.files).sort(),
    })
  }

  // Sắp xếp token theo số lượng sử dụng giảm dần
  tokenStats.sort((a, b) => b.count - a.count || a.token.localeCompare(b.token))

  const fileStats = Array.from(fileUsageMap.entries())
    .map(([file, count]) => ({ file, count }))
    .sort((a, b) => b.count - a.count || a.file.localeCompare(b.file))

  return { totalUsage, tokenStats, fileStats }
}

/**
 * Tạo báo cáo Markdown baseline
 */
export function generateMarkdownReport(analysis) {
  const { totalUsage, tokenStats, fileStats } = analysis
  const dateStr = new Date().toISOString().split('T')[0]

  let md = `# RoGym Deprecated Tokens Baseline Report\n\n`
  md += `> **Phase 4 Snapshot** — Được tạo tự động bởi \`scripts/audit/deprecated-tokens.mjs\` vào ngày **${dateStr}**.\n\n`
  md += `## 1. Tổng quan Thống kê\n\n`
  md += `- **Tổng số Token Deprecated (trong \`tokens/compat.css\`):** ${tokenStats.length} tokens\n`
  md += `- **Tổng số lần xuất hiện trong \`client/src/\`:** ${totalUsage} lần\n`
  md += `- **Tổng số tập tin bị ảnh hưởng:** ${fileStats.length} tập tin\n\n`
  md += `Mục tiêu Ratchet: Số lượng này chỉ được phép giảm (không bao giờ tăng) qua các Phase 5 (CSS Token Migration) và Phase 6 (Semantic Props).\n\n`

  md += `## 2. Bảng Thống kê Chi tiết Từng Token\n\n`
  md += `| Token Cũ (\`@deprecated\`) | Semantic Thay Thế | Số Lượng Dùng | Số File Dùng |\n`
  md += `| :--- | :--- | :---: | :---: |\n`

  for (const t of tokenStats) {
    md += `| \`${t.token}\` | \`${t.semanticVar}\` (\`${t.target}\`) | **${t.count}** | ${t.files.length} |\n`
  }

  md += `\n## 3. Top 15 Tập Tin Sử Dụng Nhiều Token Cũ Nhất\n\n`
  md += `| Tập Tin | Số Lần Sử Dụng | Ưu Tiên Chuyển Đổi |\n`
  md += `| :--- | :---: | :--- |\n`

  for (const f of fileStats.slice(0, 15)) {
    const priority = f.count >= 20 ? 'Cao (P5)' : f.count >= 5 ? 'Trung bình (P5-P6)' : 'Thấp (P6)'
    md += `| \`${f.file}\` | **${f.count}** | ${priority} |\n`
  }

  md += `\n---\n*RoGym Semantic Design System — Phase 4 Deprecation Ratchet Baseline*\n`

  const reportDir = path.dirname(reportPath)
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }
  fs.writeFileSync(reportPath, md, 'utf-8')
}

export function runCli() {
  console.log('='.repeat(78))
  console.log(`${c.bold}${c.cyan}RoGym Semantic Design Suite — Deprecated Tokens Ratchet Engine${c.reset}`)
  console.log(`Source: ${path.relative(clientRoot, compatCssPath)}`)
  console.log('='.repeat(78))

  const analysis = analyzeDeprecatedTokens()
  generateMarkdownReport(analysis)

  console.log(`\n${c.bold}TỔNG KẾT BÁO CÁO DEPRECATED TOKENS:${c.reset}`)
  console.log(`- Token @deprecated khai báo trong compat.css: ${c.bold}${analysis.tokenStats.length}${c.reset}`)
  console.log(`- Tổng số lần sử dụng còn tồn tại: ${c.yellow}${c.bold}${analysis.totalUsage}${c.reset}`)
  console.log(`- Số tập tin cần migrate ở Phase 5-6: ${c.bold}${analysis.fileStats.length}${c.reset}`)

  const topTokensTable = analysis.tokenStats.slice(0, 10).map((t) => ({
    'Deprecated Token': t.token,
    'Semantic Replacement': t.semanticVar,
    Usages: t.count,
    Files: t.files.length,
  }))

  console.log(`\n${c.bold}TOP 10 TOKENS CẦN MIGRATE NHIỀU NHẤT:${c.reset}`)
  console.table(topTokensTable)

  console.log(`\n${c.green}${c.bold}[SUCCESS] Báo cáo baseline đã được ghi thành công:${c.reset}`)
  console.log(`  ${path.relative(clientRoot, reportPath)}`)
  console.log('-'.repeat(78))
  process.exit(0)
}

const isDirectRun = process.argv[1] && (
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]) ||
  path.resolve(process.argv[1]).endsWith('deprecated-tokens.mjs')
)
if (isDirectRun) {
  runCli()
}
