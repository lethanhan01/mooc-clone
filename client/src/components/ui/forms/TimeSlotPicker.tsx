import { type ReactNode } from 'react'
import { Badge } from '../data-display/Badge'
import { Skeleton } from '../feedback/Skeleton'
import { Alert } from '../feedback/Alert'
import { cn } from '@/utils'

export interface TimeSlot {
  slotIndex?: number
  startTime: string
  endTime: string
  available: boolean
  reason?: string
  label?: string
}

export interface TimeSlotPickerProps {
  slots: TimeSlot[]
  selectedSlot?: TimeSlot | null
  onSelectSlot: (slot: TimeSlot) => void
  loading?: boolean
  emptyMessage?: ReactNode
  columns?: 2 | 3 | 4
  className?: string
  slotClassName?: string
  timeZone?: string
  locale?: string
}

const columnClasses = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
}

function getSlotReasonLabel(reason?: string) {
  switch (reason) {
    case 'PAST_TIME':
      return 'Đã qua'
    case 'BUSY':
    case 'BOOKED':
    case 'TRAINER_BUSY':
      return 'Đã kín'
    case 'ROOM_FULL':
      return 'Hết phòng'
    default:
      return reason ?? 'Không khả dụng'
  }
}

function getSlotItemClassName(isSelected: boolean, available: boolean): string {
  if (isSelected) {
    return 'border-2 border-action-accent bg-action-accent/20 text-fg-primary shadow-xs ring-1 ring-action-accent/40'
  }
  if (available) {
    return 'border border-line-subtle bg-surface-sunken text-fg-primary hover:border-line-accent-subtle hover:bg-surface-card-hover'
  }
  return 'cursor-not-allowed border border-line-subtle bg-surface-sunken text-fg-disabled opacity-50'
}

export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelectSlot,
  loading = false,
  emptyMessage = 'Không có ca tập khả dụng cho ngày đã chọn.',
  columns = 3,
  className,
  slotClassName,
  timeZone = 'Asia/Ho_Chi_Minh',
  locale = 'vi-VN',
}: Readonly<TimeSlotPickerProps>) {
  function formatTime(iso: string) {
    try {
      return new Date(iso).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone,
      })
    } catch {
      return iso
    }
  }



  if (loading) {
    return (
      <div className={cn('grid gap-2.5 py-1', columnClasses[columns], className)}>
        {['slot-sk1', 'slot-sk2', 'slot-sk3', 'slot-sk4', 'slot-sk5', 'slot-sk6'].map((slotKey) => (
          <Skeleton key={slotKey} className="h-14 rounded-xl" />
        ))}
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <Alert
        tone="neutral"
        emphasis="subtle"
        className="py-3"
        description={emptyMessage}
      />
    )
  }

  return (
    <div className={cn('grid gap-2.5', columnClasses[columns], className)}>
      {slots.map((slot, index) => {
        const isSelected =
          selectedSlot?.startTime === slot.startTime &&
          selectedSlot?.endTime === slot.endTime

        const isPast = slot.reason === 'PAST_TIME'

        return (
          <button
            key={slot.slotIndex ?? `${slot.startTime}-${index}`}
            type="button"
            disabled={!slot.available}
            onClick={() => onSelectSlot(slot)}
            className={cn(
              'relative flex flex-col items-center justify-center rounded-xl p-3 text-center text-sm font-semibold transition-all touch-manipulation',
              getSlotItemClassName(Boolean(isSelected), slot.available),
              slotClassName
            )}
          >
            <span>
              {slot.label ?? `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}
            </span>
            {!slot.available && (
              <Badge
                tone={isPast ? 'neutral' : 'danger'}
                size="sm"
                className="mt-1.5 text-[10px] py-0 px-1.5 font-normal"
              >
                {getSlotReasonLabel(slot.reason)}
              </Badge>
            )}
          </button>
        )
      })}
    </div>
  )
}
