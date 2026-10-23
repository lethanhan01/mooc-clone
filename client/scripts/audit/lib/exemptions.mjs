/**
 * @fileoverview Structured Exemption Comment Parser with STD-EXEMPT-001 Support
 */

function recordExemptionRules(exemptions, lineNum, rulesList) {
  if (!exemptions.has(lineNum)) {
    exemptions.set(lineNum, new Set())
  }
  const ruleSet = exemptions.get(lineNum)
  for (const rule of rulesList) {
    ruleSet.add(rule)
  }
}

function parseExemptionPrefix(line) {
  const marker = 'rogym-convention-exempt:'
  const markerIdx = line.indexOf(marker)
  if (markerIdx === -1) return null

  const firstBracket = line.indexOf('[', markerIdx + marker.length)
  if (firstBracket === -1) return null

  const rulesPart = line.slice(markerIdx + marker.length, firstBracket).trim()
  const rulesList = rulesPart
    .split(',')
    .map((r) => r.trim().toUpperCase())
    .filter(Boolean)

  return rulesList.length > 0 ? rulesList : null
}

function parseUntilBracket(b) {
  if (!b.toLowerCase().startsWith('until:')) return null
  const rest = b.slice(6).trim()
  const dateMatch = /^(\d{4}-\d{2}-\d{2})/.exec(rest)
  if (!dateMatch) return null
  const untilDate = dateMatch[1]
  const afterDate = rest.slice(10).replace(/^[\s:-]+/, '').trim()
  return { untilDate, reason: afterDate }
}

function parseBracketMetadata(bracketMatches) {
  let untilDate = null
  let reason = ''

  for (const b of bracketMatches) {
    const untilInfo = parseUntilBracket(b)
    if (untilInfo) {
      untilDate = untilInfo.untilDate
      if (untilInfo.reason && !reason) {
        reason = untilInfo.reason
      }
    } else if (!reason) {
      reason = b
    } else {
      reason += ` | ${b}`
    }
  }

  return { untilDate, reason }
}

function extractBrackets(line) {
  const brackets = []
  let pos = 0
  while (pos < line.length) {
    const start = line.indexOf('[', pos)
    if (start === -1) break
    const end = line.indexOf(']', start + 1)
    if (end === -1) break
    const content = line.slice(start + 1, end).trim()
    if (content.length > 0) brackets.push(content)
    pos = end + 1
  }
  return brackets
}

function processExemptionLine(line, idx, exemptions) {
  if (!line.includes('rogym-convention-exempt:')) return

  // Trích xuất các khối [...] trong dòng
  const bracketMatches = extractBrackets(line)
  if (bracketMatches.length === 0) return

  // Trích xuất phần rules trước dấu [ đầu tiên
  const rulesList = parseExemptionPrefix(line)
  if (!rulesList) return

  const { untilDate, reason } = parseBracketMetadata(bracketMatches)
  if (!reason && !untilDate) return

  // Hỗ trợ File-level exemption: khi comment chứa 'ALL' hoặc nằm ở top 5 dòng đầu file
  if (rulesList.includes('ALL')) {
    exemptions.isAllExempt = true
  }
  if (idx < 5) {
    for (const r of rulesList) {
      exemptions.fileLevelRules.add(r)
    }
  }

  recordExemptionRules(exemptions, idx + 1, rulesList)
  recordExemptionRules(exemptions, idx + 2, rulesList)

  exemptions.list.push({
    line: idx + 1,
    rules: rulesList,
    untilDate,
    reason: reason || '(Không có lý do chi tiết)',
  })
}

/**
 * Phân tích các comment ngoại lệ có cấu trúc:
 * {/* rogym-convention-exempt: RULE_1, RULE_2 [until: YYYY-MM-DD] [Lý do kỹ thuật] *}
 * hoặc // rogym-convention-exempt: RULE_1 [Lý do]
 * Áp dụng cho dòng hiện tại (idx + 1) và dòng kế tiếp (idx + 2).
 *
 * @param {string[]} rawLines
 * @returns {Map<number, Set<string>> & { list: Array<{ line: number, rules: string[], untilDate: string | null, reason: string }> }}
 */
export function parseExemptions(rawLines) {
  /** @type {Map<number, Set<string>> & { list: Array<{ line: number, rules: string[], untilDate: string | null, reason: string }>, isAllExempt?: boolean, fileLevelRules?: Set<string> }} */
  const exemptions = new Map()
  exemptions.list = []
  exemptions.isAllExempt = false
  exemptions.fileLevelRules = new Set()

  for (let idx = 0; idx < rawLines.length; idx++) {
    processExemptionLine(rawLines[idx], idx, exemptions)
  }

  return exemptions
}
