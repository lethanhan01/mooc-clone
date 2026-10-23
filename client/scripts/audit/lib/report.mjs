/**
 * @fileoverview Audit Reporting, Help Manual & Catalog Formatters
 */

export const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
}

export function printHelp() {
  console.log(`
${c.bold}${c.cyan}RoGym Conventions Suite — Static Audit Engine (19 Rules Enterprise)${c.reset}
Usage:
  node client/scripts/audit-conventions.mjs [options]

Options:
  ${c.yellow}--help, -h${c.reset}               Hiển thị tài liệu hướng dẫn và danh sách 19 rules.
  ${c.yellow}--strict${c.reset}                 Chế độ kiểm tra nghiêm ngặt kết hợp Baseline Snapshot (Exit 1 nếu có lỗi mới).
  ${c.yellow}--ratchet${c.reset}                Chế độ Boy Scout siết van một chiều (chặn mọi lỗi ERROR và WARNING mới).
  ${c.yellow}--generate-baseline${c.reset}      Quét toàn bộ codebase và khởi tạo file audit-baseline.json theo domain.
  ${c.yellow}--update-baseline${c.reset}        Cập nhật baseline theo domain và đồng bộ file tổng hợp audit-baseline.json.
  ${c.yellow}--domain=<domain1,domain2>${c.reset} Quét lọc theo 1 hoặc nhiều domain (html-semantic, css-tokens, ...).
  ${c.yellow}--list-rules${c.reset}              In danh mục bảng tra cứu toàn bộ rules, Canonical ID và DocRef.
  ${c.yellow}--errors-only${c.reset}            Chỉ quét và báo cáo các rules nghiêm trọng cấp [ERROR], bỏ qua [WARN].
  ${c.yellow}--format=<text|json>${c.reset}      Định dạng xuất kết quả: 'text' (mặc định) hoặc 'json' (cho CI/CD).
  ${c.yellow}--path=<dir|file>${c.reset}        Chỉ quét các file nằm trong đường dẫn chỉ định (vd: --path=src/components/ui).
  ${c.yellow}--rule=<rule_name>${c.reset}       Chỉ quét kiểm tra 1 rule duy nhất (vd: --rule=HEX_COLOR_ONLY_IN_CSS).
  ${c.yellow}--summary${c.reset}                Chỉ hiển thị bảng tổng kết số lượng vi phạm, không in chi tiết từng dòng.

Danh sách 19 Rules Enterprise:
  1.  ${c.red}[ERROR]${c.reset}  ${c.bold}HEX_COLOR_ONLY_IN_CSS${c.reset}      : Cấm rgba(), rgb(), hsl(), hsla(), color-mix(), #fff trong CSS (trừ semantic tokens).
  2.  ${c.red}[ERROR]${c.reset}  ${c.bold}NO_RAW_INTERACTIVE_ELEMENTS${c.reset}: Cấm <button>, <a>, <form> raw ngoài thư mục ui/ và shared/.
  3.  ${c.red}[ERROR]${c.reset}  ${c.bold}NO_DANGEROUS_HTML${c.reset}          : Cấm dangerouslySetInnerHTML chưa kiểm soát.
  4.  ${c.red}[ERROR]${c.reset}  ${c.bold}NO_UNSAFE_TARGET_BLANK${c.reset}     : Bắt buộc rel="noopener noreferrer" khi dùng target="_blank".
  5.  ${c.red}[ERROR]${c.reset}  ${c.bold}FORWARD_REF_NAME${c.reset}           : Bắt buộc gán displayName khi dùng forwardRef.
  6.  ${c.red}[ERROR]${c.reset}  ${c.bold}NO_RAW_COLORS_IN_JSX${c.reset}       : Cấm mã màu thô (HEX, RGB, RGBA, HSL) trong JSX.
  7.  ${c.yellow}[WARN]${c.reset}   ${c.bold}NO_NONSEMANTIC_TAGS${c.reset}        : Cấm <div>, <span>, <b>, <i>, <u> thiếu comment rogym-convention-exempt.
  8.  ${c.yellow}[WARN]${c.reset}   ${c.bold}NO_INLINE_STYLE${c.reset}             : Cấm style={{...}} inline (trừ CSS variables tone).
  9.  ${c.yellow}[WARN]${c.reset}   ${c.bold}NO_UNSTABLE_KEY${c.reset}              : Cấm dùng key={index} hoặc key={i} trong JSX.
  10. ${c.yellow}[WARN]${c.reset}   ${c.bold}SEMANTIC_CLICK${c.reset}               : Thẻ non-interactive có onClick bắt buộc có ARIA role.
  11. ${c.yellow}[WARN]${c.reset}   ${c.bold}NO_TS_ANY${c.reset}                    : Cấm : any, as any, <any>, Record<..., any>, Promise<any>.
  12. ${c.yellow}[WARN]${c.reset}   ${c.bold}NO_MAGIC_Z_INDEX${c.reset}             : Cấm z-[9999], z-[100] tùy tiện; bắt buộc dùng thang 5 tầng chuẩn.
  13. ${c.yellow}[WARN]${c.reset}   ${c.bold}NO_RAW_SVG_IN_JSX${c.reset}           : Cấm nhúng raw thẻ <svg> trực tiếp trên page; dùng <Icon> hoặc lucide.
  14. ${c.yellow}[WARN]${c.reset}   ${c.bold}NO_HARDCODED_API_URL${c.reset}        : Cấm hardcode URL /api/v1/... trong component UI; gọi qua services.
  15. ${c.yellow}[WARN]${c.reset}   ${c.bold}NO_EFFECT_FETCH${c.reset}              : Cấm gọi fetch/axios/api/Service trực tiếp trong useEffect.
  16. ${c.yellow}[WARN]${c.reset}   ${c.bold}NO_CONSOLE_LOG${c.reset}               : Cấm console.log còn sót lại trong mã nguồn.
  17. ${c.yellow}[WARN]${c.reset}   ${c.bold}NO_MAGIC_DIMENSIONS${c.reset}          : Cấm arbitrary pixel dimensions w-[320px], h-[45px] trong Tailwind.
  18. ${c.yellow}[WARN]${c.reset}   ${c.bold}NO_FALSY_LEAKAGE${c.reset}             : Cấm conditional rendering dạng items.length && gây rò rỉ số 0.
  19. ${c.yellow}[WARN]${c.reset}   ${c.bold}FILE_SIZE_LIMIT${c.reset}              : Cảnh báo file .tsx vượt quá 250 dòng vật lý.

Cú pháp ngoại lệ chuẩn doanh nghiệp (STD-EXEMPT-001):
  {/* rogym-convention-exempt: RULE_ID [until: YYYY-MM-DD] [Lý do kỹ thuật cụ thể] */}
  // rogym-convention-exempt: RULE_ID [until: YYYY-MM-DD] [Lý do kỹ thuật cụ thể]
`)
}

export function printRulesCatalog(allRules) {
  const tableData = Object.entries(allRules).map(([id, r]) => ({
    'Rule ID': id,
    Domain: r.domain || 'N/A',
    'Canonical ID': r.canonicalId || id,
    DocRef: r.docRef || id,
    Severity: r.severity === 'ERROR' ? `${c.red}ERROR${c.reset}` : `${c.yellow}WARN${c.reset}`,
    Description: r.description.slice(0, 60),
  }))

  console.log(`\n${c.bold}${c.cyan}DANH MỤC ${Object.keys(allRules).length} RULES KIỂM TOÁN TĨNH (8 DOMAINS DOANH NGHIỆP):${c.reset}\n`)
  console.table(tableData)
}

export function formatJsonReport({
  durationMs,
  scanRate,
  allFilePaths,
  scannedFilesCount,
  totalErrors,
  totalWarnings,
  ruleKeys,
  ruleStats,
  allRules,
  targetPathFilter,
  executionMode,
}) {
  return {
    timestamp: new Date().toISOString(),
    targetPath: targetPathFilter || 'client/src/',
    executionMode,
    stats: {
      durationMs: Number(durationMs.toFixed(2)),
      scanRateFilesPerSec: Number(scanRate.toFixed(1)),
      totalFilesEvaluated: allFilePaths.length,
      totalFilesRead: scannedFilesCount,
      totalErrors,
      totalWarnings,
    },
    summary: ruleKeys.map((rk) => {
      const stats = ruleStats[rk]
      const rule = allRules[rk]
      const count = stats.errors + stats.warnings
      let status = 'PASS'
      if (count > 0) {
        status = rule.severity === 'ERROR' ? 'FAIL' : 'FLAGGED'
      }
      return {
        ruleId: rk,
        domain: rule.domain,
        canonicalId: rule.canonicalId,
        docRef: rule.docRef,
        severity: rule.severity,
        violationsCount: count,
        status,
      }
    }),
    violations: ruleKeys.flatMap((rk) =>
      ruleStats[rk].violations.map((v) => ({
        ruleId: rk,
        domain: allRules[rk].domain,
        canonicalId: allRules[rk].canonicalId,
        docRef: allRules[rk].docRef,
        severity: allRules[rk].severity,
        file: v.file,
        line: v.line,
        message: v.text,
      }))
    ),
  }
}
