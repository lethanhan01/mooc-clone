import { SEMANTIC_TOKEN_COLORS } from '@/styles/token-values'
import type { BadgeTone } from '@/components/ui/data-display'

export const OWNER_ACCENT = SEMANTIC_TOKEN_COLORS.actionPrimary

export const PACKAGE_STATUS_TONE: Record<string, BadgeTone> = {
  active: 'success',
  inactive: 'warning',
}

export const USER_STATUS_TONE: Record<string, BadgeTone> = {
  active: 'success',
  pending_verification: 'warning',
  locked: 'danger',
  deleted: 'neutral',
}

export const STAFF_POSITION_TONE: Record<string, BadgeTone> = {
  staff: 'info',
  trainer: 'accent',
  owner: 'warning',
  member: 'accent',
}

export const FEEDBACK_SEVERITY_TONE: Record<string, BadgeTone> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
}

// Backward-compatibility color mapping using Semantic Token CSS variables (0 hardcoded HEX)
export const PACKAGE_STATUS_COLOR: Record<string, string> = {
  active: SEMANTIC_TOKEN_COLORS.statusSuccessSolid,
  inactive: SEMANTIC_TOKEN_COLORS.statusWarningSolid,
}

export const USER_STATUS_COLOR: Record<string, string> = {
  active: SEMANTIC_TOKEN_COLORS.statusSuccessSolid,
  pending_verification: SEMANTIC_TOKEN_COLORS.statusWarningSolid,
  locked: SEMANTIC_TOKEN_COLORS.statusDangerSolid,
  deleted: SEMANTIC_TOKEN_COLORS.fgMuted,
}

export const STAFF_POSITION_COLOR: Record<string, string> = {
  staff: SEMANTIC_TOKEN_COLORS.statusInfoSolid,
  trainer: SEMANTIC_TOKEN_COLORS.statusAccentSolid,
  owner: SEMANTIC_TOKEN_COLORS.statusWarningSolid,
  member: OWNER_ACCENT,
}

export const FEEDBACK_SEVERITY_COLOR: Record<string, string> = {
  low: SEMANTIC_TOKEN_COLORS.statusSuccessSolid,
  medium: SEMANTIC_TOKEN_COLORS.statusWarningSolid,
  high: SEMANTIC_TOKEN_COLORS.statusDangerSolid,
}
