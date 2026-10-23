/**
 * @fileoverview Domain: forms (A11Y-006 / SEM-A11Y-007)
 */

import { isTestFile, getTagBlock } from '../lib/files.mjs'

export const rules = {
  FORMS_LABEL_ASSOC: {
    id: 'FORMS_LABEL_ASSOC',
    domain: 'forms',
    canonicalId: 'A11Y-006',
    docRef: 'SEM-A11Y-007',
    severity: 'WARNING',
    description: 'Trường nhập liệu (Input/Select/Textarea) đứng độc lập ngoài FormField bắt buộc có aria-label/labelledby/id.',
    filter: (rel) =>
      rel.endsWith('.tsx') &&
      !isTestFile(rel) &&
      !rel.startsWith('src/components/ui/'),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('FORMS_LABEL_ASSOC')) return null
      // Bắt các control Form: Input, Select, Textarea hoặc input, select, textarea
      if (/<(?:Input|Select|Textarea|input|select|textarea)\b/.test(line)) {
        // Bỏ qua input type hidden hoặc checkbox/radio nếu có label bọc
        if (/type=["']hidden["']/.test(line)) return null

        const block = getTagBlock(lines, idx, 6)
        const hasAriaLabel = /aria-label(?:ledby)?\s*=/i.test(block)
        const hasId = /\bid\s*=/i.test(block)

        if (!hasAriaLabel && !hasId) {
          return 'Trường nhập liệu đứng độc lập thiếu nhãn liên kết (cần aria-label, aria-labelledby hoặc id liên kết thẻ <label>)'
        }
      }
      return null
    },
    message: 'Trường nhập liệu biểu mẫu thiếu nhãn liên kết trợ năng',
  },

  NO_UNCONTROLLED_TO_CONTROLLED_DRIFT: {
    id: 'NO_UNCONTROLLED_TO_CONTROLLED_DRIFT',
    domain: 'forms',
    canonicalId: 'STD-FORM-002',
    docRef: 'SEM-FORM-002',
    severity: 'WARNING',
    description: 'Cấm truyền value={data?.field} vào input mà thiếu fallback ?? "" hoặc || "".',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_UNCONTROLLED_TO_CONTROLLED_DRIFT')) return null
      if (/<(?:Input|Textarea|input|textarea)\b/.test(line) || /value=\{/.test(line)) {
        const block = getTagBlock(lines, idx, 6)
        if (/value=\{\s*[\w.]+\?\.\w+\s*\}/.test(block)) {
          return 'Truyền value={...?.field} vào input thiếu fallback ?? "" hoặc || "" gây Uncontrolled to Controlled drift'
        }
      }
      return null
    },
    message: 'Input nhận value={...?.field} thiếu fallback ?? "" gây Uncontrolled to Controlled drift',
  },
}
