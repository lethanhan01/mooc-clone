/**
 * @fileoverview Domain: a11y (A11Y-004, 008, 005, 007, 010)
 */

import { isTestFile, getTagBlock } from '../lib/files.mjs'

export const rules = {
  A11Y_HEADING_ORDER: {
    id: 'A11Y_HEADING_ORDER',
    domain: 'a11y',
    canonicalId: 'A11Y-004',
    docRef: 'SEM-A11Y-002',
    severity: 'WARNING',
    description: 'Thứ tự cấp bậc heading trên trang: duy nhất 1 thẻ <h1> và không nhảy cóc cấp độ (vd: h1 -> h3).',
    filter: (rel) =>
      rel.endsWith('.tsx') &&
      rel.startsWith('src/pages/') &&
      !isTestFile(rel) &&
      !rel.includes('Modal') &&
      !rel.includes('Dialog'),
    checkFile: (content, rel, lines, isExempt) => {
      if (isExempt('A11Y_HEADING_ORDER')) return []
      const violations = []
      const headingMatches = [...content.matchAll(/<h([1-6])(?:\s|>|$)/gi)]
      if (headingMatches.length === 0) return []

      let h1Count = 0
      let lastLevel = 0

      for (const match of headingMatches) {
        const level = Number.parseInt(match[1], 10)
        const matchedStr = match[0]
        const lineIdx = lines.findIndex((l) => l.includes(matchedStr))
        const lineNum = lineIdx !== -1 ? lineIdx + 1 : 1

        if (level === 1) {
          h1Count++
          if (h1Count > 1) {
            violations.push({
              line: lineNum,
              text: `Trang chứa nhiều hơn 1 thẻ <h1> (${h1Count} thẻ <h1> được tìm thấy)`,
            })
          }
        }

        // Kiểm tra nhảy cóc cấp độ (vd: lastLevel=1, level=3 => nhảy cóc thiếu h2)
        if (lastLevel > 0 && level > lastLevel + 1) {
          violations.push({
            line: lineNum,
            text: `Nhảy cấp bậc heading bất thường từ <h${lastLevel}> sang <h${level}> (thiếu <h${lastLevel + 1}>)`,
          })
        }

        lastLevel = level
      }

      return violations
    },
    message: 'Thứ tự phân cấp thẻ heading trên trang không tuân thủ chuẩn WCAG 2.2',
  },

  A11Y_ICON_BUTTON_LABEL: {
    id: 'A11Y_ICON_BUTTON_LABEL',
    domain: 'a11y',
    canonicalId: 'A11Y-008',
    docRef: 'SEM-A11Y-004',
    severity: 'WARNING',
    description: 'Nút bấm chỉ chứa icon (Icon / IconButton) bắt buộc có aria-label hoặc aria-labelledby.',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('A11Y_ICON_BUTTON_LABEL')) return null
      // Bắt <IconButton ...> thiếu aria-label
      if (/<IconButton\b/i.test(line)) {
        const block = getTagBlock(lines, idx, 6)
        if (!/aria-label(?:ledby)?=/i.test(block)) {
          return 'IconButton thiếu thuộc tính trợ năng aria-label'
        }
      }
      // Bắt <Button ...><Icon ... /></Button> trên 1-2 dòng thiếu aria-label
      if (/<Button\b/i.test(line)) {
        const block = getTagBlock(lines, idx, 5)
        if (/<(?:Icon|[A-Z]\w*Icon)\b/.test(block) && !/aria-label(?:ledby)?=/i.test(block) && !/sr-only/i.test(block)) {
          // Nếu trong block không có text thường hiển thị
          if (!/>\s*[\w\p{L}]+/u.test(block)) {
            return 'Nút bấm chỉ chứa Icon nhưng thiếu thuộc tính aria-label hoặc nhãn sr-only'
          }
        }
      }
      return null
    },
    message: 'Nút bấm icon thiếu nhãn trợ năng aria-label',
  },

  A11Y_IMG_ALT: {
    id: 'A11Y_IMG_ALT',
    domain: 'a11y',
    canonicalId: 'A11Y-005',
    docRef: 'SEM-A11Y-005',
    severity: 'WARNING',
    description: 'Mọi thẻ <img> bắt buộc phải có thuộc tính alt (mô tả hoặc alt="" cho ảnh trang trí).',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('A11Y_IMG_ALT')) return false
      if (/<img\b/i.test(line)) {
        const block = getTagBlock(lines, idx, 6)
        if (!/\balt\s*=/i.test(block)) {
          return true
        }
      }
      return false
    },
    message: 'Thẻ <img> thiếu thuộc tính alt (bắt buộc alt="..." hoặc alt="" cho ảnh trang trí)',
  },

  A11Y_OUTLINE_NONE: {
    id: 'A11Y_OUTLINE_NONE',
    domain: 'a11y',
    canonicalId: 'A11Y-007',
    docRef: 'SEM-A11Y-006',
    severity: 'WARNING',
    description: 'Cấm outline: none hoặc outline-none khi không kèm trạng thái focus-visible:.',
    filter: (rel) => (rel.endsWith('.tsx') || rel.endsWith('.css')) && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('A11Y_OUTLINE_NONE')) return null
      // Trong file JSX/TSX
      if (line.includes('outline-none')) {
        if (!line.includes('focus-visible:')) {
          return 'Sử dụng class "outline-none" mà không có trạng thái "focus-visible:" thay thế'
        }
      }
      // Trong file CSS
      if (/outline\s*:\s*(?:none|0)\b/i.test(line)) {
        if (!line.includes('focus-visible')) {
          return 'Khai báo "outline: none" trong CSS mà không kèm bộ chọn :focus-visible'
        }
      }
      return null
    },
    message: 'Xóa bỏ đường viền focus (outline-none) làm mất khả năng điều hướng bằng bàn phím',
  },

  A11Y_REDUCED_MOTION: {
    id: 'A11Y_REDUCED_MOTION',
    domain: 'a11y',
    canonicalId: 'A11Y-010',
    docRef: 'SEM-A11Y-008',
    severity: 'WARNING',
    description: 'CSS có chứa @keyframes hoặc animation: bắt buộc kèm @media (prefers-reduced-motion).',
    filter: (rel) => rel.endsWith('.css') && rel.startsWith('src/styles/'),
    checkFile: (content, rel, lines, isExempt) => {
      if (isExempt('A11Y_REDUCED_MOTION')) return []
      const hasAnimation = /@keyframes\b|\banimation\s*:\s*[^;\n]+/i.test(content)
      if (hasAnimation) {
        const hasReducedMotion = /@media\s*\(\s*prefers-reduced-motion\b/i.test(content)
        if (!hasReducedMotion) {
          return [
            {
              line: 1,
              text: `Tệp CSS "${rel}" có chứa animation/@keyframes nhưng thiếu truy vấn @media (prefers-reduced-motion)`,
            },
          ]
        }
      }
      return []
    },
    message: 'Hiệu ứng chuyển động trong CSS thiếu hỗ trợ truy vấn prefers-reduced-motion',
  },
}
