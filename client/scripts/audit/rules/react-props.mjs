/**
 * @fileoverview Domain: react-props (STD-REF-001, SEM-PROPS-011..013)
 */

import path from 'node:path'
import { isTestFile } from '../lib/files.mjs'

export const rules = {
  FORWARD_REF_NAME: {
    id: 'FORWARD_REF_NAME',
    domain: 'react-props',
    canonicalId: 'STD-REF-001',
    docRef: 'SEM-PROPS-010',
    severity: 'ERROR',
    description: 'Component sử dụng forwardRef bắt buộc phải gán displayName.',
    filter: (rel) =>
      (rel.endsWith('.tsx') || rel.endsWith('.ts')) &&
      rel.startsWith('src/components/') &&
      !isTestFile(rel),
    checkFile: (content, rel, lines, isExempt) => {
      if (isExempt('FORWARD_REF_NAME')) return []
      const violations = []
      const namedMatches = [...content.matchAll(/(?:const|let|var)\s+([A-Z]\w*)\s*=\s*(?:React\.)?forwardRef/g)]
      const checkedNames = new Set()

      for (const match of namedMatches) {
        const compName = match[1]
        checkedNames.add(compName)
        const hasDisplayName = new RegExp(String.raw`\b${compName}\.displayName\s*=`).test(content)
        if (!hasDisplayName) {
          const lineIdx = lines.findIndex((l) => l.includes(match[0]))
          violations.push({
            line: lineIdx !== -1 ? lineIdx + 1 : 1,
            text: `Component "${compName}" trong ${path.basename(rel)} dùng forwardRef nhưng thiếu ${compName}.displayName`,
          })
        }
      }

      if (checkedNames.size === 0 && (content.includes('forwardRef<') || content.includes('forwardRef('))) {
        if (!content.includes('.displayName =') && !content.includes('.displayName=')) {
          violations.push({
            line: 1,
            text: `${path.basename(rel)} dùng forwardRef nhưng thiếu displayName`,
          })
        }
      }

      return violations
    },
    message: 'Component dùng forwardRef nhưng thiếu thuộc tính displayName',
  },

  NO_UNSTABLE_KEY: {
    id: 'NO_UNSTABLE_KEY',
    domain: 'react-props',
    canonicalId: 'SEM-PROPS-011',
    docRef: 'SEM-PROPS-011',
    severity: 'WARNING',
    description: 'Cấm dùng key={index} hoặc key={i} hoặc key={`${index}`} không ổn định trong JSX.',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_UNSTABLE_KEY')) return false
      return /key=\{[^}]*(?<![\w.])(?:index|idx|\bi\b|itemIndex)[^}]*\}/.test(line)
    },
    message: 'Sử dụng key không ổn định (chứa index/idx/i) trong danh sách động JSX',
  },

  NO_FALSY_LEAKAGE: {
    id: 'NO_FALSY_LEAKAGE',
    domain: 'react-props',
    canonicalId: 'SEM-PROPS-012',
    docRef: 'SEM-PROPS-012',
    severity: 'WARNING',
    description: 'Cấm conditional rendering dạng items.length && <Component /> gây rò rỉ ký tự số 0.',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_FALSY_LEAKAGE')) return false
      if (/^\s*(?:if|while|for)\b/.test(line)) return false
      return /(?<![><!=])\b\w+\.length\s*&&(?!&)/.test(line)
    },
    message: 'Sử dụng .length && trong JSX có thể render ký tự số "0". Dùng .length > 0 ? ... : null hoặc Boolean(.length) &&',
  },

  NO_RAW_SVG_IN_JSX: {
    id: 'NO_RAW_SVG_IN_JSX',
    domain: 'react-props',
    canonicalId: 'SEM-PROPS-013',
    docRef: 'SEM-PROPS-013',
    severity: 'WARNING',
    description: 'Cấm nhúng raw thẻ <svg> trực tiếp trên page; dùng primitive <Icon> hoặc lucide-react.',
    filter: (rel) =>
      rel.endsWith('.tsx') &&
      !isTestFile(rel) &&
      !rel.startsWith('src/components/ui/') &&
      !rel.startsWith('src/components/shared/'),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_RAW_SVG_IN_JSX')) return false
      return /<svg\b/.test(line)
    },
    message: 'Nhúng thẻ <svg> raw trực tiếp trên page. Bắt buộc dùng icon từ lucide-react hoặc UI primitive <Icon>.',
  },

  PROPS_NO_COLOR_PROP: {
    id: 'PROPS_NO_COLOR_PROP',
    domain: 'react-props',
    canonicalId: 'SEM-PROPS-002',
    docRef: 'SEM-PROPS-002',
    severity: 'ERROR',
    description: 'Cấm prop nhận mã màu tự do (color, bgColor, textColor, bg) kiểu string/HEX trên UI components.',
    filter: (rel) =>
      rel.endsWith('.tsx') &&
      rel.startsWith('src/components/ui/') &&
      !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('PROPS_NO_COLOR_PROP')) return false
      // Kiểm tra khai báo interface / type props: color?: string, bgColor: string, etc.
      return /\b(?:color|bgColor|textColor|bg)\s*\??:\s*(?:string|['"]#[\da-f]+['"])/i.test(line)
    },
    message: 'Định nghĩa prop nhận mã màu tự do (color/bgColor/textColor/bg) thay vì sử dụng tone semantic enum',
  },

  PROPS_TONE_ENUM: {
    id: 'PROPS_TONE_ENUM',
    domain: 'react-props',
    canonicalId: 'SEM-PROPS-003',
    docRef: 'SEM-PROPS-003',
    severity: 'ERROR',
    description: 'Bắt buộc prop tone tuân theo chuẩn {success, warning, danger, info, neutral, accent} (cấm error).',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('PROPS_TONE_ENUM')) return false
      // Bắt truyền tone="error" hoặc tone={'error'}
      if (/\btone\s*=\s*['"]error['"]|\btone\s*=\s*\{\s*['"]error['"]\s*\}/.test(line)) {
        return true
      }
      // Bắt type định nghĩa tone có chứa 'error'
      if (/\btone\s*\??:\s*[^;,\n'"]*['"]error['"]/.test(line)) {
        return true
      }
      return false
    },
    message: 'Sử dụng giá trị tone không chuẩn (đặc biệt cấm "error"; dùng "danger" thay thế)',
  },

  NO_INLINE_COMPONENT_DEFINITION: {
    id: 'NO_INLINE_COMPONENT_DEFINITION',
    domain: 'react-props',
    canonicalId: 'STD-REACT-007',
    docRef: 'SEM-REACT-007',
    severity: 'ERROR',
    description: 'Cấm định nghĩa component con trong render body của component cha.',
    filter: (rel) =>
      rel.endsWith('.tsx') &&
      (rel.startsWith('src/components/') || rel.startsWith('src/pages/')) &&
      !isTestFile(rel),
    checkFile: (content, rel, lines, isExempt) => {
      if (isExempt('NO_INLINE_COMPONENT_DEFINITION')) return []
      const violations = []
      let depth = 0
      let inParentComponent = false

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const trimmed = line.trim()
        if (trimmed.startsWith('//') || trimmed.startsWith('/*')) continue

        if (depth === 0) {
          if (
            /(?:export\s+(?:default\s+)?)?(?:function\s+[A-Z]\w*|const\s+[A-Z]\w*\s*=\s*(?:React\.)?(?:memo|forwardRef|\([^)]*\)\s*=>))/.test(trimmed)
          ) {
            inParentComponent = true
          }
        } else if (inParentComponent && depth > 0) {
          const isInlineComponent =
            /(?:function\s+([A-Z]\w*)|const\s+([A-Z]\w*)\s*=\s*(?:React\.)?(?:memo|forwardRef|\([^)]*\)\s*=>))/.test(trimmed)
          if (isInlineComponent) {
            const peek = lines.slice(i, Math.min(lines.length, i + 15)).join('\n')
            if (/<[A-Z]\w*|<[a-z]+|\/>|<\//.test(peek)) {
              violations.push({
                line: i + 1,
                text: `Component con định nghĩa bên trong thân component cha (${path.basename(rel)}). Bắt buộc tách ra ngoài module scope.`,
              })
            }
          }
        }

        for (const ch of line) {
          if (ch === '{') depth++
          else if (ch === '}') {
            depth--
            if (depth <= 0) {
              depth = 0
              inParentComponent = false
            }
          }
        }
      }

      return violations
    },
    message: 'Component con được định nghĩa bên trong thân render của component cha',
  },

  NO_ZERO_LEAK_CONDITIONAL_RENDER: {
    id: 'NO_ZERO_LEAK_CONDITIONAL_RENDER',
    domain: 'react-props',
    canonicalId: 'STD-REACT-008',
    docRef: 'SEM-REACT-008',
    severity: 'WARNING',
    description: 'Cấm conditional rendering dạng count && <Component /> hoặc total && gây rò rỉ số 0.',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_ZERO_LEAK_CONDITIONAL_RENDER')) return false
      if (/^\s*(?:if|while|for)\b/.test(line)) return false
      return /(?<![><!=])\b(?:\w+\.)?(?:count|total|amount|score|balance|unreadCount|itemCount)\s*&&(?!&)/i.test(line)
    },
    message: 'Biểu thức số đếm && trong JSX có thể render ký tự số "0". Dùng count > 0 ? ... : null hoặc Boolean(count) &&',
  },

  NO_BYPASS_PORTAL_OVERLAYS: {
    id: 'NO_BYPASS_PORTAL_OVERLAYS',
    domain: 'react-props',
    canonicalId: 'STD-REACT-009',
    docRef: 'SEM-REACT-009',
    severity: 'WARNING',
    description: 'Cấm tự dựng Modal/Dialog/Overlay toàn màn hình mà không kết xuất qua Portal/Modal primitive.',
    filter: (rel) =>
      rel.endsWith('.tsx') &&
      (rel.startsWith('src/pages/') || rel.startsWith('src/components/')) &&
      !rel.startsWith('src/components/ui/overlay/') &&
      !isTestFile(rel),
    checkFile: (content, rel, lines, isExempt) => {
      if (isExempt('NO_BYPASS_PORTAL_OVERLAYS')) return []
      const hasOverlayClass = /\bfixed\s+inset-0\b/.test(content) || /role=["']dialog["']/.test(content)
      if (!hasOverlayClass) return []
      const hasPortalImport = /import\b[^;]*\b(?:Portal|Modal|Dialog|Sheet|Popover)\b[^;]*from\b/.test(content)
      if (!hasPortalImport) {
        const lineIdx = lines.findIndex((l) => /\bfixed\s+inset-0\b/.test(l) || /role=["']dialog["']/.test(l))
        return [
          {
            line: lineIdx !== -1 ? lineIdx + 1 : 1,
            text: `Dựng Overlay/Dialog tự chế (${path.basename(rel)}) mà không kết xuất qua <Portal> hoặc primitive Modal/Dialog`,
          },
        ]
      }
      return []
    },
    message: 'Overlay/Dialog tự chế không kết xuất qua <Portal> gây nguy cơ clipping và sai lệch stacking context',
  },
}
