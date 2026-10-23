/**
 * @fileoverview Domain Baselines Manager & Dual-Sync Engine
 */

import fs from 'node:fs'
import path from 'node:path'

export const DOMAINS = [
  'html-semantic',
  'css-tokens',
  'react-props',
  'a11y',
  'forms',
  'state',
  'architecture',
  'security',
  'testing',
]

function mergeDomainContent(combined, content) {
  for (const [filePath, rules] of Object.entries(content)) {
    if (!combined[filePath]) {
      combined[filePath] = {}
    }
    for (const [ruleId, count] of Object.entries(rules)) {
      combined[filePath][ruleId] = (combined[filePath][ruleId] || 0) + count
    }
  }
}

function loadDomainFiles(baselinesDir, activeDomains, byDomain, combined) {
  const files = fs.readdirSync(baselinesDir)
  for (const file of files) {
    if (!file.endsWith('.json')) continue
    const domain = path.basename(file, '.json')
    if (activeDomains && !activeDomains.includes(domain)) continue

    const fullPath = path.join(baselinesDir, file)
    try {
      const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
      byDomain[domain] = content
      mergeDomainContent(combined, content)
    } catch (err) {
      console.error(`[WARN] Lỗi khi đọc baseline domain "${domain}":`, err.message)
    }
  }
}

function loadLegacyCombined(combinedPath) {
  try {
    return JSON.parse(fs.readFileSync(combinedPath, 'utf-8'))
  } catch (err) {
    console.error('[WARN] Lỗi khi đọc audit-baseline.json:', err.message)
    return {}
  }
}

/**
 * Đọc toàn bộ baseline theo domain và hợp nhất thành bảng tra cứu in-memory.
 * @param {string} clientRoot
 * @param {string[]|null} [activeDomains]
 * @returns {{ combined: Record<string, Record<string, number>>, byDomain: Record<string, Record<string, Record<string, number>>> }}
 */
export function loadBaselines(clientRoot, activeDomains = null) {
  const baselinesDir = path.join(clientRoot, 'scripts', 'audit', 'baselines')
  const combinedPath = path.join(clientRoot, 'scripts', 'audit-baseline.json')

  const byDomain = {}
  const combined = {}

  if (fs.existsSync(baselinesDir)) {
    loadDomainFiles(baselinesDir, activeDomains, byDomain, combined)
  }

  // Fallback nếu thư mục baselines/ chưa tồn tại hoặc rỗng: đọc từ file tổng hợp cũ
  if (Object.keys(combined).length === 0 && fs.existsSync(combinedPath)) {
    Object.assign(combined, loadLegacyCombined(combinedPath))
  }

  return { combined, byDomain }
}

function sortNestedBaseline(data) {
  const sorted = {}
  const sortedFiles = Object.keys(data).sort((a, b) => a.localeCompare(b))
  for (const f of sortedFiles) {
    sorted[f] = {}
    const sortedRules = Object.keys(data[f]).sort((a, b) => a.localeCompare(b))
    for (const r of sortedRules) {
      sorted[f][r] = data[f][r]
    }
  }
  return sorted
}

function initDomainData(baselinesDir, targetDomains) {
  const domainData = {}
  for (const d of DOMAINS) {
    domainData[d] = {}
  }

  if (targetDomains && targetDomains.length > 0) {
    for (const d of DOMAINS) {
      if (targetDomains.includes(d)) continue
      const domainFile = path.join(baselinesDir, `${d}.json`)
      if (fs.existsSync(domainFile)) {
        try {
          domainData[d] = JSON.parse(fs.readFileSync(domainFile, 'utf-8'))
        } catch {
          domainData[d] = {}
        }
      }
    }
  }

  return domainData
}

function populateDomainData(domainData, baselineData, ruleDomainMap, targetDomains) {
  for (const [file, rules] of Object.entries(baselineData)) {
    for (const [ruleId, count] of Object.entries(rules)) {
      const domain = ruleDomainMap[ruleId] || 'architecture'
      if (targetDomains && targetDomains.length > 0 && !targetDomains.includes(domain)) {
        continue
      }
      if (!domainData[domain]) {
        domainData[domain] = {}
      }
      if (!domainData[domain][file]) {
        domainData[domain][file] = {}
      }
      domainData[domain][file][ruleId] = count
    }
  }
}

function writeDomainFiles(baselinesDir, domainData, targetDomains) {
  for (const d of DOMAINS) {
    if (targetDomains && targetDomains.length > 0 && !targetDomains.includes(d)) {
      continue
    }

    const sortedDomain = sortNestedBaseline(domainData[d] || {})
    const domainFilePath = path.join(baselinesDir, `${d}.json`)
    fs.writeFileSync(domainFilePath, JSON.stringify(sortedDomain, null, 2) + '\n', 'utf-8')
  }
}

function syncCombinedBaseline(baselinesDir, combinedPath) {
  const finalCombined = {}
  for (const d of DOMAINS) {
    const domainFilePath = path.join(baselinesDir, `${d}.json`)
    if (!fs.existsSync(domainFilePath)) continue
    try {
      const c = JSON.parse(fs.readFileSync(domainFilePath, 'utf-8'))
      for (const [f, rules] of Object.entries(c)) {
        if (!finalCombined[f]) finalCombined[f] = {}
        for (const [r, count] of Object.entries(rules)) {
          finalCombined[f][r] = count
        }
      }
    } catch (err) {
      console.error(`[WARN] Lỗi đọc ${d}.json khi sync:`, err.message)
    }
  }

  const sortedCombined = sortNestedBaseline(finalCombined)
  fs.writeFileSync(combinedPath, JSON.stringify(sortedCombined, null, 2) + '\n', 'utf-8')
  return Object.keys(sortedCombined).length
}

/**
 * Phân loại vi phạm theo domain, lưu vào thư mục audit/baselines/<domain>.json
 * và tự động đồng bộ hóa ghi đè file tổng hợp audit-baseline.json (Dual-sync).
 *
 * @param {string} clientRoot
 * @param {Record<string, Record<string, number>>} baselineData - { [filePath]: { [ruleId]: count } }
 * @param {Record<string, string>} ruleDomainMap - { [ruleId]: domain }
 * @param {string[]|null} [targetDomains] - Nếu chỉ định, chỉ cập nhật các domain này
 */
export function saveBaselines(clientRoot, baselineData, ruleDomainMap, targetDomains = null) {
  const baselinesDir = path.join(clientRoot, 'scripts', 'audit', 'baselines')
  const combinedPath = path.join(clientRoot, 'scripts', 'audit-baseline.json')

  if (!fs.existsSync(baselinesDir)) {
    fs.mkdirSync(baselinesDir, { recursive: true })
  }

  const domainData = initDomainData(baselinesDir, targetDomains)
  populateDomainData(domainData, baselineData, ruleDomainMap, targetDomains)
  writeDomainFiles(baselinesDir, domainData, targetDomains)

  const combinedFilesCount = syncCombinedBaseline(baselinesDir, combinedPath)
  return { domainCount: DOMAINS.length, combinedFilesCount }
}
