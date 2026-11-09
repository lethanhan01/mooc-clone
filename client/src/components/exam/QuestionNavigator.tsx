import { Button } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { cn } from '@/utils'

export type QuestionNavStatus = 'unanswered' | 'answered' | 'current' | 'flagged' | 'confirmed'

export interface QuestionNavigatorItem {
  id: string | number
  status: QuestionNavStatus
}

export interface QuestionNavigatorProps {
  items: QuestionNavigatorItem[]
  onSelect: (index: number) => void
  className?: string
}

function variantFor(status: QuestionNavStatus): 'primary' | 'secondary' | 'outline' | 'ghost' {
  if (status === 'current') return 'primary'
  if (status === 'confirmed') return 'secondary'
  if (status === 'answered') return 'secondary'
  return 'outline'
}

export function QuestionNavigator({ items, onSelect, className }: Readonly<QuestionNavigatorProps>) {
  return (
    <aside
      aria-label="Bảng điều hướng câu hỏi"
      className={cn('h-fit rounded-xl border border-line-subtle bg-surface-card p-4', className)}
    >
      <Heading level={2} className="mb-1 text-sm font-bold">
        Danh sách câu
      </Heading>
      <Text size="xs" tone="muted" className="mb-3 block">
        Xanh đậm: đang xem · Xanh nhạt: đã trả lời · Viền: chưa làm
      </Text>
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Question palette grid] */}
      <div className="grid grid-cols-5 gap-2">
        {items.map((item, index) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={variantFor(item.status)}
            className={cn(
              'min-h-11 min-w-11',
              item.status === 'flagged' && 'ring-2 ring-status-warning-solid',
              item.status === 'answered' && 'bg-status-success-bg text-status-success-fg border-status-success-border',
              item.status === 'confirmed' && 'bg-action-primary-soft text-action-primary border-action-primary-soft-border'
            )}
            onClick={() => onSelect(index)}
            aria-label={`Câu ${index + 1}`}
            aria-current={item.status === 'current' ? 'true' : undefined}
          >
            {index + 1}
          </Button>
        ))}
      </div>
    </aside>
  )
}
