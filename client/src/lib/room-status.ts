import type { RoomStatus } from '@/services/mockData'

export function roomStatusLabel(status: RoomStatus): string {
  switch (status) {
    case 'waiting':
      return 'Chờ mở'
    case 'in_progress':
      return 'Đang thi'
    case 'finished':
      return 'Đã đóng'
    case 'cancelled':
      return 'Đã hủy'
    default:
      return status
  }
}

export function roomStatusTone(status: RoomStatus): 'accent' | 'warning' | 'neutral' | 'danger' {
  switch (status) {
    case 'waiting':
      return 'warning'
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
