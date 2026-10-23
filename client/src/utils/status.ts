import i18n from '@/lib/i18n'
import type { Tone } from '@/lib/variants'


export type StatusTone = Tone

export type StatusDomain =
  | 'member'
  | 'payment'
  | 'session'
  | 'subscription'
  | 'equipment'
  | 'general'

export function getStatusTone(status?: string | null, domain: StatusDomain = 'general'): Tone {
  switch (domain) {
    case 'member':
      return getMemberStatusTone(status)
    case 'payment':
      return getPaymentStatusTone(status)
    case 'session':
      return getSessionStatusTone(status)
    case 'subscription':
      return getSubscriptionStatusTone(status)
    case 'equipment':
    case 'general':
    default:
      return statusTone(status)
  }
}

export function getStatusLabel(
  status?: string | null,
  _domain: StatusDomain = 'general'
): string {
  return statusLabel(status)
}

export function statusLabel(status?: string | null): string {
  if (!status) return i18n.t('status.unknown', { ns: 'common' })
  const key = status.replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase())
  return i18n.t(`status.${key}`, { ns: 'common', defaultValue: status.replace(/_/g, ' ') })
}

export function statusTone(status?: string | null): Tone {
  if (status === 'active' || status === 'completed' || status === 'resolved') return 'success'
  if (
    status === 'scheduled' ||
    status === 'in_progress' ||
    status === 'realtime' ||
    status === 'available' ||
    status === 'repairing'
  )
    return 'accent'
  if (
    status === 'pending' ||
    status === 'pending_verification' ||
    status === 'draft' ||
    status === 'maintenance' ||
    status === 'reported' ||
    status === 'suspended' ||
    status === 'locked'
  )
    return 'warning'
  if (status === 'cancelled' || status === 'expired' || status === 'broken' || status === 'deleted')
    return 'danger'
  if (
    status === 'inactive' ||
    status === 'retired' ||
    status === 'archived' ||
    status === 'replaced'
  )
    return 'neutral'
  return 'neutral'
}

export function getMemberStatusTone(status?: string | null): Tone {
  switch (status) {
    case 'active':
      return 'success'
    case 'pending':
    case 'pending_verification':
      return 'warning'
    case 'trial':
      return 'info'
    case 'expired':
      return 'danger'
    case 'inactive':
    case 'suspended':
    default:
      return 'neutral'
  }
}

export function getPaymentStatusTone(status?: string | null): Tone {
  switch (status) {
    case 'paid':
    case 'completed':
    case 'success':
      return 'success'
    case 'pending':
    case 'processing':
      return 'warning'
    case 'failed':
    case 'rejected':
      return 'danger'
    case 'refunded':
    case 'cancelled':
    default:
      return 'neutral'
  }
}

export function getSessionStatusTone(status?: string | null): Tone {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'in_progress':
      return 'accent'
    case 'scheduled':
      return 'info'
    case 'cancelled':
    case 'no_show':
      return 'danger'
    case 'completed':
    default:
      return 'neutral'
  }
}

export function getSubscriptionStatusTone(status?: string | null): Tone {
  switch (status) {
    case 'active':
      return 'success'
    case 'expiring_soon':
    case 'pending':
      return 'warning'
    case 'expired':
    case 'cancelled':
      return 'danger'
    case 'paused':
    case 'inactive':
    default:
      return 'neutral'
  }
}
