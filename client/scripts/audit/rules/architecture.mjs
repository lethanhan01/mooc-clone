/**
 * @fileoverview Domain: architecture (STD-SIZE-001, STD-CLEAN-001, STD-TS-001)
 */

import path from 'node:path'
import { isTestFile } from '../lib/files.mjs'
import { parseExemptions } from '../lib/exemptions.mjs'

export const rules = {
  FILE_SIZE_LIMIT: {
    id: 'FILE_SIZE_LIMIT',
    domain: 'architecture',
    canonicalId: 'STD-SIZE-001',
    docRef: 'SEM-ARCH-001',
    severity: 'WARNING',
    description: 'Component .tsx không nên vượt quá 250 dòng vật lý (Single Responsibility Principle).',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkFile: (content, rel, lines, isExempt) => {
      if (isExempt('FILE_SIZE_LIMIT')) return []
      if (lines.length > 250) {
        return [
          {
            line: 251,
            text: `File "${path.basename(rel)}" có ${lines.length} dòng vật lý, vượt quá giới hạn 250 dòng (Single Responsibility Principle)`,
          },
        ]
      }
      return []
    },
    message: 'File .tsx vượt quá giới hạn 250 dòng vật lý',
  },

  NO_CONSOLE_LOG: {
    id: 'NO_CONSOLE_LOG',
    domain: 'architecture',
    canonicalId: 'STD-CLEAN-001',
    docRef: 'SEM-ARCH-002',
    severity: 'WARNING',
    description: 'Cấm lệnh console.log còn sót lại trong mã nguồn.',
    filter: (rel) =>
      (rel.endsWith('.ts') || rel.endsWith('.tsx') || rel.endsWith('.js') || rel.endsWith('.mjs')) &&
      !isTestFile(rel) &&
      !rel.startsWith('scripts/'),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_CONSOLE_LOG')) return false
      return /console\.log\(/.test(line)
    },
    message: 'Lệnh console.log còn sót lại trong mã nguồn',
  },

  NO_TS_ANY: {
    id: 'NO_TS_ANY',
    domain: 'architecture',
    canonicalId: 'STD-TS-001',
    docRef: 'SEM-ARCH-003',
    severity: 'WARNING',
    description: 'Cấm khai báo kiểu lỏng lẻo : any, as any, <any>, Record<..., any>, Promise<any> trong TypeScript.',
    filter: (rel) => (rel.endsWith('.ts') || rel.endsWith('.tsx')) && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_TS_ANY')) return false
      let codeOnly = line
      const commentIdx = codeOnly.indexOf('//')
      if (commentIdx !== -1) {
        codeOnly = codeOnly.slice(0, commentIdx)
      }
      const hasDirectAny = /:\s*any(?:\[\]|\b)|as\s+any(?:\[\]|\b)|<any>/.test(codeOnly)
      const hasGenericAny = /(?:Promise|Array)<any>|(?:Record|Map)<[^>]*,\s*any>/.test(codeOnly)
      return hasDirectAny || hasGenericAny
    },
    message: 'Sử dụng kiểu TypeScript lỏng lẻo (any / as any / <any> / Promise<any> / Record<..., any>)',
  },

  EXEMPTION_EXPIRED: {
    id: 'EXEMPTION_EXPIRED',
    domain: 'architecture',
    canonicalId: 'SEM-GOV-001',
    docRef: 'SEM-GOV-001',
    severity: 'WARNING',
    description: 'Comment ngoại lệ có cú pháp until: YYYY-MM-DD đã quá hạn so với ngày quét hiện tại.',
    filter: (rel) =>
      (rel.endsWith('.ts') || rel.endsWith('.tsx') || rel.endsWith('.css') || rel.endsWith('.js') || rel.endsWith('.mjs')) &&
      !isTestFile(rel),
    checkFile: (content, rel, rawLines, isExempt) => {
      if (isExempt('EXEMPTION_EXPIRED')) return []
      const exemptions = parseExemptions(rawLines)
      const todayISO = new Date().toISOString().slice(0, 10)
      const violations = []

      for (const item of exemptions.list) {
        if (item.untilDate && item.untilDate < todayISO) {
          violations.push({
            line: item.line,
            text: `Ngoại lệ cho [${item.rules.join(', ')}] đã quá hạn vào ngày ${item.untilDate} (hôm nay: ${todayISO}). Cần xử lý dứt điểm hoặc gia hạn.`,
          })
        }
      }

      return violations
    },
    message: 'Ngoại lệ rogym-convention-exempt đã quá hạn thời gian cho phép (until: YYYY-MM-DD)',
  },

  NO_BYPASS_ABORT_SIGNAL: {
    id: 'NO_BYPASS_ABORT_SIGNAL',
    domain: 'architecture',
    canonicalId: 'API-RES-001',
    docRef: 'SEM-API-001',
    severity: 'WARNING',
    description: 'Hàm gọi API trong services (đặc biệt là GET/search/list) phải nhận và chuyển tiếp signal?: AbortSignal.',
    filter: (rel) => rel.endsWith('.ts') && rel.startsWith('src/services/') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_BYPASS_ABORT_SIGNAL')) return false
      if (/(?:api|axios)\.get(?:<[^>]+>)?\(/.test(line)) {
        const surrounding = lines.slice(Math.max(0, idx - 4), Math.min(lines.length, idx + 5)).join('\n')
        if (!/\bsignal\b/.test(surrounding)) {
          return true
        }
      }
      return false
    },
    message: 'Hàm gọi API trong service bỏ qua tham số signal?: AbortSignal (nguy cơ Race Condition)',
  },

  NO_UI_IN_SERVICE: {
    id: 'NO_UI_IN_SERVICE',
    domain: 'architecture',
    canonicalId: 'STD-ARCH-005',
    docRef: 'SEM-ARCH-005',
    severity: 'ERROR',
    description: 'Cấm import hoặc gọi toast, alert, useNavigate, useRouter, hoặc UI components trong services.',
    filter: (rel) => rel.endsWith('.ts') && rel.startsWith('src/services/') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_UI_IN_SERVICE')) return false
      return /\b(?:toast\.(?:success|error|info|warning)|alert\(|useNavigate|useRouter)\b|from\s+['"]@\/components/.test(line)
    },
    message: 'Nhúng Toast/Router/UI vào tầng service vi phạm Dumb Transport (Single Responsibility)',
  },

  NO_DIRECT_AXIOS_IN_UI: {
    id: 'NO_DIRECT_AXIOS_IN_UI',
    domain: 'architecture',
    canonicalId: 'STD-ARCH-006',
    docRef: 'SEM-ARCH-006',
    severity: 'ERROR',
    description: 'Cấm gọi trực tiếp Axios trong UI (bypass Mutex Silent Refresh và Token Governance).',
    filter: (rel) =>
      (rel.startsWith('src/pages/') || rel.startsWith('src/components/') || rel.startsWith('src/hooks/')) &&
      !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_DIRECT_AXIOS_IN_UI')) return false
      return /import\s+axios\s+from\s+['"]axios['"]|import\s+\{[^}]*api[^}]*\}\s+from\s+['"]@\/lib\/api['"]/.test(line)
    },
    message: 'Import trực tiếp axios hoặc @/lib/api trong UI component; bắt buộc gọi qua service module',
  },

  NO_RAW_AXIOS_RESPONSE: {
    id: 'NO_RAW_AXIOS_RESPONSE',
    domain: 'architecture',
    canonicalId: 'API-RES-002',
    docRef: 'SEM-API-002',
    severity: 'WARNING',
    description: 'Bắt buộc unwrap DTO tại service, cấm trả về nguyên khối AxiosResponse.',
    filter: (rel) => rel.endsWith('.ts') && rel.startsWith('src/services/') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_RAW_AXIOS_RESPONSE')) return false
      return /Promise\s*<\s*AxiosResponse\b/.test(line)
    },
    message: 'Service trả về raw Promise<AxiosResponse<T>> thay vì unwrap DTO dữ liệu sạch',
  },

  NO_BARREL_IMPORT_LIB: {
    id: 'NO_BARREL_IMPORT_LIB',
    domain: 'architecture',
    canonicalId: 'STD-ARCH-007',
    docRef: 'SEM-ARCH-007',
    severity: 'ERROR',
    description: 'Cấm import từ file barrel @/lib làm tê liệt Tree-shaking và phình to bundle.',
    filter: (rel) => (rel.endsWith('.ts') || rel.endsWith('.tsx')) && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_BARREL_IMPORT_LIB')) return false
      return /from\s+['"](?:@\/lib|\.{1,2}\/lib)['"]/.test(line)
    },
    message: 'Import từ file barrel @/lib làm tê liệt Tree-shaking; bắt buộc import trực tiếp module con (@/lib/logger, @/lib/toast)',
  },

  NO_BARREL_IMPORT_UTILS: {
    id: 'NO_BARREL_IMPORT_UTILS',
    domain: 'architecture',
    canonicalId: 'STD-ARCH-008',
    docRef: 'SEM-ARCH-008',
    severity: 'WARNING',
    description: 'Cấm import từ file barrel @/utils, yêu cầu import trực tiếp từng file tiện ích độc lập.',
    filter: (rel) =>
      (rel.endsWith('.ts') || rel.endsWith('.tsx')) &&
      !rel.endsWith('src/utils/index.ts') &&
      !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_BARREL_IMPORT_UTILS')) return false
      return /from\s+['"](?:@\/utils|\.{1,2}\/utils)['"]/.test(line)
    },
    message: 'Import từ file barrel @/utils làm tê liệt Tree-shaking; bắt buộc import trực tiếp file tiện ích (@/utils/date, @/utils/cn)',
  },

  NO_NON_RFC_ERROR_FORMAT: {
    id: 'NO_NON_RFC_ERROR_FORMAT',
    domain: 'architecture',
    canonicalId: 'API-RES-003',
    docRef: 'SEM-API-003',
    severity: 'WARNING',
    description: 'Chuẩn hóa xử lý lỗi API theo RFC 7807/9457 Problem Details.',
    filter: (rel) => (rel.endsWith('.ts') || rel.endsWith('.tsx')) && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_NON_RFC_ERROR_FORMAT')) return false
      return /error(?:\.response)?\.data\.message|err(?:\.response)?\.data\.message/.test(line)
    },
    message: 'Bóc tách lỗi API dạng ad-hoc (error?.response?.data?.message) thay vì dùng parseProblemDetails hoặc getApiError',
  },

  NO_MUTATING_PROPS_OR_STATE: {
    id: 'NO_MUTATING_PROPS_OR_STATE',
    domain: 'architecture',
    canonicalId: 'STD-ARCH-009',
    docRef: 'SEM-ARCH-009',
    severity: 'ERROR',
    description: 'Đảm bảo tính thuần túy (Pure Function) của các hàm tính toán, cấm đột biến trực tiếp mảng đối số.',
    filter: (rel) => rel.endsWith('.ts') && rel.startsWith('src/utils/') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_MUTATING_PROPS_OR_STATE')) return false
      return /(?<!\[\.\.\.\w+\])(?<!\.slice\(\))\b\w+\.(?:sort|splice|reverse)\(/.test(line)
    },
    message: 'Gọi trực tiếp .sort(), .splice(), .reverse() đột biến mảng đối số trong utils; hãy tạo bản sao [...items] trước khi thao tác',
  },

  NO_MUTABLE_UTILS: {
    id: 'NO_MUTABLE_UTILS',
    domain: 'architecture',
    canonicalId: 'STD-ARCH-010',
    docRef: 'SEM-ARCH-010',
    severity: 'ERROR',
    description: 'Cấm module state khả biến gây ô nhiễm dữ liệu giữa các test cases và phiên người dùng.',
    filter: (rel) => rel.endsWith('.ts') && rel.startsWith('src/utils/') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_MUTABLE_UTILS')) return false
      return /^(?:export\s+)?(?:let|var)\s+\w+/.test(line.trim())
    },
    message: 'Khai báo let/var ở phạm vi module utils gây impure functions và rò rỉ trạng thái giữa các phiên',
  },

  NO_UNLOCKED_TIMEZONE: {
    id: 'NO_UNLOCKED_TIMEZONE',
    domain: 'architecture',
    canonicalId: 'STD-ARCH-011',
    docRef: 'SEM-ARCH-011',
    severity: 'WARNING',
    description: 'Khóa cứng múi giờ Việt Nam Asia/Ho_Chi_Minh (UTC+7) trên toàn bộ tiện ích định dạng ngày giờ.',
    filter: (rel) =>
      (rel.endsWith('.ts') || rel.endsWith('.tsx')) &&
      !rel.endsWith('src/utils/date.ts') &&
      !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_UNLOCKED_TIMEZONE')) return false
      if (/\.toLocale(?:Date|Time)?String\(\s*\)/.test(line)) {
        return 'Gọi .toLocaleDateString() không tham số; bắt buộc chỉ định timezone Asia/Ho_Chi_Minh'
      }
      if (/new\s+Date\(\)\.toISOString\(\)\.(?:slice|split)/.test(line)) {
        return 'Dùng new Date().toISOString().slice/split lấy ngày cục bộ sẽ bị lệch múi giờ UTC+7; hãy dùng toDateInput() từ @/utils/date'
      }
      return false
    },
    message: 'Xử lý ngày giờ thiếu khóa múi giờ Asia/Ho_Chi_Minh (UTC+7)',
  },

  NO_FRAGMENTED_CALCULATORS: {
    id: 'NO_FRAGMENTED_CALCULATORS',
    domain: 'architecture',
    canonicalId: 'STD-ARCH-012',
    docRef: 'SEM-ARCH-012',
    severity: 'WARNING',
    description: 'Ngăn chặn phân tán logic tính toán gói tập/ca trực rải rác ngoài UI components (Business Logic Drift).',
    filter: (rel) =>
      (rel.startsWith('src/pages/') || rel.startsWith('src/components/')) &&
      !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_FRAGMENTED_CALCULATORS')) return false
      return /new\s+Date\([^)]*(?:endDate|expiresAt|expiryDate)[^)]*\)\.getTime\(\)\s*<\s*(?:Date\.now\(\)|new\s+Date\(\)\.getTime\(\))/.test(line)
    },
    message: 'Tự tính toán hạn dùng gói tập ad-hoc trên UI; bắt buộc sử dụng domain calculator hasActiveSubscription từ @/utils/subscription',
  },
}
