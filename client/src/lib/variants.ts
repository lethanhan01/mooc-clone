/**
 * @fileoverview Single Source of Truth cho toàn bộ Semantic Props trong hệ thống RoGym.
 * Tuân thủ quy tắc SEM-PROPS-001..003 & Quyết định D11/D16 (Chuyên đề 08).
 */

export const TONES = ['success', 'warning', 'danger', 'info', 'neutral', 'accent'] as const
export type Tone = (typeof TONES)[number]

export const EMPHASES = ['solid', 'subtle', 'outline'] as const
export type Emphasis = (typeof EMPHASES)[number]

export const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
export type Size = (typeof SIZES)[number]

export type FgRole = 'primary' | 'secondary' | 'muted' | 'dim' | 'faint' | 'inherit'

export function isValidTone(val: unknown): val is Tone {
  return typeof val === 'string' && (TONES as readonly string[]).includes(val)
}

export function isValidEmphasis(val: unknown): val is Emphasis {
  return typeof val === 'string' && (EMPHASES as readonly string[]).includes(val)
}

export function isValidSize(val: unknown): val is Size {
  return typeof val === 'string' && (SIZES as readonly string[]).includes(val)
}
