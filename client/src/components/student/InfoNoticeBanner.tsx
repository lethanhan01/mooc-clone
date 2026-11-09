import { useState } from 'react'
import { X } from 'lucide-react'
import { Card } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'

export interface InfoNoticeBannerProps {
  title: string
  children: React.ReactNode
  expandLabel?: string
}

export function InfoNoticeBanner({
  title,
  children,
  expandLabel = 'Hiển thị đầy đủ',
}: Readonly<InfoNoticeBannerProps>) {
  const [open, setOpen] = useState(true)
  const [expanded, setExpanded] = useState(false)

  if (!open) return null

  return (
    <Card
      as="section"
      className="relative border border-line-subtle border-l-4 border-l-fg-primary bg-surface-card p-4 shadow-none"
    >
      <header className="mb-2 flex items-start justify-between gap-2 pr-8">
        <Heading level={2} className="text-sm font-bold">
          {title}
        </Heading>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          aria-label="Đóng hướng dẫn"
          onClick={() => setOpen(false)}
        >
          <X size={16} />
        </Button>
      </header>
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Collapsible notice body] */}
      <div className={expanded ? '' : 'max-h-24 overflow-hidden'}>{children}</div>
      <footer className="mt-3 flex justify-end">
        <Button type="button" variant="primary" size="sm" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Thu gọn' : expandLabel}
        </Button>
      </footer>
      {!expanded ? (
        <Text size="xs" tone="muted" className="mt-1 block">
          Nội dung đã rút gọn — bấm hiển thị đầy đủ để đọc hết.
        </Text>
      ) : null}
    </Card>
  )
}
