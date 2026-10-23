import { SEMANTIC_TOKEN_COLORS } from '@/styles/token-values'
import type { BadgeTone } from '@/components/ui/data-display'

export function scoreTone(score: number | null): BadgeTone {
  if (score === null) return 'neutral'
  if (score <= 1.5) return 'success'
  if (score <= 2.5) return 'warning'
  return 'danger'
}

export function scoreColor(score: number | null): string {
  if (score === null) return SEMANTIC_TOKEN_COLORS.fgMuted
  if (score <= 1.5) return SEMANTIC_TOKEN_COLORS.statusSuccessSolid
  if (score <= 2.5) return SEMANTIC_TOKEN_COLORS.statusWarningSolid
  return SEMANTIC_TOKEN_COLORS.statusDangerSolid
}

export function scoreLabel(score: number | null): string {
  if (score === null) return '—'
  return score.toFixed(1)
}
