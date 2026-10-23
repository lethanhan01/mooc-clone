/**
 * @fileoverview Domain: html-semantic (SEM-HTML-001..003)
 */

import { isTestFile, getTagBlock } from '../lib/files.mjs'

export const rules = {
  NO_RAW_INTERACTIVE_ELEMENTS: {
    id: 'NO_RAW_INTERACTIVE_ELEMENTS',
    domain: 'html-semantic',
    canonicalId: 'SEM-HTML-001',
    docRef: 'SEM-HTML-001',
    severity: 'ERROR',
    description: 'Cấm sử dụng trực tiếp <button>, <a>, <form> ngoài thư mục ui/ và shared/.',
    filter: (rel) =>
      rel.endsWith('.tsx') &&
      !rel.startsWith('src/components/ui/') &&
      !rel.startsWith('src/components/shared/') &&
      !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_RAW_INTERACTIVE_ELEMENTS')) return null
      if (/<button(?:\s|>|$)/.test(line)) return 'Dùng thẻ <button> trần thay vì primitive <Button>'
      if (/<form(?:\s|>|$)/.test(line)) return 'Dùng thẻ <form> trần thay vì primitive <Form>'
      if (/<a(?:\s|>|$)/i.test(line)) {
        const tagBlock = getTagBlock(lines, idx)
        if (/href=/i.test(tagBlock)) {
          return 'Dùng thẻ <a href> trần thay vì <ButtonLink> hoặc <ButtonAnchor>'
        }
      }
      return null
    },
    message: 'Sử dụng thẻ tương tác HTML raw thay vì UI primitives',
  },

  NO_NONSEMANTIC_TAGS: {
    id: 'NO_NONSEMANTIC_TAGS',
    domain: 'html-semantic',
    canonicalId: 'SEM-HTML-002',
    docRef: 'SEM-HTML-002',
    severity: 'WARNING',
    description: 'Cấm thẻ <div>, <span>, <b>, <i>, <u> ngoài UI Primitives mà thiếu comment rogym-convention-exempt.',
    filter: (rel) =>
      rel.endsWith('.tsx') &&
      !rel.startsWith('src/components/ui/') &&
      !rel.startsWith('src/components/shared/') &&
      !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_NONSEMANTIC_TAGS')) return false
      return /<(?:div|span|b|i|u)[\s>]/.test(line)
    },
    message: 'Thẻ non-semantic (div/span/b/i/u) thiếu comment chú thích {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [lý do] */}',
  },

  SEMANTIC_CLICK: {
    id: 'SEMANTIC_CLICK',
    domain: 'html-semantic',
    canonicalId: 'SEM-HTML-003',
    docRef: 'SEM-HTML-003',
    severity: 'WARNING',
    description: 'Thẻ non-interactive có onClick bắt buộc phải có ARIA role tương ứng.',
    filter: (rel) =>
      rel.endsWith('.tsx') &&
      !rel.startsWith('src/components/ui/') &&
      !rel.startsWith('src/components/shared/') &&
      !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('SEMANTIC_CLICK')) return false
      if (/<(?:div|span|p|article|section|li)(?:\s|>|$)/i.test(line)) {
        const tagBlock = getTagBlock(lines, idx, 10)
        if (/onClick=/i.test(tagBlock) && !/role=["'][a-z]+["']/i.test(tagBlock)) {
          return true
        }
      }
      return false
    },
    message: 'Thẻ non-interactive có onClick nhưng thiếu ARIA role (role="button" / role="tab")',
  },

  NO_RAW_TABLE_ELEMENTS: {
    id: 'NO_RAW_TABLE_ELEMENTS',
    domain: 'html-semantic',
    canonicalId: 'SEM-HTML-004',
    docRef: 'SEM-HTML-004',
    severity: 'ERROR',
    description: 'Cấm sử dụng trực tiếp <table>, <thead>, <tbody>, <tr>, <th>, <td> ngoài ui/ và shared/.',
    filter: (rel) =>
      rel.endsWith('.tsx') &&
      !rel.startsWith('src/components/ui/') &&
      !rel.startsWith('src/components/shared/') &&
      !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_RAW_TABLE_ELEMENTS')) return null
      if (/<(?:table|thead|tbody|tfoot|tr|th|td)(?:\s|>|\/|$)/.test(line)) {
        return 'Dùng thẻ bảng HTML raw thay vì UI primitive <Table>, <TableHeader>, <TableRow>, <TableCell>'
      }
      return null
    },
    message: 'Sử dụng thẻ Table HTML raw thay vì UI primitives',
  },

  NO_RAW_FORM_ELEMENTS: {
    id: 'NO_RAW_FORM_ELEMENTS',
    domain: 'html-semantic',
    canonicalId: 'SEM-HTML-005',
    docRef: 'SEM-HTML-005',
    severity: 'ERROR',
    description: 'Cấm sử dụng trực tiếp <input>, <textarea>, <select>, <option> ngoài ui/ và shared/.',
    filter: (rel) =>
      rel.endsWith('.tsx') &&
      !rel.startsWith('src/components/ui/') &&
      !rel.startsWith('src/components/shared/') &&
      !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_RAW_FORM_ELEMENTS')) return null
      if (/<(?:input|textarea|select|option)(?:\s|>|\/|$)/.test(line)) {
        return 'Dùng thẻ Form control HTML raw thay vì UI primitive <Input>, <Textarea>, <Select>, <NumberInput>, <SelectItem>'
      }
      return null
    },
    message: 'Sử dụng thẻ Form control HTML raw thay vì UI primitives',
  },

  NO_RAW_MEDIA_ELEMENTS: {
    id: 'NO_RAW_MEDIA_ELEMENTS',
    domain: 'html-semantic',
    canonicalId: 'SEM-HTML-006',
    docRef: 'SEM-HTML-006',
    severity: 'ERROR',
    description: 'Cấm sử dụng trực tiếp thẻ <img> ngoài ui/ và shared/. Dùng primitive <Image> hoặc <Avatar>.',
    filter: (rel) =>
      rel.endsWith('.tsx') &&
      !rel.startsWith('src/components/ui/') &&
      !rel.startsWith('src/components/shared/') &&
      !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_RAW_MEDIA_ELEMENTS')) return null
      if (/<img(?:\s|>|\/|$)/i.test(line)) {
        return 'Dùng thẻ <img /> HTML raw thay vì UI primitive <Image> hoặc <Avatar>'
      }
      return null
    },
    message: 'Sử dụng thẻ Media HTML raw thay vì UI primitive <Image> hoặc <Avatar>',
  },

  NO_BUTTON_ABUSE: {
    id: 'NO_BUTTON_ABUSE',
    domain: 'html-semantic',
    canonicalId: 'SEM-HTML-007',
    docRef: 'SEM-HTML-007',
    severity: 'WARNING',
    description: 'Cấm lạm dụng nút bấm: dùng Button thay link navigate, dàn trải >= 3 nút trên hàng bảng, >= 2 Primary CTA trong cùng Card/form, hoặc lồng nút trong container click.',
    filter: (rel) =>
      rel.endsWith('.tsx') &&
      !rel.startsWith('src/components/ui/') &&
      !rel.startsWith('src/components/shared/') &&
      !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_BUTTON_ABUSE')) return null
      if (/<Button\b/.test(line)) {
        const block = getTagBlock(lines, idx, 10)
        // 1. Button onClick navigate (trừ navigate(-1))
        if (
          /onClick=\{[^}]*\bnavigate\s*\(\s*(?!-1\b)/.test(block) ||
          /onClick=\{(?:\([^)]*\)|e)\s*=>\s*navigate\s*\(\s*(?!-1\b)/.test(block)
        ) {
          return 'Dùng primitive <Button> gọi navigate() thay vì <ButtonLink to="..."> hoặc <BackButton>'
        }
        // 2. Button lồng container có onClick ở 10 dòng trước đó
        const prevBlock = lines.slice(Math.max(0, idx - 10), idx).join('\n')
        if (
          /<(?:div|span|article|section)[^>]*onClick=[^>]*>/.test(prevBlock) &&
          !/<\/(?:div|span|article|section)>/.test(prevBlock)
        ) {
          return 'Lồng primitive <Button> trực tiếp bên trong container có sự kiện onClick'
        }
        // 3. >= 3 Button trong cùng 1 khối hàng bảng
        const surroundingTr = lines.slice(Math.max(0, idx - 15), Math.min(lines.length, idx + 15)).join('\n')
        const rowMatch = surroundingTr.match(/<(?:tr|TableRow|MemberTableRow)\b[\s\S]*?<\/(?:tr|TableRow|MemberTableRow)>/i)
        if (rowMatch) {
          const buttonCount = (rowMatch[0].match(/<Button\b/g) || []).length
          if (buttonCount >= 3) {
            return 'Dàn trải >= 3 nút bấm trên cùng một hàng bảng; nên nhóm các hành động phụ vào <DropdownMenu>'
          }
        }
        // 4. >= 2 Primary CTA trong cùng Card hoặc form
        const isPrimary = /(?:variant|tone)=["']primary["']|btn-primary/.test(block)
        if (isPrimary) {
          const surroundingCard = lines.slice(Math.max(0, idx - 20), Math.min(lines.length, idx + 20)).join('\n')
          const cardMatch = surroundingCard.match(/<(?:Card|form)\b[\s\S]*?<\/(?:Card|form)>/i)
          if (cardMatch) {
            const primaryCount = (cardMatch[0].match(/(?:variant|tone)=["']primary["']|btn-primary/g) || []).length
            if (primaryCount >= 2) {
              return 'Xuất hiện >= 2 Primary CTA trong cùng một khối Card/Form; chỉ cho phép 1 Primary duy nhất'
            }
          }
        }
      }
      return null
    },
    message: 'Lạm dụng Button (navigate link / lồng click container / dàn trải hàng bảng / đa Primary CTA)',
  },

  NO_REDUNDANT_BORDER_PADDING: {
    id: 'NO_REDUNDANT_BORDER_PADDING',
    domain: 'html-semantic',
    canonicalId: 'SEM-HTML-008',
    docRef: 'SEM-HTML-008',
    severity: 'WARNING',
    description: 'Cấm thẻ <div> tự style dạng card thủ công (Box-in-Box) thay vì dùng primitive <Card as="...">.',
    filter: (rel) =>
      rel.endsWith('.tsx') &&
      !rel.startsWith('src/components/ui/') &&
      !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_REDUNDANT_BORDER_PADDING')) return null
      if (/<div\b/.test(line)) {
        const block = getTagBlock(lines, idx, 6)
        const hasRounded = /\brounded(?:-[a-z0-9]+)?\b/.test(block)
        const hasBorder = /\bborder(?:-[a-z0-9-]+)?\b/.test(block)
        const hasPadding = /\bp[xytblr]?-(?:[1-9]|1[0-2])\b/.test(block)
        const hasCardBg = /\bbg-(?:surface-card|card)\b/.test(block)
        if (hasRounded && hasBorder && hasPadding && hasCardBg) {
          return 'Thẻ <div> tự style card thủ công (rounded, border, padding, bg-card); dùng primitive <Card as="..."> thay thế'
        }
      }
      return null
    },
    message: 'Thẻ <div> tự style dạng card thủ công (Box-in-Box) thay vì dùng primitive <Card as="...">',
  },
}

