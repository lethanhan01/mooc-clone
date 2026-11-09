import type { ReactNode } from 'react'
import { Heading, Text } from '@/components/ui/typography'
import { Button } from '@/components/ui/actions'
import { cn } from '@/utils'

export interface ExamShellProps {
  title: string
  subtitle?: string
  timerLabel: string
  timerUrgent?: boolean
  onSubmitClick: () => void
  submitLabel?: string
  feedback?: string | null
  navigator: ReactNode
  children: ReactNode
  className?: string
}

export function ExamShell({
  title,
  subtitle,
  timerLabel,
  timerUrgent = false,
  onSubmitClick,
  submitLabel = 'Nộp bài',
  feedback,
  navigator,
  children,
  className,
}: Readonly<ExamShellProps>) {
  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Exam layout grid] */
    <div className={cn('grid min-h-[70vh] grid-cols-1 gap-4 lg:grid-cols-[1fr_240px]', className)}>
      <main className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line-subtle bg-surface-card p-4">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title stack] */}
          <div>
            <Heading level={1} className="text-base font-bold sm:text-lg">
              {title}
            </Heading>
            {subtitle ? (
              <Text size="xs" tone="muted">
                {subtitle}
              </Text>
            ) : null}
          </div>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Header actions] */}
          <div className="flex flex-wrap items-center gap-3">
            <p
              className={cn(
                'font-mono text-xl font-extrabold tabular-nums',
                timerUrgent ? 'text-status-danger-fg' : 'text-action-primary'
              )}
              aria-live="polite"
            >
              {timerLabel}
            </p>
            <Button type="button" variant="danger" size="sm" onClick={onSubmitClick}>
              {submitLabel}
            </Button>
          </div>
        </header>

        {feedback ? (
          <p
            className="m-0 rounded-lg border border-status-info-border bg-status-info-bg px-3 py-2 text-sm text-status-info-fg"
            role="status"
          >
            {feedback}
          </p>
        ) : null}

        {children}
      </main>
      {navigator}
    </div>
  )
}
