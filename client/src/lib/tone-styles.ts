/**
 * @fileoverview Ma trận ánh xạ 6 Tones × 3 Emphases sang Tailwind Semantic Utility Classes.
 * Tương thích Dual-Theme (Dark/Light) tự động mà không dùng modifier dark: (Quyết định D8).
 */
import type { Tone, Emphasis } from './variants'

export const TONE_STYLES: Record<Tone, Record<Emphasis, string>> = {
  success: {
    solid: 'bg-status-success-solid text-status-success-on-solid border-transparent',
    subtle: 'bg-status-success-bg text-status-success-fg border-status-success-border',
    outline: 'bg-transparent text-status-success-fg border-status-success-border',
  },
  warning: {
    solid: 'bg-status-warning-solid text-status-warning-on-solid border-transparent',
    subtle: 'bg-status-warning-bg text-status-warning-fg border-status-warning-border',
    outline: 'bg-transparent text-status-warning-fg border-status-warning-border',
  },
  danger: {
    solid: 'bg-status-danger-solid text-status-danger-on-solid border-transparent',
    subtle: 'bg-status-danger-bg text-status-danger-fg border-status-danger-border',
    outline: 'bg-transparent text-status-danger-fg border-status-danger-border',
  },
  info: {
    solid: 'bg-status-info-solid text-status-info-on-solid border-transparent',
    subtle: 'bg-status-info-bg text-status-info-fg border-status-info-border',
    outline: 'bg-transparent text-status-info-fg border-status-info-border',
  },
  neutral: {
    solid: 'bg-surface-elevated text-fg-primary border-transparent',
    subtle: 'bg-surface-card text-fg-secondary border-line-subtle',
    outline: 'bg-transparent text-fg-muted border-line-subtle',
  },
  accent: {
    solid: 'bg-action-accent text-fg-on-solid border-transparent',
    subtle: 'bg-status-accent-bg text-status-accent-fg border-status-accent-border',
    outline: 'bg-transparent text-status-accent-fg border-status-accent-border',
  },
}

export function toneClasses(tone: Tone = 'neutral', emphasis: Emphasis = 'subtle'): string {
  return TONE_STYLES[tone][emphasis]
}
