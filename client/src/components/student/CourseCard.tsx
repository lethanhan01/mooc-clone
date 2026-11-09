import { Building2, CalendarDays, Settings } from 'lucide-react'
import { Card } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'

export interface CourseCardProps {
  title: string
  department: string
  code: string
  statusLabel: string
  ended?: boolean
  href: string
  onSettingsClick?: () => void
}

export function CourseCard({
  title,
  department,
  code,
  statusLabel,
  ended = false,
  href,
  onSettingsClick,
}: Readonly<CourseCardProps>) {
  return (
    <Card
      as="article"
      className="flex flex-col gap-4 border border-line-subtle bg-surface-card p-4 shadow-none sm:flex-row sm:items-stretch sm:gap-5 sm:p-5"
    >
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Course thumbnail placeholder] */}
      <div
        className="flex h-28 w-full shrink-0 items-center justify-center rounded-lg bg-action-primary-soft text-center sm:h-auto sm:w-44"
        aria-hidden
      >
        <Text size="xs" className="px-2 font-semibold text-action-primary">
          {code}
        </Text>
      </div>

      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Course body stack] */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <header className="flex items-start justify-between gap-2">
          <Heading level={2} className="text-base font-bold text-fg-primary sm:text-lg">
            {title}
          </Heading>
          {onSettingsClick ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Cài đặt khóa học"
              onClick={onSettingsClick}
            >
              <Settings size={16} />
            </Button>
          ) : null}
        </header>

        <p className="m-0 flex items-center gap-2 text-sm text-fg-muted">
          <Building2 size={14} aria-hidden />
          <span>
            {department} · {code}
          </span>
        </p>
        <p className="m-0 flex items-center gap-2 text-sm text-fg-muted">
          <CalendarDays size={14} aria-hidden />
          <span>{statusLabel}</span>
        </p>

        <footer className="mt-auto pt-2">
          <ButtonLink to={href} variant="primary" size="sm">
            {ended ? 'Xem khóa học cũ' : 'Xem khóa học'}
          </ButtonLink>
        </footer>
      </div>
    </Card>
  )
}
