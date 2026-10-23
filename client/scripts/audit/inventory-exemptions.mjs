import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const clientRoot = path.resolve(__dirname, '../..')
const repoRoot = path.resolve(clientRoot, '..')
const srcRoot = path.join(clientRoot, 'src')
const baselinePath = path.join(clientRoot, 'scripts/audit-baseline.json')
const reportsDir = path.join(repoRoot, 'docs/VI/semantic-design/reports')

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true })
}

// Map rules to their intended Phase 2 domains
const RULE_DOMAIN_MAP = {
  // HTML Semantic
  NO_RAW_INTERACTIVE_ELEMENTS: 'html-semantic',
  NO_RAW_TABLE_ELEMENTS: 'html-semantic',
  NO_RAW_FORM_ELEMENTS: 'html-semantic',
  NO_NONSEMANTIC_TAGS: 'html-semantic',
  SEMANTIC_CLICK: 'html-semantic',
  NO_DANGEROUS_HTML: 'html-semantic',
  NO_UNSAFE_TARGET_BLANK: 'html-semantic',

  // Tokens & Styling
  HEX_COLOR_ONLY_IN_CSS: 'tokens-styling',
  NO_RAW_COLORS_IN_JSX: 'tokens-styling',
  NO_INLINE_STYLE: 'tokens-styling',
  NO_MAGIC_DIMENSIONS: 'tokens-styling',
  NO_MAGIC_Z_INDEX: 'tokens-styling',

  // Code Quality
  NO_UNSTABLE_KEY: 'code-quality',
  NO_TS_ANY: 'code-quality',
  NO_FALSY_LEAKAGE: 'code-quality',
  FORWARD_REF_NAME: 'code-quality',
  NO_CONSOLE_LOG: 'code-quality',
  FILE_SIZE_LIMIT: 'code-quality',

  // Network & Architecture
  NO_HARDCODED_API_URL: 'network-architecture',
  NO_EFFECT_FETCH: 'network-architecture',

  // Icons & Assets
  NO_RAW_SVG_IN_JSX: 'icons-assets',
}

// 1. Read audit-baseline.json
let baselineData = {}
if (fs.existsSync(baselinePath)) {
  baselineData = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'))
}

// 2. Scan inline comment exemptions in src/
const inlineExemptions = []
const exemptionRegex =
  /(?:\{\/\*|\/\/)\s*rogym-convention-exempt:\s*(\w+(?:\s*,\s*\w+)*)\s*\[([^\]]+)\]/

function scanInlineExemptions(dirPath) {
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
      scanInlineExemptions(fullPath)
    } else if (/\.(tsx?|m?js|css)$/.test(entry.name)) {
      const rel = path.relative(clientRoot, fullPath).replaceAll('\\', '/')
      if (rel.includes('.test.') || rel.includes('src/test/')) continue

      const content = fs.readFileSync(fullPath, 'utf-8')
      const lines = content.split('\n')
      lines.forEach((line, idx) => {
        const match = exemptionRegex.exec(line)
        if (match) {
          inlineExemptions.push({
            file: rel,
            line: idx + 1,
            rules: match[1].split(',').map((r) => r.trim()),
            reason: match[2].trim(),
          })
        }
      })
    }
  }
}

scanInlineExemptions(srcRoot)

// 3. Aggregate baseline exemptions by rule and domain
const ruleAggregates = {}
const domainAggregates = {}
let totalBaselineViolations = 0

for (const [file, rules] of Object.entries(baselineData)) {
  for (const [ruleName, count] of Object.entries(rules)) {
    totalBaselineViolations += count

    if (!ruleAggregates[ruleName]) {
      ruleAggregates[ruleName] = {
        total: 0,
        domain: RULE_DOMAIN_MAP[ruleName] || 'unassigned',
        files: {},
      }
    }
    ruleAggregates[ruleName].total += count
    ruleAggregates[ruleName].files[file] = count

    const domain = RULE_DOMAIN_MAP[ruleName] || 'unassigned'
    if (!domainAggregates[domain]) {
      domainAggregates[domain] = {
        totalViolations: 0,
        rules: {},
      }
    }
    domainAggregates[domain].totalViolations += count
    domainAggregates[domain].rules[ruleName] =
      (domainAggregates[domain].rules[ruleName] || 0) + count
  }
}

const inventoryOutput = {
  timestamp: new Date().toISOString(),
  source: 'client/scripts/audit-baseline.json',
  summary: {
    totalFilesWithBaselineExemptions: Object.keys(baselineData).length,
    totalBaselineViolations,
    totalInlineCommentExemptions: inlineExemptions.length,
  },
  domainSummary: domainAggregates,
  rulesSummary: ruleAggregates,
  inlineCommentExemptions: inlineExemptions,
  fileBreakdown: baselineData,
}

const outputPath = path.join(reportsDir, 'exemption-inventory.json')
fs.writeFileSync(outputPath, JSON.stringify(inventoryOutput, null, 2), 'utf-8')

console.log('='.repeat(78))
console.log('RoGym Exemption Inventory & Domain Allocation (P0-06)')
console.log('='.repeat(78))
console.log(
  `Files with Baseline Exemptions : ${inventoryOutput.summary.totalFilesWithBaselineExemptions}`
)
console.log(`Total Baseline Violations      : ${totalBaselineViolations}`)
console.log(`Inline Comment Exemptions      : ${inlineExemptions.length}`)
console.log('Domain Allocation Summary:')
for (const [domain, dData] of Object.entries(domainAggregates)) {
  console.log(`  - [${domain}]: ${dData.totalViolations} violations`)
}
console.log('='.repeat(78))
console.log(`[PASS] Exemption Inventory exported: ${outputPath}`)
