import type { RoomStatus } from '@/types'

export function roomStatusLabel(status: RoomStatus | string): string {
  const normalized = status?.toLowerCase()
  switch (normalized) {
    case 'waiting':
      return 'Chờ mở'
    case 'running':
    case 'in_progress':
      return 'Đang thi'
    case 'ended':
    case 'finished':
      return 'Đã đóng'
    case 'cancelled':
      return 'Đã hủy'
    default:
      return status ?? ''
  }
}

export function roomStatusTone(status: RoomStatus | string): 'accent' | 'warning' | 'neutral' | 'danger' {
  const normalized = status?.toLowerCase()
  switch (normalized) {
    case 'waiting':
      return 'warning'
    case 'running':
    case 'in_progress':
      return 'accent'
    case 'cancelled':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.abs(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

