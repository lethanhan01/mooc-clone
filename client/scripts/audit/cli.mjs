#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { parseArgs } from './lib/args.mjs'
import { getAllFiles, normalizePath } from './lib/files.mjs'
import { maskFileContent } from './lib/mask.mjs'
import { parseExemptions } from './lib/exemptions.mjs'
import { loadBaselines, saveBaselines } from './lib/baseline.mjs'
import { c, printHelp, printRulesCatalog, formatJsonReport } from './lib/report.mjs'

import { rules as htmlSemanticRules } from './rules/html-semantic.mjs'
import { rules as cssTokensRules } from './rules/css-tokens.mjs'
import { rules as reactPropsRules } from './rules/react-props.mjs'
import { rules as securityRules } from './rules/security.mjs'
import { rules as stateRules } from './rules/state.mjs'
import { rules as architectureRules } from './rules/architecture.mjs'
import { rules as a11yRules } from './rules/a11y.mjs'
import { rules as formsRules } from './rules/forms.mjs'
import { rules as testingRules } from './rules/testing.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientRoot = path.resolve(__dirname, '../..')
const srcRoot = path.join(clientRoot, 'src')

// ============================================================================
// AGGREGATE ALL 8 DOMAINS RULES & VALIDATE CONTRACTS
// ============================================================================
export const ALL_RULES = {
  ...htmlSemanticRules,
  ...cssTokensRules,
  ...reactPropsRules,
  ...securityRules,
  ...stateRules,
  ...architectureRules,
  ...a11yRules,
  ...formsRules,
  ...testingRules,
}

// Kiểm tra tính duy nhất của Rule ID
export const ruleDomainMap = {}
for (const [id, r] of Object.entries(ALL_RULES)) {
  if (ruleDomainMap[id]) {
    console.error(`[ERROR] Phát hiện trùng lặp Rule ID: "${id}" trong domain "${r.domain}" và "${ruleDomainMap[id]}"`)
    process.exit(1)
  }
  ruleDomainMap[id] = r.domain
}

function resolveActiveRules(targetDomainFilter, targetRuleFilter, isErrorsOnly) {
  let activeRuleKeys = Object.keys(ALL_RULES)
  let targetDomains = null

  if (targetDomainFilter) {
    targetDomains = targetDomainFilter.split(',').map((d) => d.trim().toLowerCase()).filter(Boolean)
    activeRuleKeys = activeRuleKeys.filter((rk) => targetDomains.includes(ALL_RULES[rk].domain))
    if (activeRuleKeys.length === 0) {
      console.error(`[ERROR] Không tìm thấy rule nào thuộc domain: "${targetDomainFilter}". Dùng --list-rules để xem danh mục.`)
      process.exit(1)
    }
  }

  if (targetRuleFilter) {
    if (!ALL_RULES[targetRuleFilter]) {
      console.error(`[ERROR] Rule không hợp lệ: "${targetRuleFilter}". Dùng --help hoặc --list-rules để xem danh mục.`)
      process.exit(1)
    }
    activeRuleKeys = [targetRuleFilter]
  }

  if (isErrorsOnly) {
    activeRuleKeys = activeRuleKeys.filter((rk) => ALL_RULES[rk].severity === 'ERROR')
    if (activeRuleKeys.length === 0) {
      console.error('[ERROR] Không có rule cấp [ERROR] nào phù hợp với bộ lọc hiện tại.')
      process.exit(1)
    }
  }

  return { activeRuleKeys, targetDomains }
}

function getExecutionModeLabel(isRatchet, isStrict, isGenerateBaseline, isUpdateBaseline) {
  if (isRatchet) {
    return `${c.red}[RATCHET (Boy Scout Strict: All Rules)]${c.reset}`
  }
  if (isStrict) {
    return `${c.red}[STRICT (Baseline Snapshot Ratchet)]${c.reset}`
  }
  if (isGenerateBaseline) {
    return `${c.cyan}[GENERATE BASELINE]${c.reset}`
  }
  if (isUpdateBaseline) {
    return `${c.yellow}[UPDATE BASELINE]${c.reset}`
  }
  return `${c.green}[REPORTING / SUMMARY]${c.reset}`
}

function printExecutionBanner(params) {
  const { isJsonFormat, targetPathFilter, isRatchet, isStrict, isGenerateBaseline, isUpdateBaseline, isErrorsOnly, targetDomainFilter, targetRuleFilter } = params
  if (isJsonFormat) return

  console.log('='.repeat(78))
  console.log(`${c.bold}${c.cyan}RoGym Conventions Suite — Static Audit Engine (19 Rules Enterprise)${c.reset}`)
  console.log(`Scan Target: ${targetPathFilter || 'client/src/'}`)
  const modeLabel = getExecutionModeLabel(isRatchet, isStrict, isGenerateBaseline, isUpdateBaseline)
  const errorsOnlyTag = isErrorsOnly ? ` ${c.red}[ERRORS ONLY]${c.reset}` : ''
  const domainTag = targetDomainFilter ? ` ${c.yellow}[DOMAIN: ${targetDomainFilter}]${c.reset}` : ''
  console.log(`Execution Mode: ${modeLabel}${errorsOnlyTag}${domainTag}`)
  if (targetRuleFilter) {
    console.log(`Active Rule Filter: ${c.yellow}${targetRuleFilter}${c.reset}`)
  }
  console.log('='.repeat(78))
}

function scanFileLines(rule, rk, maskedLines, rawLines, isExempt, relPath, ruleStats) {
  maskedLines.forEach((maskedLine, idx) => {
    const rawTrimmed = rawLines[idx].trim()
    if (rawTrimmed.startsWith('//') || rawTrimmed.startsWith('{/*')) {
      return
    }

    let lineToCheck = maskedLine
    const singleCommentIdx = lineToCheck.indexOf('//')
    if (singleCommentIdx !== -1) {
      lineToCheck = lineToCheck.slice(0, singleCommentIdx)
    }

    const checkResult = rule.checkLine(lineToCheck, idx, maskedLines, (ruleId) => isExempt(ruleId, idx), relPath)
    if (checkResult) {
      const msg = typeof checkResult === 'string' ? checkResult : rule.message
      if (rule.severity === 'ERROR') ruleStats[rk].errors++
      else ruleStats[rk].warnings++
      ruleStats[rk].violations.push({
        file: relPath,
        line: idx + 1,
        text: `${msg} -> "${rawLines[idx].trim().slice(0, 55)}"`,
      })
    }
  })
}

function scanSingleFile(filePath, clientRoot, matchingRules, ruleStats) {
  const relPath = normalizePath(path.relative(clientRoot, filePath))
  const rawContent = fs.readFileSync(filePath, 'utf-8')
  const rawLines = rawContent.split('\n')

  const exemptions = parseExemptions(rawLines)
  const maskedContent = maskFileContent(rawContent)
  const maskedLines = maskedContent.split('\n')

  const isExempt = (ruleId, lineIdx) => {
    const rId = ruleId.toUpperCase()
    if (rId === 'EXEMPTION_EXPIRED') return false
    if (exemptions.isAllExempt) return true
    if (exemptions.fileLevelRules?.has(rId)) return true
    const lineNum = lineIdx + 1
    const lineRules = exemptions.get(lineNum)
    return lineRules?.has('ALL') || (lineRules?.has(rId) ?? false)
  }

  for (const rk of matchingRules) {
    const rule = ALL_RULES[rk]

    if (rule.checkFile) {
      const fileViolations = rule.checkFile(maskedContent, relPath, rawLines, (ruleId) => isExempt(ruleId, 0))
      for (const v of fileViolations) {
        if (rule.severity === 'ERROR') ruleStats[rk].errors++
        else ruleStats[rk].warnings++
        ruleStats[rk].violations.push({
          file: relPath,
          line: v.line,
          text: v.text,
        })
      }
      continue
    }

    scanFileLines(rule, rk, maskedLines, rawLines, isExempt, relPath, ruleStats)
  }
}

function executeAuditScan(allFilePaths, activeRuleKeys, clientRoot) {
  const ruleStats = {}
  for (const rk of activeRuleKeys) {
    ruleStats[rk] = {
      errors: 0,
      warnings: 0,
      violations: [],
    }
  }

  let scannedFilesCount = 0

  for (const filePath of allFilePaths) {
    const relPath = normalizePath(path.relative(clientRoot, filePath))
    const matchingRules = activeRuleKeys.filter((rk) => ALL_RULES[rk].filter(relPath))
    if (matchingRules.length === 0) continue

    scannedFilesCount++
    scanSingleFile(filePath, clientRoot, matchingRules, ruleStats)
  }

  return { ruleStats, scannedFilesCount }
}

function handleBaselineGeneration(activeRuleKeys, ruleStats, targetDomains, clientRoot) {
  const currentViolationsByFile = {}
  for (const rk of activeRuleKeys) {
    for (const v of ruleStats[rk].violations) {
      if (!currentViolationsByFile[v.file]) {
        currentViolationsByFile[v.file] = {}
      }
      currentViolationsByFile[v.file][rk] = (currentViolationsByFile[v.file][rk] || 0) + 1
    }
  }

  const { domainCount, combinedFilesCount } = saveBaselines(
    clientRoot,
    currentViolationsByFile,
    ruleDomainMap,
    targetDomains
  )

  let baselineTotalErrors = 0
  let baselineTotalWarnings = 0
  for (const rk of activeRuleKeys) {
    if (ALL_RULES[rk].severity === 'ERROR') baselineTotalErrors += ruleStats[rk].errors
    else baselineTotalWarnings += ruleStats[rk].warnings
  }

  console.log(`\n${c.green}${c.bold}[SUCCESS] Đã ghi nhận Baseline Snapshot thành công vào thư mục audit/baselines/ (${domainCount} domains)${c.reset}`)
  console.log(`- File tổng hợp được tự động đồng bộ: ${c.cyan}client/scripts/audit-baseline.json${c.reset}`)
  console.log(`- Tổng số files có nợ kỹ thuật: ${combinedFilesCount}`)
  console.log(`- Tổng số lỗi [ERROR] được lưu: ${c.red}${baselineTotalErrors}${c.reset}`)
  console.log(`- Tổng số cảnh báo [WARN] được lưu: ${c.yellow}${baselineTotalWarnings}${c.reset}`)
  console.log(`\nTừ giờ, bạn có thể chạy: ${c.cyan}npm run audit:strict${c.reset} để khóa trần nợ kỹ thuật hiện tại.\n`)
  process.exit(0)
}

function buildSummaryTable(activeRuleKeys, ruleStats) {
  let totalErrors = 0
  let totalWarnings = 0
  const summaryTable = []

  for (const rk of activeRuleKeys) {
    const stats = ruleStats[rk]
    const rule = ALL_RULES[rk]
    totalErrors += stats.errors
    totalWarnings += stats.warnings

    let statusText = `${c.green}PASS${c.reset}`
    if (stats.errors + stats.warnings > 0) {
      statusText = rule.severity === 'ERROR' ? `${c.red}FAIL${c.reset}` : `${c.yellow}FLAGGED${c.reset}`
    }

    summaryTable.push({
      'Rule ID': rk,
      Severity: rule.severity === 'ERROR' ? `${c.red}ERROR${c.reset}` : `${c.yellow}WARN${c.reset}`,
      Violations: stats.errors + stats.warnings,
      Status: statusText,
    })
  }

  return { summaryTable, totalErrors, totalWarnings }
}

function resolveExecutionMode(isStrict, isRatchet) {
  if (isStrict) return 'strict'
  if (isRatchet) return 'ratchet'
  return 'reporting'
}

function handleJsonOutput(params) {
  const { durationMs, scanRate, allFilePaths, scannedFilesCount, totalErrors, totalWarnings, activeRuleKeys, ruleStats, targetPathFilter, isStrict, isRatchet } = params
  const executionMode = resolveExecutionMode(isStrict, isRatchet)

  const jsonReport = formatJsonReport({
    durationMs,
    scanRate,
    allFilePaths,
    scannedFilesCount,
    totalErrors,
    totalWarnings,
    ruleKeys: activeRuleKeys,
    ruleStats,
    allRules: ALL_RULES,
    targetPathFilter,
    executionMode,
  })

  console.log(JSON.stringify(jsonReport, null, 2))

  if ((isStrict || isRatchet) && totalErrors > 0) {
    process.exit(1)
  }
  process.exit(0)
}

function printRuleViolationDetails(rk, stats) {
  const sevTag = ALL_RULES[rk].severity === 'ERROR' ? `${c.red}[ERROR]${c.reset}` : `${c.yellow}[WARN]${c.reset}`
  console.log(`\n${sevTag} ${c.bold}${rk}${c.reset} (${stats.violations.length} vị trí):`)
  stats.violations.slice(0, 10).forEach((v) => {
    console.log(`  - ${v.file}:${v.line} ${c.dim}${v.text}${c.reset}`)
  })
  if (stats.violations.length > 10) {
    console.log(`  ${c.dim}... và thêm ${stats.violations.length - 10} vị trí khác.${c.reset}`)
  }
}

function printDetailedViolations(activeRuleKeys, ruleStats) {
  let hasDetails = false
  for (const rk of activeRuleKeys) {
    const stats = ruleStats[rk]
    if (stats.violations.length === 0) continue

    if (!hasDetails) {
      console.log(`\n${c.bold}CHI TIẾT CÁC VỊ TRÍ VI PHẠM (DÒNG & FILE):${c.reset}`)
      hasDetails = true
    }
    printRuleViolationDetails(rk, stats)
  }
}

function printConsoleSummary(activeRuleKeys, ruleStats, summaryTable, isSummaryOnly) {
  console.log(`\n${c.bold}BẢNG TỔNG KẾT TUÂN THỦ ${activeRuleKeys.length} RULES CONVENTIONS:${c.reset}`)
  console.table(summaryTable)

  if (!isSummaryOnly) {
    printDetailedViolations(activeRuleKeys, ruleStats)
  }
}

function computeBaselineTotals(baselineContent) {
  let baselineTotalWarnings = 0
  let baselineTotalErrors = 0
  for (const f of Object.keys(baselineContent)) {
    for (const r of Object.keys(baselineContent[f])) {
      if (ALL_RULES[r]?.severity === 'ERROR') {
        baselineTotalErrors += baselineContent[f][r]
      } else if (ALL_RULES[r]?.severity === 'WARNING') {
        baselineTotalWarnings += baselineContent[f][r]
      }
    }
  }
  return { baselineTotalErrors, baselineTotalWarnings }
}

function groupViolationsByFileAndRule(activeRuleKeys, ruleStats) {
  const currentByFileAndRule = {}
  for (const rk of activeRuleKeys) {
    for (const v of ruleStats[rk].violations) {
      if (!currentByFileAndRule[v.file]) {
        currentByFileAndRule[v.file] = {}
      }
      currentByFileAndRule[v.file][rk] = (currentByFileAndRule[v.file][rk] || 0) + 1
    }
  }
  return currentByFileAndRule
}

function findFileRegressions(file, fileRules, baselineContent, isStrict, isRatchet) {
  const regressions = []
  const baselineFileRules = baselineContent[file] || null

  for (const [rk, currentCount] of Object.entries(fileRules)) {
    const rule = ALL_RULES[rk]
    if (isStrict && !isRatchet && rule?.severity !== 'ERROR') continue

    const baselineCount = baselineFileRules ? (baselineFileRules[rk] || 0) : 0
    if (currentCount > baselineCount) {
      regressions.push({
        file,
        rule: rk,
        severity: rule?.severity,
        current: currentCount,
        baseline: baselineCount,
        diff: currentCount - baselineCount,
        isNewFile: !baselineFileRules,
      })
    }
  }
  return regressions
}

function detectRegressions(activeRuleKeys, ruleStats, baselineContent, isStrict, isRatchet) {
  const currentByFileAndRule = groupViolationsByFileAndRule(activeRuleKeys, ruleStats)
  const regressions = []

  for (const [file, fileRules] of Object.entries(currentByFileAndRule)) {
    const fileRegs = findFileRegressions(file, fileRules, baselineContent, isStrict, isRatchet)
    if (fileRegs.length > 0) {
      regressions.push(...fileRegs)
    }
  }

  return regressions
}

function enforceStrictOrRatchet(params) {
  const { isStrict, isRatchet, clientRoot, targetDomains, activeRuleKeys, ruleStats, totalErrors, totalWarnings } = params
  const { combined: baselineContent } = loadBaselines(clientRoot, targetDomains)
  const regressions = detectRegressions(activeRuleKeys, ruleStats, baselineContent, isStrict, isRatchet)
  const { baselineTotalErrors, baselineTotalWarnings } = computeBaselineTotals(baselineContent)

  const errorDelta = totalErrors - baselineTotalErrors
  const warningDelta = totalWarnings - baselineTotalWarnings
  const formattedErrorDelta = (errorDelta >= 0 ? '+' : '') + errorDelta
  const formattedWarningDelta = (warningDelta >= 0 ? '+' : '') + warningDelta

  console.log(`\n${c.bold}ĐỐI SOÁT VỚI BASELINE SNAPSHOT:${c.reset}`)
  console.log(`- Lỗi [ERROR]    : Hiện tại ${totalErrors} | Baseline ${baselineTotalErrors} (Delta: ${formattedErrorDelta})`)
  console.log(`- Cảnh báo [WARN]: Hiện tại ${totalWarnings} | Baseline ${baselineTotalWarnings} (Delta: ${formattedWarningDelta})`)

  if (regressions.length > 0) {
    const modeName = isRatchet ? 'RATCHET (Toàn diện ERROR & WARNING)' : 'STRICT'
    console.error(`\n${c.red}${c.bold}[FAIL] Chế độ ${modeName}: Phát hiện ${regressions.length} điểm thoái lui (Boy Scout Rule Regressions) so với baseline snapshot:${c.reset}`)
    console.table(
      regressions.map((r) => ({
        File: r.file,
        Rule: r.rule,
        Severity: r.severity,
        'Baseline Count': r.baseline,
        'Current Count': r.current,
        'Regressed By': `+${r.diff}`,
        Status: r.isNewFile ? 'NEW FILE WITH VIOLATIONS' : 'COUNT INCREASED',
      }))
    )
    console.error(`\n${c.red}Chế độ ${modeName} thất bại. Thoát với Exit Code 1.${c.reset}`)
    process.exit(1)
  }

  if (isRatchet) {
    console.log(`\n${c.green}${c.bold}[PASS] Chế độ RATCHET: 0 điểm thoái lui cấp ERROR và WARNING so với baseline snapshot. Hợp lệ.${c.reset}`)
  } else {
    console.log(`\n${c.green}${c.bold}[PASS] Chế độ STRICT: 0 điểm thoái lui cấp ERROR so với baseline snapshot. Hợp lệ.${c.reset}`)
  }
  process.exit(0)
}

export function runAuditCli() {
  const startTime = performance.now()

  // ============================================================================
  // PARSE ARGUMENTS
  // ============================================================================
  const {
    showHelp,
    isStrict,
    isSummaryOnly,
    isErrorsOnly,
    isGenerateBaseline,
    isUpdateBaseline,
    isJsonFormat,
    targetPathFilter,
    targetRuleFilter,
    targetDomainFilter,
    isListRules,
    isRatchet,
  } = parseArgs()

  if (showHelp) {
    printHelp()
    process.exit(0)
  }

  if (isListRules) {
    printRulesCatalog(ALL_RULES)
    process.exit(0)
  }

  // ============================================================================
  // RESOLVE ACTIVE RULES & SCOPE
  // ============================================================================
  const { activeRuleKeys, targetDomains } = resolveActiveRules(
    targetDomainFilter,
    targetRuleFilter,
    isErrorsOnly
  )

  // ============================================================================
  // FILE DISCOVERY
  // ============================================================================
  const scanDir = targetPathFilter
    ? path.resolve(clientRoot, targetPathFilter)
    : srcRoot

  let allFilePaths = []
  if (fs.existsSync(scanDir)) {
    allFilePaths = fs.statSync(scanDir).isDirectory() ? getAllFiles(scanDir) : [scanDir]
  }

  printExecutionBanner({
    isJsonFormat,
    targetPathFilter,
    isRatchet,
    isStrict,
    isGenerateBaseline,
    isUpdateBaseline,
    isErrorsOnly,
    targetDomainFilter,
    targetRuleFilter,
  })

  // ============================================================================
  // EXECUTE AUDIT SCAN
  // ============================================================================
  const { ruleStats, scannedFilesCount } = executeAuditScan(allFilePaths, activeRuleKeys, clientRoot)

  // ============================================================================
  // BASELINE GENERATION / UPDATE
  // ============================================================================
  if (isGenerateBaseline || isUpdateBaseline) {
    handleBaselineGeneration(activeRuleKeys, ruleStats, targetDomains, clientRoot)
  }

  // ============================================================================
  // REPORTING
  // ============================================================================
  const durationMs = performance.now() - startTime
  const scanRate = durationMs > 0 ? allFilePaths.length / (durationMs / 1000) : 0
  const { summaryTable, totalErrors, totalWarnings } = buildSummaryTable(activeRuleKeys, ruleStats)

  // Định dạng JSON cho CI/CD
  if (isJsonFormat) {
    handleJsonOutput({
      durationMs,
      scanRate,
      allFilePaths,
      scannedFilesCount,
      totalErrors,
      totalWarnings,
      activeRuleKeys,
      ruleStats,
      targetPathFilter,
      isStrict,
      isRatchet,
    })
  }

  // Báo cáo Console thông thường
  printConsoleSummary(activeRuleKeys, ruleStats, summaryTable, isSummaryOnly)

  console.log('\n' + '-'.repeat(78))
  console.log(`TỔNG KẾT: ${c.red}${totalErrors} ERRORS${c.reset} | ${c.yellow}${totalWarnings} WARNINGS${c.reset} trên toàn bộ phạm vi quét.`)
  console.log(`Hiệu năng: ${c.cyan}${durationMs.toFixed(2)} ms${c.reset} | Tốc độ quét: ${c.cyan}${scanRate.toFixed(1)} files/sec${c.reset} (${allFilePaths.length} files tìm thấy, ${scannedFilesCount} files đọc đĩa)`)

  // ============================================================================
  // STRICT / RATCHET MODE ENFORCEMENT
  // ============================================================================
  if (isStrict || isRatchet) {
    enforceStrictOrRatchet({
      isStrict,
      isRatchet,
      clientRoot,
      targetDomains,
      activeRuleKeys,
      ruleStats,
      totalErrors,
      totalWarnings,
    })
  } else {
    console.log(`\n${c.green}[INFO] Quá trình quét hoàn tất ở chế độ Báo cáo/Đánh giá. Dùng --strict để làm chốt chặn CI/CD.${c.reset}`)
    process.exit(0)
  }
}

// Auto-run if executed directly as entry script
const isDirectRun = process.argv[1] && (
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]) ||
  normalizePath(path.resolve(process.argv[1])).endsWith('scripts/audit/cli.mjs')
)
if (isDirectRun) {
  runAuditCli()
}
