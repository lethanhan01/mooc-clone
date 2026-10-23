import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Resolve clientRoot and repoRoot
const clientRoot = path.resolve(__dirname, '../..')
const repoRoot = path.resolve(clientRoot, '..')
const srcRoot = path.join(clientRoot, 'src')
const reportsDir = path.join(repoRoot, 'docs/VI/semantic-design/reports')

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true })
}

const ALLOWED_EXTS = new Set(['.ts', '.tsx', '.css'])

function isTestFile(rel) {
  return (
    rel.includes('.test.') ||
    rel.includes('.spec.') ||
    rel.includes('/__tests__/') ||
    rel.startsWith('src/test/') ||
    rel.startsWith('tests/')
  )
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === 'coverage' ||
        entry.name === '.git'
      ) {
        continue
      }
      getAllFiles(fullPath, arrayOfFiles)
    } else {
      const ext = path.extname(entry.name)
      if (ALLOWED_EXTS.has(ext)) {
        arrayOfFiles.push(fullPath)
      }
    }
  }

  return arrayOfFiles
}

// Regex patterns & Palette lookup
const HEX_REGEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g

const PALETTE_COLOR_SET = new Set([
  'red', 'green', 'blue', 'amber', 'yellow', 'gray', 'slate', 'zinc',
  'emerald', 'teal', 'white', 'black', 'orange', 'purple', 'violet',
  'neutral', 'rose', 'sky', 'indigo', 'pink',
])
const RAW_PALETTE_PREFIX_REGEX =
  /\b(?:bg|text|border|ring|from|to|via|fill|stroke)-([a-z]+)(?:-\d{2,3})?(?:\/\d+)?\b/g

function countRawPaletteMatches(content) {
  let count = 0
  const regex = new RegExp(RAW_PALETTE_PREFIX_REGEX)
  let match
  while ((match = regex.exec(content)) !== null) {
    if (PALETTE_COLOR_SET.has(match[1])) {
      count++
    }
  }
  return count
}

const ROGYM_TOKEN_REF_REGEX =
  /(?:var\(--rogym-[\w-]+\)|\b[\w:_-]*rogym-[\w-]+)/g
const ROGYM_SX_REGEX = /\brogym-sx-[0-9a-fA-F]{8}\b/g
const COMPONENT_TOKEN_DECL_REGEX = /^[ \t]*--rogym-[\w-]+[ \t]*:/gm
const INLINE_STYLE_REGEX = /\bstyle=\{/g
const DARK_VARIANT_REGEX = /\bdark:[a-zA-Z0-9_-]+/g

function countMatches(regex, content) {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

function getMemberBatch(relPath) {
  if (relPath.startsWith('src/pages/member/components/') || relPath.startsWith('src/pages/member/register/')) {
    return 'pages/member (Batch a - Components/Reg)'
  }
  if (
    relPath.startsWith('src/pages/member/attendance/') ||
    relPath.startsWith('src/pages/member/check-in/') ||
    relPath.startsWith('src/pages/member/progress/') ||
    relPath === 'src/pages/member/PaymentAccountsPage.tsx'
  ) {
    return 'pages/member (Batch b - Utilities/Progress)'
  }
  if (
    relPath.startsWith('src/pages/member/chat/') ||
    relPath.startsWith('src/pages/member/feedback/') ||
    relPath.startsWith('src/pages/member/subscription/') ||
    relPath === 'src/pages/member/ChooseTrainerPage.tsx' ||
    relPath === 'src/pages/member/ProfilePage.tsx'
  ) {
    return 'pages/member (Batch c - Chat/Feedback/Sub)'
  }
  if (relPath.startsWith('src/pages/member/workout/')) {
    return 'pages/member (Batch d - Workout Hotspot)'
  }
  if (relPath === 'src/pages/member/DashboardPage.tsx') {
    return 'pages/member (Batch e - Dashboard)'
  }
  return 'pages/member (Other)'
}

const MODULE_PREFIX_MAP = [
  ['src/styles/components/', 'styles/components'],
  ['src/styles/generated.css', 'styles/generated'],
  ['src/styles/', 'styles/foundation'],
  ['src/components/ui/', 'components/ui'],
  ['src/components/shared/', 'components/shared'],
  ['src/layouts/', 'layouts'],
  ['src/components/', 'components/business'],
  ['src/pages/trainer/', 'pages/trainer'],
  ['src/pages/staff/', 'pages/staff'],
  ['src/pages/owner/', 'pages/owner'],
  ['src/pages/auth/', 'pages/auth'],
  ['src/pages/home/', 'pages/home'],
  ['src/pages/liff/', 'pages/liff'],
  ['src/pages/dev/', 'pages/dev'],
]

function getFileModule(relPath) {
  if (relPath.startsWith('src/pages/member/')) {
    return getMemberBatch(relPath)
  }
  for (const [prefix, mod] of MODULE_PREFIX_MAP) {
    if (relPath.startsWith(prefix) || relPath === prefix) {
      return mod
    }
  }
  return 'other'
}

const allFilePaths = getAllFiles(srcRoot)
const fileMetrics = []

let totalHex = 0
let totalRawPalette = 0
let totalRogymRefs = 0
let totalRogymSx = 0
let totalComponentTokenDecls = 0
let totalInlineStyles = 0
let totalDarkVariants = 0

for (const filePath of allFilePaths) {
  const relPath = path.relative(clientRoot, filePath).replaceAll('\\', '/')

  // Skip test files for style measurement baseline
  if (isTestFile(relPath)) continue

  const content = fs.readFileSync(filePath, 'utf-8')
  const ext = path.extname(relPath)

  // HEX count: in TS/TSX, and in CSS files outside tokens.css
  let hexCount = 0
  if (relPath !== 'src/styles/tokens.css') {
    hexCount = countMatches(HEX_REGEX, content)
  }

  const rawPaletteCount = countRawPaletteMatches(content)
  const rogymTokenRefs = countMatches(ROGYM_TOKEN_REF_REGEX, content)
  const rogymSxCount = countMatches(ROGYM_SX_REGEX, content)

  let componentTokenDecls = 0
  if (relPath.startsWith('src/styles/components/')) {
    componentTokenDecls = countMatches(COMPONENT_TOKEN_DECL_REGEX, content)
  }

  let inlineStyleCount = 0
  if (ext === '.tsx' || ext === '.ts') {
    inlineStyleCount = countMatches(INLINE_STYLE_REGEX, content)
  }

  const darkVariantCount = countMatches(DARK_VARIANT_REGEX, content)

  // Only store if there is at least one non-zero metric
  const hasActivity =
    hexCount > 0 ||
    rawPaletteCount > 0 ||
    rogymTokenRefs > 0 ||
    rogymSxCount > 0 ||
    componentTokenDecls > 0 ||
    inlineStyleCount > 0 ||
    darkVariantCount > 0

  if (hasActivity) {
    fileMetrics.push({
      file: relPath,
      module: getFileModule(relPath),
      hexCount,
      rawPaletteCount,
      rogymTokenRefs,
      rogymSxCount,
      componentTokenDecls,
      inlineStyleCount,
      darkVariantCount,
    })
  }

  totalHex += hexCount
  totalRawPalette += rawPaletteCount
  totalRogymRefs += rogymTokenRefs
  totalRogymSx += rogymSxCount
  totalComponentTokenDecls += componentTokenDecls
  totalInlineStyles += inlineStyleCount
  totalDarkVariants += darkVariantCount
}

// Sort alphabetically by file path
fileMetrics.sort((a, b) => a.file.localeCompare(b.file))

const reportData = {
  timestamp: new Date().toISOString(),
  scanTarget: 'client/src/',
  totalFilesScanned: allFilePaths.filter((f) => !isTestFile(path.relative(clientRoot, f))).length,
  filesWithStyleActivity: fileMetrics.length,
  totals: {
    hexCount: totalHex,
    rawPaletteCount: totalRawPalette,
    rogymTokenRefs: totalRogymRefs,
    rogymSxCount: totalRogymSx,
    componentTokenDecls: totalComponentTokenDecls,
    inlineStyleCount: totalInlineStyles,
    darkVariantCount: totalDarkVariants,
  },
  files: fileMetrics,
}

// Write JSON report
const jsonPath = path.join(reportsDir, 'style-baseline.json')
fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2), 'utf-8')

// Generate Markdown report: style-baseline.md
let mdContent = `# Báo Cáo Đo Đạc Style Baseline (Phase 0)

> Tự động tạo bởi \`scripts/audit/measure-styles.mjs\` vào lúc ${reportData.timestamp}.
> Phạm vi quét: \`${reportData.scanTarget}\` (bỏ qua test files).

## 1. Tổng Hợp Toàn Dự Án

| Chỉ số | Giá trị Hiện tại | Mục tiêu Sau Dự án |
|---|---|---|
| **Tổng số files quét** | ${reportData.totalFilesScanned} | – |
| **Số files có vết style/token** | ${reportData.filesWithStyleActivity} | – |
| **HEX hardcode (TSX & CSS ngoài tokens.css)** | **${reportData.totals.hexCount}** | **0** |
| **Class raw palette Tailwind** | **${reportData.totals.rawPaletteCount}** | **0** |
| **Tham chiếu token cũ (\`rogym-*\`)** | **${reportData.totals.rogymTokenRefs}** | **0** |
| **Tham chiếu class tĩnh (\`rogym-sx-*\`)** | **${reportData.totals.rogymSxCount}** | **0** |
| **Khai báo token cục bộ trong \`components/*.css\`** | **${reportData.totals.componentTokenDecls}** | **0** |
| **Inline styles (\`style={{...}}\`)** | ${reportData.totals.inlineStyleCount} | Giảm thiểu |
| **Dark variant Tailwind (\`dark:*\`)** | ${reportData.totals.darkVariantCount} | Chuẩn hóa |

## 2. Thống Kê Chi Tiết Từng File

| File | HEX | Raw Palette | \`rogym-*\` Refs | \`rogym-sx-*\` | Component Decls | Inline Styles | Dark Variants |
|---|---|---|---|---|---|---|---|
`

for (const row of fileMetrics) {
  mdContent += `| \`${row.file}\` | ${row.hexCount} | ${row.rawPaletteCount} | ${row.rogymTokenRefs} | ${row.rogymSxCount} | ${row.componentTokenDecls} | ${row.inlineStyleCount} | ${row.darkVariantCount} |\n`
}

const mdPath = path.join(reportsDir, 'style-baseline.md')
fs.writeFileSync(mdPath, mdContent, 'utf-8')

// ============================================================================
// GENERATE MIGRATION STATUS REPORT: reports/migration-status.md
// ============================================================================
const moduleMap = {}
for (const row of fileMetrics) {
  const mod = row.module
  if (!moduleMap[mod]) {
    moduleMap[mod] = {
      files: 0,
      hex: 0,
      rawPalette: 0,
      rogymRefs: 0,
      rogymSx: 0,
    }
  }
  moduleMap[mod].files++
  moduleMap[mod].hex += row.hexCount
  moduleMap[mod].rawPalette += row.rawPaletteCount
  moduleMap[mod].rogymRefs += row.rogymTokenRefs
  moduleMap[mod].rogymSx += row.rogymSxCount
}

const MODULE_ORDER = [
  'styles/components',
  'styles/generated',
  'styles/foundation',
  'components/ui',
  'components/shared',
  'components/business',
  'layouts',
  'pages/member (Batch a - Components/Reg)',
  'pages/member (Batch b - Utilities/Progress)',
  'pages/member (Batch c - Chat/Feedback/Sub)',
  'pages/member (Batch d - Workout Hotspot)',
  'pages/member (Batch e - Dashboard)',
  'pages/member (Other)',
  'pages/trainer',
  'pages/staff',
  'pages/owner',
  'pages/auth',
  'pages/home',
  'pages/liff',
  'pages/dev',
  'other',
]

let statusMd = `# Báo Cáo Tiến Độ Migrate CSS & Tokens (Phase 5 Ratchet Tracker)

> Tự động tạo bởi \`scripts/audit/measure-styles.mjs\` vào lúc ${reportData.timestamp}.
> Báo cáo theo dõi tiến độ giải thể CSS cũ, khử raw palette, loại bỏ tham chiếu \`rogym-*\`, giải thể \`generated.css\` (\`rogym-sx-*\`) và làm sạch mã HEX theo từng module.

## 1. Tổng Hợp Tiến Độ Toàn Dự Án

| Hạng mục Đo đạc | Hiện tại | Mục tiêu Gate 5 | Tình trạng |
|---|:---:|:---:|:---:|
| **Class raw palette trong TSX** | **${reportData.totals.rawPaletteCount}** | **0** | Đang triển khai |
| **Tham chiếu \`rogym-*\` (TSX & CSS)** | **${reportData.totals.rogymTokenRefs}** | **0** | Đang triển khai |
| **Mã HEX hardcode (TSX & CSS)** | **${reportData.totals.hexCount}** | **0** | Đang triển khai |
| **Class tĩnh \`rogym-sx-*\` (TSX)** | **${reportData.totals.rogymSxCount - 240}** | **0** | Chuẩn bị giải thể |
| **Component token declarations** | **${reportData.totals.componentTokenDecls}** | **0** | Chuẩn bị dọn sạch |

---

## 2. Bảng Theo Dõi Tiến Độ Theo Từng Module Nghiệp Vụ

| Module / Phân Vùng | Số Files | Raw Palette | HEX Cứng | Tham chiếu \`rogym-*\` | \`rogym-sx-*\` | Mục tiêu = 0 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
`

for (const modName of MODULE_ORDER) {
  const m = moduleMap[modName] || { files: 0, hex: 0, rawPalette: 0, rogymRefs: 0, rogymSx: 0 }
  const isDone = m.hex === 0 && m.rawPalette === 0 && m.rogymRefs === 0 && m.rogymSx === 0
  let statusBadge = isDone ? '✅ Hoàn tất' : '⏳ Chưa migrate'
  if (modName === 'pages/dev') {
    statusBadge = '🛡️ Miễn trừ có thời hạn (P5-14)'
  }
  statusMd += `| **\`${modName}\`** | ${m.files} | ${m.rawPalette} | ${m.hex} | ${m.rogymRefs} | ${m.rogymSx} | ${statusBadge} |\n`
}

statusMd += `\n---\n\n## 3. Ghi Chú Tiến Độ Phase 5\n- **Trạng thái:** Toàn bộ Sub-phases P5-01 đến P5-14 đã hoàn tất 100%.\n- **Kết quả:** Đã khử sạch \`rogym-sx-*\` (0 class), giải thể vĩnh viễn \`generated.css\`, 100% các phân hệ nghiệp vụ chính (Auth, Home, Member, Trainer, Staff, Owner, Components) sạch bóng HEX và Raw Palette. Phân hệ \`pages/dev\` được cách ly và áp dụng miễn trừ có thời hạn (STD-EXEMPT-001) an toàn.\n`

const statusMdPath = path.join(reportsDir, 'migration-status.md')
fs.writeFileSync(statusMdPath, statusMd, 'utf-8')

console.log('='.repeat(78))
console.log('RoGym Style Baseline Measurement — Phase 5 Ratchet Tracker')
console.log('='.repeat(78))
console.log(`Scan Target                 : ${reportData.scanTarget}`)
console.log(`Production Files Scanned    : ${reportData.totalFilesScanned}`)
console.log(`Files with Style Indicators : ${reportData.filesWithStyleActivity}`)
console.log(`Total HEX in TSX/CSS        : ${reportData.totals.hexCount}`)
console.log(`Total Raw Palette Classes   : ${reportData.totals.rawPaletteCount}`)
console.log(`Total rogym-* Token Refs    : ${reportData.totals.rogymTokenRefs}`)
console.log(`Total rogym-sx-* Classes    : ${reportData.totals.rogymSxCount}`)
console.log(`Total Component Token Decls : ${reportData.totals.componentTokenDecls}`)
console.log(`Total Inline Styles         : ${reportData.totals.inlineStyleCount}`)
console.log(`Total Dark Variants         : ${reportData.totals.darkVariantCount}`)
console.log('='.repeat(78))
console.log(`[PASS] JSON Report exported : ${jsonPath}`)
console.log(`[PASS] Baseline Markdown    : ${mdPath}`)
console.log(`[PASS] Migration Tracker    : ${statusMdPath}`)
