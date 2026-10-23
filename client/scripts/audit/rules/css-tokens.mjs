/**
 * @fileoverview Domain: css-tokens (SEM-TOKEN-001..003, 010, 011)
 */

import { isTestFile } from '../lib/files.mjs'

const RAW_TAILWIND_COLORS = new Set([
  'red', 'green', 'blue', 'amber', 'emerald', 'rose', 'purple', 'teal', 'cyan',
  'sky', 'indigo', 'violet', 'fuchsia', 'pink', 'yellow', 'orange', 'slate',
  'gray', 'zinc', 'neutral', 'stone',
])

export const rules = {
  HEX_COLOR_ONLY_IN_CSS: {
    id: 'HEX_COLOR_ONLY_IN_CSS',
    domain: 'css-tokens',
    canonicalId: 'SEM-TOKEN-001',
    docRef: 'SEM-TOKEN-001',
    severity: 'ERROR',
    description: '100% thuộc tính màu sắc trong CSS phải dùng mã HEX (6 hoặc 8 ký tự). Cho phép color-mix tại semantic tokens.',
    filter: (rel) => rel.endsWith('.css') && rel.startsWith('src/styles/'),
    checkLine: (line, idx, lines, isExempt, rel) => {
      if (isExempt('HEX_COLOR_ONLY_IN_CSS')) return false
      if (line.includes('❌') || line.includes("Don't") || line.includes('CẤM')) return false

      const isSemanticTokensFile =
        rel === 'src/styles/tokens/semantic.css' ||
        rel?.startsWith('src/styles/tokens/semantic')

      if (isSemanticTokensFile) {
        // Trong semantic tokens: cho phép color-mix(in srgb, ...) và var()
        // Cấm tuyệt đối rgb/rgba/hsl/hsla và shorthand 3-digit HEX
        return /rgba?\(|hsla?\(|#[0-9a-fA-F]{3}(?![0-9a-fA-F])/.test(line)
      }

      // Mọi file CSS khác (kể cả primitive.css): cấm tuyệt đối rgb/rgba/hsl/hsla/color-mix và shorthand 3-digit HEX
      return /rgba?\(|hsla?\(|color-mix\(|#[0-9a-fA-F]{3}(?![0-9a-fA-F])/.test(line)
    },
    message: 'Chứa màu không đúng chuẩn 6 hoặc 8 ký tự HEX trong CSS (cấm rgb/rgba/hsl/hsla/color-mix và shorthand 3-digit; chỉ cho phép color-mix tại semantic tokens)',
  },

  NO_RAW_COLORS_IN_JSX: {
    id: 'NO_RAW_COLORS_IN_JSX',
    domain: 'css-tokens',
    canonicalId: 'SEM-TOKEN-002',
    docRef: 'SEM-TOKEN-002',
    severity: 'ERROR',
    description: 'Cấm hardcode mã màu thô (HEX, RGB, RGBA, HSL) trong JSX/TSX (Tailwind arbitrary, style, props).',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_RAW_COLORS_IN_JSX')) return false
      // 1. Tailwind arbitrary classes with raw colors: bg-[#...], text-[rgb(...)], border-[rgba(...)]
      if (/\b[a-z]+-\[(?:#[0-9a-f]{3,8}|(?:rgb|hsl)a?\()[^\]]*\]/i.test(line)) {
        return true
      }
      // 2. Inline style with raw color: color: '#...', backgroundColor: 'rgb(...)'
      if (/style=\{\{[^}]*(?:color|background|border|fill|stroke):\s*['"`](?:#[0-9a-f]{3,8}|(?:rgb|hsl)a?\()/i.test(line)) {
        return true
      }
      // 3. Raw color props on elements: fill="#...", stroke="rgba(...)" (trừ token imports)
      if (/(?:fill|stroke|color)=["'](?:#[0-9a-f]{3,8}|(?:rgb|hsl)a?\()["']/i.test(line)) {
        return true
      }
      return false
    },
    message: 'Hardcode mã màu thô (HEX/RGB/RGBA/HSL) trong JSX. Bắt buộc dùng semantic tokens (bg-card, text-primary) hoặc TOKEN_COLORS.',
  },

  NO_INLINE_STYLE: {
    id: 'NO_INLINE_STYLE',
    domain: 'css-tokens',
    canonicalId: 'SEM-TOKEN-003',
    docRef: 'SEM-TOKEN-003',
    severity: 'WARNING',
    description: 'Cấm style={{...}} inline trong JSX (ngoại trừ CSS variable tone hoặc exception).',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_INLINE_STYLE')) return false
      if (line.includes('--rogym-tone')) return false

      if (/style=\{\s*\{/.test(line)) {
        return true
      }
      const trimmed = line.trim()
      if (trimmed.endsWith('style={')) {
        const nextLine = idx + 1 < lines.length ? lines[idx + 1].trim() : ''
        if (nextLine.startsWith('{') && !nextLine.includes('--rogym-tone')) {
          return true
        }
      }
      return false
    },
    message: 'Sử dụng style={{...}} inline trong JSX thay vì Tailwind utility classes',
  },

  NO_MAGIC_Z_INDEX: {
    id: 'NO_MAGIC_Z_INDEX',
    domain: 'css-tokens',
    canonicalId: 'SEM-TOKEN-010',
    docRef: 'SEM-TOKEN-010',
    severity: 'WARNING',
    description: 'Cấm dùng magic z-index (z-[9999], z-[100]) tùy tiện; dùng thang 5 tầng z-index chuẩn.',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_MAGIC_Z_INDEX')) return false
      return /z-\[(?:9999|999|1000|\d{3,})\]/.test(line)
    },
    message: 'Sử dụng Magic Z-Index tùy tiện. Bắt buộc dùng thang 5 tầng z-index chuẩn (z-0, z-10, z-20, z-50, z-100).',
  },

  NO_MAGIC_DIMENSIONS: {
    id: 'NO_MAGIC_DIMENSIONS',
    domain: 'css-tokens',
    canonicalId: 'SEM-TOKEN-011',
    docRef: 'SEM-TOKEN-011',
    severity: 'WARNING',
    description: 'Cấm arbitrary pixel dimensions (vd: w-[320px], h-[45px], gap-[12px]) trong Tailwind classes.',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_MAGIC_DIMENSIONS')) return false
      return /(?:^|\s)-?(?:(?:min-|max-)?[wh]|[pm][xytblr]?|gap|top|bottom|left|right)-\[\d+px\]/.test(line)
    },
    message: 'Sử dụng arbitrary pixel dimensions thay vì thang kích thước chuẩn của Tailwind hoặc design tokens',
  },

  NO_COMPONENT_COLOR_TOKEN: {
    id: 'NO_COMPONENT_COLOR_TOKEN',
    domain: 'css-tokens',
    canonicalId: 'SEM-TOKEN-004',
    docRef: 'SEM-TOKEN-004',
    severity: 'WARNING',
    description: 'Cấm khai báo token màu cục bộ --rogym-*: #HEX hoặc bất kỳ biến CSS màu nào ngoài tokens/primitive.css.',
    filter: (rel) =>
      rel.endsWith('.css') &&
      rel.startsWith('src/styles/') &&
      !rel.startsWith('src/styles/tokens/primitive'),
    checkLine: (line, idx, lines, isExempt, rel) => {
      if (isExempt('NO_COMPONENT_COLOR_TOKEN')) return false
      if (rel?.startsWith('src/styles/tokens/primitive')) return false
      if (line.includes('❌') || line.includes("Don't") || line.includes('CẤM')) return false
      if (!line.includes('--') || !line.includes('#')) return false
      const colonIdx = line.indexOf(':')
      if (colonIdx === -1) return false
      const left = line.slice(0, colonIdx)
      const right = line.slice(colonIdx + 1).trim()
      if (!/(?:^|\s)--[\w-]+$/.test(left)) return false
      return /^#[0-9a-fA-F]{3,8}\b/.test(right)
    },
    message: 'Khai báo biến CSS màu (--*: #HEX) cục bộ ngoài tokens/primitive.css',
  },

  NO_PRIMITIVE_IN_COMPONENT: {
    id: 'NO_PRIMITIVE_IN_COMPONENT',
    domain: 'css-tokens',
    canonicalId: 'SEM-TOKEN-005',
    docRef: 'SEM-TOKEN-005',
    severity: 'WARNING',
    description: 'Cấm sử dụng var(--rogym-*) primitive trong components/*.css hoặc class *-rogym-* trong TSX.',
    filter: (rel) =>
      (rel.endsWith('.css') && rel.startsWith('src/styles/components/')) ||
      (rel.endsWith('.tsx') && !isTestFile(rel)),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_PRIMITIVE_IN_COMPONENT')) return false
      // Trong CSS component: cấm var(--rogym-*)
      if (/var\(--rogym-(?:primary|accent|bg|card|border|muted|success|danger|warning|info)/.test(line)) {
        return true
      }
      // Trong JSX: cấm utility class *-rogym-*
      if (/(?:^|[\s"'`])(?:bg|text|border|ring|fill|stroke)-rogym-/.test(line)) {
        return true
      }
      return false
    },
    message: 'Sử dụng trực tiếp primitive token (var(--rogym-*) hoặc *-rogym-*) thay vì semantic token',
  },

  NO_RAW_TAILWIND_PALETTE: {
    id: 'NO_RAW_TAILWIND_PALETTE',
    domain: 'css-tokens',
    canonicalId: 'SEM-TOKEN-006',
    docRef: 'SEM-TOKEN-006',
    severity: 'WARNING',
    description: 'Cấm sử dụng class màu mặc định của Tailwind (bg-red-500, text-green-600...) và bg-white/black trong TSX.',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_RAW_TAILWIND_PALETTE')) return false
      // Bắt palette mặc định của Tailwind (dùng lookahead để không nuốt ký tự phân cách liền kề)
      const matches = line.matchAll(/(?:^|[\s"'`])(?:bg|text|border|ring|fill|stroke)-([a-z]+)(?:-\d{2,3})?(?=[\s"'`]|$)/g)
      for (const m of matches) {
        if (RAW_TAILWIND_COLORS.has(m[1])) return true
      }
      // Bắt bg-white và bg-black tùy tiện
      if (/(?:^|[\s"'`])bg-(?:white|black)(?:[\s"'`]|$)/.test(line)) {
        return true
      }
      return false
    },
    message: 'Sử dụng class bảng màu mặc định Tailwind (bg-red-500, bg-white...) thay vì semantic token (bg-card, text-primary)',
  },

  NO_OPACITY_MODIFIER_ON_PRIMITIVE: {
    id: 'NO_OPACITY_MODIFIER_ON_PRIMITIVE',
    domain: 'css-tokens',
    canonicalId: 'SEM-TOKEN-007',
    docRef: 'SEM-TOKEN-007',
    severity: 'WARNING',
    description: 'Cấm áp dụng opacity modifier của Tailwind (bg-rogym-*/20) trên primitive tokens.',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_OPACITY_MODIFIER_ON_PRIMITIVE')) return false
      return /(?:^|[\s"'`])-?(?:bg|text|border)-rogym-[^/ \t\r\n'"]+\/\d{1,2}(?:[\s"'`]|$)/.test(line)
    },
    message: 'Sử dụng opacity modifier (vd: bg-rogym-*/20) trên primitive token',
  },

  NO_DARK_VARIANT_COLOR: {
    id: 'NO_DARK_VARIANT_COLOR',
    domain: 'css-tokens',
    canonicalId: 'SEM-TOKEN-009',
    docRef: 'SEM-TOKEN-009',
    severity: 'WARNING',
    description: 'Cấm gắn tiện ích màu thủ công đi kèm biến thể dark: (vd: dark:text-white, dark:bg-black).',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_DARK_VARIANT_COLOR')) return false
      return /(?:^|[\s"'`])dark:(?:bg|text|border|ring|fill|stroke)-/.test(line)
    },
    message: 'Gán biến thể màu thủ công dark:... thay vì chuyển đổi đối xứng qua CSS variables',
  },

  NO_ARBITRARY_CLASSES_OR_TOKENS: {
    id: 'NO_ARBITRARY_CLASSES_OR_TOKENS',
    domain: 'css-tokens',
    canonicalId: 'SEM-TOKEN-012',
    docRef: 'SEM-TOKEN-012',
    severity: 'ERROR',
    description: 'Cấm sử dụng class CSS legacy đã giải thể (rogym-text-*, rogym-bg-*, rogym-display, rogym-logo, rogym-body, rogym-muted, rogym-section-title, rogym-brand-text).',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_ARBITRARY_CLASSES_OR_TOKENS')) return false
      return /\brogym-(?:text-(?:primary|secondary|muted|accent|dim|faint|green|green-dark|base)|bg-(?:base|card)|display|logo|body|muted|section-title|brand-text)\b/.test(line)
    },
    message: 'Sử dụng class CSS tùy tiện hoặc class legacy đã bị giải thể. Bắt buộc dùng Semantic Tokens (bg-surface-*, text-fg-*, border-line-*, bg-action-*, status-*) hoặc Primitive Components đã được phê duyệt.',
  },

  NO_DECORATIVE_BORDER_OVERLOAD: {
    id: 'NO_DECORATIVE_BORDER_OVERLOAD',
    domain: 'css-tokens',
    canonicalId: 'SEM-TOKEN-013',
    docRef: 'SEM-TOKEN-013',
    severity: 'WARNING',
    description: 'Cấm sử dụng các viền dày kịt border-2, border-4, border-8 trên các component giao diện thông thường.',
    filter: (rel) =>
      rel.endsWith('.tsx') &&
      !rel.startsWith('src/components/ui/') &&
      !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_DECORATIVE_BORDER_OVERLOAD')) return false
      return /(?:^|[\s"'`])border-(?:2|4|8)(?:[\s"'`]|$)/.test(line)
    },
    message: 'Sử dụng viền dày kịt (border-2 / border-4 / border-8) gây hiệu ứng Prison Grid',
  },

  NO_PADDING_OVERFLOW_DRIFT: {
    id: 'NO_PADDING_OVERFLOW_DRIFT',
    domain: 'css-tokens',
    canonicalId: 'SEM-TOKEN-014',
    docRef: 'SEM-TOKEN-014',
    severity: 'WARNING',
    description: 'Cấm đặt padding quá lớn gây tràn màn hình ngang (Horizontal Overflow) trên LINE Mini App / Mobile viewport.',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_PADDING_OVERFLOW_DRIFT')) return false
      return /(?<![a-z0-9:-])p-(?:8|10|12|14|16|20)\b/.test(line)
    },
    message: 'Đặt padding quá lớn (p-8/p-10/p-12/p-16) thiếu tiền tố responsive gây tràn màn hình trên mobile',
  },
}

