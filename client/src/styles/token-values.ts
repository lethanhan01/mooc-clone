/**
 * token-values.ts — Nguồn chân lý giá trị màu CSS variables cho JS consumers (Recharts, Canvas).
 *
 * ⚠️ Giữ đồng bộ với tokens/semantic.css và tokens/compat.css
 * File này cung cấp cả token legacy (@deprecated) lẫn semantic tokens chuẩn hóa
 * cho ngữ cảnh JavaScript / SVG / Canvas.
 */

/**
 * @deprecated Bộ token màu cũ dạng HEX tĩnh. Vui lòng chuyển sang dùng SEMANTIC_TOKEN_COLORS.
 */
export const TOKEN_COLORS = {
  // Brand (@deprecated)
  green: '#06c384', // @deprecated -> --color-action-primary
  greenHover: '#08d891', // @deprecated -> --color-action-primary-hover
  teal: '#42e09e', // @deprecated -> --color-accent
  greenDark: '#00492f', // @deprecated -> --color-action-primary-fg
  greenDeeper: '#003d28', // @deprecated -> --color-action-primary-fg-strong

  // Soft tints (@deprecated)
  greenSoft: '#06c38414', // @deprecated -> --color-action-primary-soft
  greenSoftBorder: '#06c38438', // @deprecated -> --color-action-primary-soft-border
  tealSoft: '#42e09e1f', // @deprecated -> --color-action-accent-soft
  amberSoft: '#f59e0b14', // @deprecated -> --color-status-warning-bg
  amberSoftBorder: '#f59e0b38', // @deprecated -> --color-status-warning-border

  // Backgrounds (@deprecated)
  bgBase: '#080e0b', // @deprecated -> --color-surface-base
  bgDeep: '#030907', // @deprecated -> --color-surface-sunken
  bgDeepAlt: '#040d08', // @deprecated -> --color-surface-sunken-alt
  bgCard: '#0f1c16', // @deprecated -> --color-surface-card
  bgCardHover: '#132218', // @deprecated -> --color-surface-card-hover
  bgCardDarker: '#0b1610', // @deprecated -> --color-surface-card-inset
  bgElevated: '#1a2520', // @deprecated -> --color-surface-elevated
  bgElevatedGreen: '#1a3326', // @deprecated -> --color-surface-elevated-accent
  bgLight: '#ffffff', // @deprecated -> --color-surface-inverse
  bgGlass: '#0c1611d1', // @deprecated -> --color-surface-glass

  // Text (@deprecated)
  textPrimary: '#ffffff', // @deprecated -> --color-fg-primary
  textSecondary: '#bbcabf', // @deprecated -> --color-fg-secondary
  textMuted: '#8ab89c', // @deprecated -> --color-fg-muted
  textDim: '#ffffff73', // @deprecated -> --color-fg-subtle
  textFaint: '#ffffff40', // @deprecated -> --color-fg-disabled
  textOnLight: '#0a0f0e', // @deprecated -> --color-fg-on-inverse
  textOnLightMuted: '#00000080', // @deprecated -> --color-fg-on-inverse-muted
  error: '#ff6b6b', // @deprecated -> --color-status-danger-fg

  // Borders (@deprecated)
  borderSubtle: '#ffffff12', // @deprecated -> --color-line-subtle
  borderSection: '#ffffff0a', // @deprecated -> --color-line-divider
  borderWhiteDim: '#ffffff1a', // @deprecated -> --color-line-default
  borderWhiteButton: '#ffffff73', // @deprecated -> --color-line-strong
  borderWhiteHover: '#ffffff', // @deprecated -> --color-line-hover
  borderTealDim: '#42e09e1a', // @deprecated -> --color-line-accent-subtle
  borderTealHover: '#42e09e66', // @deprecated -> --color-line-accent-hover
} as const

/**
 * @deprecated Alias tương thích ngược cho TOKEN_COLORS
 */
export const ROGYM_THEME_TOKENS = TOKEN_COLORS
export type TokenColorKey = keyof typeof TOKEN_COLORS

/**
 * Hệ thống Semantic Design Tokens chuẩn ngữ nghĩa cho JS consumers (Recharts, Canvas).
 * Sử dụng chuỗi CSS variable var(--color-*) để hỗ trợ tự động đổi màu theo theme Dark/Light.
 */
export const SEMANTIC_TOKEN_COLORS = {
  // Surfaces
  surfaceBase: 'var(--color-surface-base)',
  surfaceSunken: 'var(--color-surface-sunken)',
  surfaceSunkenAlt: 'var(--color-surface-sunken-alt)',
  surfaceCard: 'var(--color-surface-card)',
  surfaceCardHover: 'var(--color-surface-card-hover)',
  surfaceCardInset: 'var(--color-surface-card-inset)',
  surfaceElevated: 'var(--color-surface-elevated)',
  surfaceElevatedAccent: 'var(--color-surface-elevated-accent)',
  surfaceInverse: 'var(--color-surface-inverse)',
  surfaceGlass: 'var(--color-surface-glass)',

  // Foregrounds
  fgPrimary: 'var(--color-fg-primary)',
  fgSecondary: 'var(--color-fg-secondary)',
  fgMuted: 'var(--color-fg-muted)',
  fgSubtle: 'var(--color-fg-subtle)',
  fgDisabled: 'var(--color-fg-disabled)',
  fgOnInverse: 'var(--color-fg-on-inverse)',
  fgOnInverseMuted: 'var(--color-fg-on-inverse-muted)',
  fgOnSolid: 'var(--color-fg-on-solid)',

  // Lines & Borders
  lineSubtle: 'var(--color-line-subtle)',
  lineDivider: 'var(--color-line-divider)',
  lineDefault: 'var(--color-line-default)',
  lineStrong: 'var(--color-line-strong)',
  lineHover: 'var(--color-line-hover)',
  lineAccentSubtle: 'var(--color-line-accent-subtle)',
  lineAccentHover: 'var(--color-line-accent-hover)',
  lineFocus: 'var(--color-line-focus)',

  // Actions & Brand
  actionPrimary: 'var(--color-action-primary)',
  actionPrimaryHover: 'var(--color-action-primary-hover)',
  actionPrimaryFg: 'var(--color-action-primary-fg)',
  actionPrimaryFgStrong: 'var(--color-action-primary-fg-strong)',
  actionPrimarySoft: 'var(--color-action-primary-soft)',
  actionPrimarySoftBorder: 'var(--color-action-primary-soft-border)',
  actionAccent: 'var(--color-action-accent)',
  actionAccentSoft: 'var(--color-action-accent-soft)',
  accent: 'var(--color-accent)',
  accentSoft: 'var(--color-accent-soft)',
  focusRing: 'var(--color-focus-ring)',

  // Status: Success
  statusSuccessSolid: 'var(--color-status-success-solid)',
  statusSuccessOnSolid: 'var(--color-status-success-on-solid)',
  statusSuccessFg: 'var(--color-status-success-fg)',
  statusSuccessBg: 'var(--color-status-success-bg)',
  statusSuccessBorder: 'var(--color-status-success-border)',
  statusSuccessSurface: 'var(--color-status-success-surface)',

  // Status: Warning
  statusWarningSolid: 'var(--color-status-warning-solid)',
  statusWarningOnSolid: 'var(--color-status-warning-on-solid)',
  statusWarningFg: 'var(--color-status-warning-fg)',
  statusWarningBg: 'var(--color-status-warning-bg)',
  statusWarningBorder: 'var(--color-status-warning-border)',
  statusWarningSurface: 'var(--color-status-warning-surface)',

  // Status: Danger
  statusDangerSolid: 'var(--color-status-danger-solid)',
  statusDangerOnSolid: 'var(--color-status-danger-on-solid)',
  statusDangerFg: 'var(--color-status-danger-fg)',
  statusDangerBg: 'var(--color-status-danger-bg)',
  statusDangerBorder: 'var(--color-status-danger-border)',
  statusDangerSurface: 'var(--color-status-danger-surface)',

  // Status: Info
  statusInfoSolid: 'var(--color-status-info-solid)',
  statusInfoOnSolid: 'var(--color-status-info-on-solid)',
  statusInfoFg: 'var(--color-status-info-fg)',
  statusInfoBg: 'var(--color-status-info-bg)',
  statusInfoBorder: 'var(--color-status-info-border)',
  statusInfoSurface: 'var(--color-status-info-surface)',

  // Status: Neutral
  statusNeutralSolid: 'var(--color-status-neutral-solid)',
  statusNeutralOnSolid: 'var(--color-status-neutral-on-solid)',
  statusNeutralFg: 'var(--color-status-neutral-fg)',
  statusNeutralBg: 'var(--color-status-neutral-bg)',
  statusNeutralBorder: 'var(--color-status-neutral-border)',
  statusNeutralSurface: 'var(--color-status-neutral-surface)',

  // Status: Accent (Tím VIP)
  statusAccentSolid: 'var(--color-status-accent-solid)',
  statusAccentOnSolid: 'var(--color-status-accent-on-solid)',
  statusAccentFg: 'var(--color-status-accent-fg)',
  statusAccentBg: 'var(--color-status-accent-bg)',
  statusAccentBorder: 'var(--color-status-accent-border)',
  statusAccentSurface: 'var(--color-status-accent-surface)',

  // Charts & Data Visualization
  chart1: 'var(--color-chart-1)',
  chart2: 'var(--color-chart-2)',
  chart3: 'var(--color-chart-3)',
  chart4: 'var(--color-chart-4)',
  chart5: 'var(--color-chart-5)',
  chart6: 'var(--color-chart-6)',
  chartGrid: 'var(--color-chart-grid)',
  chartAxis: 'var(--color-chart-axis)',
  chartTooltipBg: 'var(--color-chart-tooltip-bg)',
} as const

export type SemanticTokenColorKey = keyof typeof SEMANTIC_TOKEN_COLORS
export type AnyTokenColorKey = TokenColorKey | SemanticTokenColorKey

/**
 * Ánh xạ 1:1 giữa key trong TOKEN_COLORS và tên CSS variable trong compat.css
 */
export const TOKEN_COLOR_CSS_VARS: Record<TokenColorKey, string> = {
  green: '--rogym-green',
  greenHover: '--rogym-green-hover',
  teal: '--rogym-teal',
  greenDark: '--rogym-green-dark',
  greenDeeper: '--rogym-green-deeper',
  greenSoft: '--rogym-green-soft',
  greenSoftBorder: '--rogym-green-soft-border',
  tealSoft: '--rogym-teal-soft',
  amberSoft: '--rogym-amber-soft',
  amberSoftBorder: '--rogym-amber-soft-border',
  bgBase: '--rogym-bg-base',
  bgDeep: '--rogym-bg-deep',
  bgDeepAlt: '--rogym-bg-deep-alt',
  bgCard: '--rogym-bg-card',
  bgCardHover: '--rogym-bg-card-hover',
  bgCardDarker: '--rogym-bg-card-darker',
  bgElevated: '--rogym-bg-elevated',
  bgElevatedGreen: '--rogym-bg-elevated-green',
  bgLight: '--rogym-bg-light',
  bgGlass: '--rogym-bg-glass',
  textPrimary: '--rogym-text-primary',
  textSecondary: '--rogym-text-secondary',
  textMuted: '--rogym-text-muted',
  textDim: '--rogym-text-dim',
  textFaint: '--rogym-text-faint',
  textOnLight: '--rogym-text-on-light',
  textOnLightMuted: '--rogym-text-on-light-muted',
  error: '--rogym-error',
  borderSubtle: '--rogym-border-subtle',
  borderSection: '--rogym-border-section',
  borderWhiteDim: '--rogym-border-white-dim',
  borderWhiteButton: '--rogym-border-white-button',
  borderWhiteHover: '--rogym-border-white-hover',
  borderTealDim: '--rogym-border-teal-dim',
  borderTealHover: '--rogym-border-teal-hover',
}

/**
 * Trích xuất màu theo key một cách type-safe (hỗ trợ cả legacy key lẫn semantic key)
 */
export function getTokenColor(key: AnyTokenColorKey): string {
  if (key in SEMANTIC_TOKEN_COLORS) {
    return SEMANTIC_TOKEN_COLORS[key as SemanticTokenColorKey]
  }
  if (key in TOKEN_COLORS) {
    return TOKEN_COLORS[key as TokenColorKey]
  }
  return ''
}
