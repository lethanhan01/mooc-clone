#!/usr/bin/env node
/**
 * @fileoverview WCAG 2.1 AA Contrast Calculation Engine (A11Y-001 / SEM-A11Y-010)
 * Thuật toán tính Relative Luminance và Contrast Ratio sRGB chuẩn W3C WCAG 2.1.
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientRoot = path.resolve(__dirname, '../..')
const pairsFilePath = path.join(clientRoot, 'src', 'styles', 'tokens', 'contrast-pairs.json')

// ANSI Color Helpers
export const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
}

/**
 * Chuyển đổi mã HEX (6 hoặc 8 chữ số) sang RGBA
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number, a: number }}
 */
export function hexToRgba(hex) {
  const clean = hex.replace('#', '').trim()
  if (clean.length === 6) {
    return {
      r: Number.parseInt(clean.slice(0, 2), 16),
      g: Number.parseInt(clean.slice(2, 4), 16),
      b: Number.parseInt(clean.slice(4, 6), 16),
      a: 1.0,
    }
  }
  if (clean.length === 8) {
    return {
      r: Number.parseInt(clean.slice(0, 2), 16),
      g: Number.parseInt(clean.slice(2, 4), 16),
      b: Number.parseInt(clean.slice(4, 6), 16),
      a: Number((Number.parseInt(clean.slice(6, 8), 16) / 255).toFixed(4)),
    }
  }
  throw new Error(`Mã màu HEX không hợp lệ: "${hex}". Yêu cầu 6 hoặc 8 chữ số.`)
}

/**
 * Hòa trộn alpha (Alpha Composite) của lớp foreground lên lớp nền background
 * @param {{ r: number, g: number, b: number, a: number }} fg
 * @param {{ r: number, g: number, b: number, a: number }} bg
 * @returns {{ r: number, g: number, b: number }}
 */
export function alphaComposite(fg, bg) {
  if (fg.a >= 1) return { r: fg.r, g: fg.g, b: fg.b }
  return {
    r: Math.round(fg.r * fg.a + bg.r * (1 - fg.a)),
    g: Math.round(fg.g * fg.a + bg.g * (1 - fg.a)),
    b: Math.round(fg.b * fg.a + bg.b * (1 - fg.a)),
  }
}

/**
 * Tính Relative Luminance sRGB theo công thức W3C WCAG 2.1
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {number}
 */
export function getRelativeLuminance(r, g, b) {
  const toLinear = (val) => {
    const s = val / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }

  const rLin = toLinear(r)
  const gLin = toLinear(g)
  const bLin = toLinear(b)

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
}

/**
 * Tính tỉ lệ tương phản màu (Contrast Ratio) giữa 2 màu HEX.
 * Nếu fg hoặc bg có kênh alpha (8 ký tự HEX), tự động hòa trộn (alpha composite)
 * lên canvas nền thích hợp trước khi tính Relative Luminance.
 * @param {string} hexFg
 * @param {string} hexBg
 * @param {string} [canvasHex] - Canvas cơ sở mặc định (#0f1c16 cho dark, #ffffff cho light)
 * @returns {number} Tỉ lệ tương phản dạng số thập phân làm tròn 2 chữ số (vd: 19.32)
 */
export function getContrastRatio(hexFg, hexBg, canvasHex = '#0f1c16') {
  const fgRgba = hexToRgba(hexFg)
  const bgRgba = hexToRgba(hexBg)
  const canvasRgba = hexToRgba(canvasHex)

  // Hòa trộn alpha nếu background có độ mờ lên canvas nền
  const blendedBg = bgRgba.a < 1 ? alphaComposite(bgRgba, canvasRgba) : bgRgba

  // Hòa trộn alpha nếu foreground có độ mờ lên blendedBg
  const blendedFg = fgRgba.a < 1 ? alphaComposite(fgRgba, blendedBg) : fgRgba

  const l1 = getRelativeLuminance(blendedFg.r, blendedFg.g, blendedFg.b)
  const l2 = getRelativeLuminance(blendedBg.r, blendedBg.g, blendedBg.b)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  const ratio = (lighter + 0.05) / (darker + 0.05)
  return Number(ratio.toFixed(2))
}

/**
 * Chạy kiểm tra danh sách cặp màu
 * @param {Array<Object>} pairs
 * @returns {{ results: Array<Object>, passCount: number, failCount: number }}
 */
export function evaluateContrastPairs(pairs) {
  let passCount = 0
  let failCount = 0

  const results = pairs.map((pair) => {
    const defaultCanvas = pair.theme === 'light' ? '#ffffff' : '#0f1c16'
    const canvas = pair.canvas || defaultCanvas

    const ratio = getContrastRatio(pair.fg, pair.bg, canvas)
    const target = pair.minRatio || 4.5
    const isPass = ratio >= target

    if (isPass) passCount++
    else failCount++

    return {
      id: pair.id,
      name: pair.name,
      theme: pair.theme || 'dark',
      fgToken: pair.fgToken,
      bgToken: pair.bgToken,
      fgHex: pair.fg,
      bgHex: pair.bg,
      ratio: `${ratio}:1`,
      numericRatio: ratio,
      minRequired: `${target}:1`,
      level: pair.level || (target >= 4.5 ? 'AA_NORMAL' : 'AA_LARGE'),
      status: isPass ? 'PASS' : 'FAIL',
    }
  })

  return { results, passCount, failCount }
}

export function runContrastCli() {
  console.log('='.repeat(78))
  console.log(`${c.bold}${c.cyan}RoGym Semantic Design Suite — WCAG 2.1 AA Contrast Engine${c.reset}`)
  console.log(`Source Matrix: ${path.relative(clientRoot, pairsFilePath)}`)
  console.log('='.repeat(78))

  if (!fs.existsSync(pairsFilePath)) {
    console.error(`\n${c.red}[ERROR] Không tìm thấy tập tin ma trận cặp màu:${c.reset} ${pairsFilePath}`)
    process.exit(1)
  }

  const data = JSON.parse(fs.readFileSync(pairsFilePath, 'utf-8'))
  const pairs = data.pairs || []

  if (pairs.length === 0) {
    console.log(`\n${c.yellow}[WARN] Danh sách contrast-pairs.json đang rỗng.${c.reset}`)
    process.exit(0)
  }

  const { results, passCount, failCount } = evaluateContrastPairs(pairs)

  const tableData = results.map((r) => ({
    Theme: (r.theme || 'dark').toUpperCase(),
    Pair: r.name,
    'Foreground (FG)': `${r.fgToken} (${r.fgHex})`,
    'Background (BG)': `${r.bgToken} (${r.bgHex})`,
    'Contrast Ratio': r.ratio,
    'Min Required': r.minRequired,
    Level: r.level,
    Status: r.status === 'PASS' ? `${c.green}PASS${c.reset}` : `${c.red}FAIL${c.reset}`,
  }))

  console.log(`\n${c.bold}BẢNG ĐỐI SOÁT TỈ LỆ TƯƠNG PHẢN WCAG 2.1 AA (${pairs.length} CẶP MÀU):${c.reset}`)
  console.table(tableData)

  console.log('-'.repeat(78))
  console.log(`TỔNG KẾT: ${c.green}${passCount} ĐẠT (PASS)${c.reset} | ${c.red}${failCount} KHÔNG ĐẠT (FAIL)${c.reset} trên tổng số ${pairs.length} cặp màu.`)

  if (failCount > 0) {
    console.error(`\n${c.red}[FAIL] Phát hiện ${failCount} cặp màu vi phạm ngưỡng trợ năng WCAG 2.1 AA. Exit code 1.${c.reset}`)
    process.exit(1)
  } else {
    console.log(`\n${c.green}${c.bold}[SUCCESS] 100% cặp màu đạt chuẩn trợ năng WCAG 2.1 AA. Exit code 0.${c.reset}`)
    process.exit(0)
  }
}

// Auto-run if executed directly as entry script
const isDirectRun = process.argv[1] && (
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]) ||
  path.resolve(process.argv[1]).endsWith('contrast-check.mjs')
)
if (isDirectRun) {
  runContrastCli()
}
