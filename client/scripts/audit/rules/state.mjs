/**
 * @fileoverview Domain: state (STD-ASYNC-001 / SEM-STATE-001..009)
 */

import path from 'node:path'
import { isTestFile, isInsideUseEffect } from '../lib/files.mjs'

export const rules = {
  NO_EFFECT_FETCH: {
    id: 'NO_EFFECT_FETCH',
    domain: 'state',
    canonicalId: 'STD-ASYNC-001',
    docRef: 'SEM-STATE-001',
    severity: 'WARNING',
    description: 'Cấm gọi API (fetch, axios, api, Service) trực tiếp trong useEffect thay vì dùng TanStack Query.',
    filter: (rel) => (rel.endsWith('.tsx') || rel.endsWith('.ts')) && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_EFFECT_FETCH')) return false
      const isApiCall = /(?:fetch\(|axios\.(?:get|post|put|patch|delete)\(|api\.(?:get|post|put|patch|delete)\(|Service\.\w+\()/.test(line)
      if (isApiCall) {
        return isInsideUseEffect(lines, idx)
      }
      return false
    },
    message: 'Gọi API trực tiếp bên trong useEffect thay vì dùng TanStack Query v5',
  },

  NO_SERVER_STATE_IN_ZUSTAND: {
    id: 'NO_SERVER_STATE_IN_ZUSTAND',
    domain: 'state',
    canonicalId: 'STD-STATE-002',
    docRef: 'SEM-STATE-002',
    severity: 'ERROR',
    description: 'Cấm sao chép dữ liệu server (danh sách thực thể từ API) vào Zustand Store.',
    filter: (rel) =>
      rel.endsWith('.ts') &&
      rel.startsWith('src/stores/') &&
      !rel.endsWith('authStore.ts') &&
      !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_SERVER_STATE_IN_ZUSTAND')) return false
      const hasEntityArray = /\b(?:packages|members|attendanceLogs|sessions|workouts|subscriptions|invoices)\s*:\s*\[/.test(line)
      const hasFetchAction = /\b(?:fetchPackages|getMembers|loadAttendance|fetchSessions|loadSubscriptions)\b/.test(line)
      return hasEntityArray || hasFetchAction
    },
    message: 'Lưu mảng dữ liệu server hoặc tự viết hàm fetch trong Zustand store thay vì dùng TanStack Query v5',
  },

  NO_GLOBAL_LOCAL_STATE: {
    id: 'NO_GLOBAL_LOCAL_STATE',
    domain: 'state',
    canonicalId: 'STD-STATE-003',
    docRef: 'SEM-STATE-003',
    severity: 'WARNING',
    description: 'Cấm đưa trạng thái UI cục bộ vào store toàn cục gây re-render cascades.',
    filter: (rel) =>
      rel.endsWith('.ts') &&
      rel.startsWith('src/stores/') &&
      !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_GLOBAL_LOCAL_STATE')) return false
      return /\b(?:isModalOpen|isDialogOpen|isDrawerOpen|searchQuery|activeTab|filterTerm)\s*:/.test(line)
    },
    message: 'Đưa trạng thái UI cục bộ (modal/tab/search) vào Zustand store toàn cục thay vì useState/useSearchParams',
  },

  NO_UNREGISTERED_LOGOUT_CLEANUP: {
    id: 'NO_UNREGISTERED_LOGOUT_CLEANUP',
    domain: 'state',
    canonicalId: 'STD-STATE-004',
    docRef: 'SEM-STATE-004',
    severity: 'WARNING',
    description: 'Store lưu giữ thông tin người dùng hoặc WebSocket bắt buộc phải đăng ký giải phóng qua onLogout.',
    filter: (rel) =>
      rel.endsWith('.ts') &&
      rel.startsWith('src/stores/') &&
      !rel.endsWith('authStore.ts') &&
      !rel.endsWith('themeStore.ts') &&
      !rel.endsWith('feature-flag.store.ts') &&
      !isTestFile(rel),
    checkFile: (content, rel, lines, isExempt) => {
      if (isExempt('NO_UNREGISTERED_LOGOUT_CLEANUP')) return []
      const hasSessionOrSocket = /\b(?:socket|WebSocket|token|memberId|currentUser)\b/i.test(content)
      if (!hasSessionOrSocket) return []
      const hasLogoutListener = /\bonLogout\s*\(/.test(content)
      if (!hasLogoutListener) {
        return [
          {
            line: 1,
            text: `Store "${path.basename(rel)}" lưu giữ phiên/kết nối nhưng chưa đăng ký callback dọn dẹp với onLogout`,
          },
        ]
      }
      return []
    },
    message: 'Store lưu giữ phiên/kết nối nhưng chưa đăng ký callback dọn dẹp với onLogout',
  },

  NO_BULK_STORE_DESTRUCTURING: {
    id: 'NO_BULK_STORE_DESTRUCTURING',
    domain: 'state',
    canonicalId: 'STD-STATE-005',
    docRef: 'SEM-STATE-005',
    severity: 'WARNING',
    description: 'Cấm gọi store không truyền selector (bulk destructuring): const { a, b } = use*Store().',
    filter: (rel) =>
      (rel.endsWith('.tsx') || rel.endsWith('.ts')) &&
      !isTestFile(rel) &&
      !rel.startsWith('src/stores/'),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_BULK_STORE_DESTRUCTURING')) return false
      return /const\s*\{[^}]+\}\s*=\s*use\w+Store\s*\(\s*\)/.test(line)
    },
    message: 'Destructure toàn bộ store const { ... } = useStore() gây re-render thừa; dùng Atomic Selector hoặc useShallow',
  },

  NO_UNVALIDATED_LOCALSTORAGE: {
    id: 'NO_UNVALIDATED_LOCALSTORAGE',
    domain: 'state',
    canonicalId: 'STD-STATE-006',
    docRef: 'SEM-STATE-006',
    severity: 'WARNING',
    description: 'Cấm đọc JSON.parse từ storage mà thiếu cơ chế bẫy lỗi hoặc Zod schema validator.',
    filter: (rel) => (rel.endsWith('.ts') || rel.endsWith('.tsx')) && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_UNVALIDATED_LOCALSTORAGE')) return false
      return /JSON\.parse\s*\(\s*(?:localStorage|sessionStorage)\.getItem/.test(line)
    },
    message: 'Gọi JSON.parse(localStorage.getItem(...)) trần trụi thiếu try/catch hoặc Zod schema, có thể gây crash ứng dụng',
  },

  NO_EFFECT_DERIVED_STATE: {
    id: 'NO_EFFECT_DERIVED_STATE',
    domain: 'state',
    canonicalId: 'STD-STATE-007',
    docRef: 'SEM-STATE-007',
    severity: 'WARNING',
    description: 'Cấm dùng useEffect chỉ để setState tính toán derived state (Double Render Cycle).',
    filter: (rel) => (rel.endsWith('.tsx') || rel.endsWith('.ts')) && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_EFFECT_DERIVED_STATE')) return false
      const trimmed = line.trim()
      if (/^set[A-Z]\w*\(/.test(trimmed) && isInsideUseEffect(lines, idx)) {
        const before = lines.slice(Math.max(0, idx - 15), idx + 1).join('\n')
        const after = lines.slice(idx, Math.min(lines.length, idx + 10)).join('\n')
        const context = before + '\n' + after
        if (!/(?:fetch|axios|api|Service|setTimeout|setInterval|addEventListener|return\s*\(\)\s*=>)/.test(context)) {
          return true
        }
      }
      return false
    },
    message: 'useEffect chỉ chứa duy nhất lệnh setState tính toán derived state (Double Render Cycle); hãy tính trực tiếp trong render body',
  },

  NO_EFFECT_EVENT_HANDLING: {
    id: 'NO_EFFECT_EVENT_HANDLING',
    domain: 'state',
    canonicalId: 'STD-STATE-008',
    docRef: 'SEM-STATE-008',
    severity: 'WARNING',
    description: 'Cấm xử lý hành động người dùng (submit/action) gián tiếp qua cờ boolean trong useEffect.',
    filter: (rel) => (rel.endsWith('.tsx') || rel.endsWith('.ts')) && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_EFFECT_EVENT_HANDLING')) return false
      if (isInsideUseEffect(lines, idx)) {
        return /if\s*\(\s*(?:isSubmitted|isClicked|isConfirmed|triggerSubmit|hasTriggered)\s*\)\s*\{?[^}]*(?:mutate|submit|navigate)\(/.test(line)
      }
      return false
    },
    message: 'Xử lý hành động người dùng (submit/action) gián tiếp qua cờ boolean trong useEffect; hãy gọi trực tiếp tại event handler',
  },

  NO_LEAKING_EVENT_LISTENERS: {
    id: 'NO_LEAKING_EVENT_LISTENERS',
    domain: 'state',
    canonicalId: 'STD-STATE-009',
    docRef: 'SEM-STATE-009',
    severity: 'ERROR',
    description: 'Ngăn chặn rò rỉ bộ nhớ (Memory Leak) và giật lag cuộn trang do ghost event listeners.',
    filter: (rel) => (rel.endsWith('.tsx') || rel.endsWith('.ts')) && !isTestFile(rel),
    checkFile: (content, rel, lines, isExempt) => {
      if (isExempt('NO_LEAKING_EVENT_LISTENERS')) return []
      const violations = []
      const hasAddListener = content.includes('addEventListener')
      if (!hasAddListener) return []

      const hasRemoveListener = content.includes('removeEventListener')
      if (!hasRemoveListener) {
        const lineIdx = lines.findIndex((l) => l.includes('addEventListener'))
        violations.push({
          line: lineIdx !== -1 ? lineIdx + 1 : 1,
          text: `File "${path.basename(rel)}" đăng ký addEventListener nhưng thiếu removeEventListener ở cleanup function (Memory Leak)`,
        })
      }

      lines.forEach((l, i) => {
        if (/addEventListener\s*\(\s*['"](?:scroll|resize)['"]/.test(l)) {
          const block = lines.slice(i, Math.min(lines.length, i + 3)).join(' ')
          if (!/passive\s*:\s*true/.test(block)) {
            violations.push({
              line: i + 1,
              text: `addEventListener sự kiện scroll/resize thiếu tùy chọn { passive: true } gây cản trở cuộn trang`,
            })
          }
        }
      })

      return violations
    },
    message: 'addEventListener thiếu cleanup removeEventListener hoặc thiếu { passive: true }',
  },
}
