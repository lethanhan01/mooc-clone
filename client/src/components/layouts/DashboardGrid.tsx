// rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Enterprise dashboard layout grid slots]
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface DashboardGridProps extends HTMLAttributes<HTMLElement> {
  header: ReactNode
  kpiCards: ReactNode
  primaryChart: ReactNode
  secondaryChart?: ReactNode
  recentActivity: ReactNode
  quickActions?: ReactNode
  kpiAriaLabel?: string
  chartsAriaLabel?: string
  activityAriaLabel?: string
}

export function DashboardGrid({
  header,
  kpiCards,
  primaryChart,
  secondaryChart,
  recentActivity,
  quickActions,
  kpiAriaLabel = 'Chỉ số hiệu suất chính',
  chartsAriaLabel = 'Biểu đồ phân tích',
  activityAriaLabel = 'Hoạt động gần đây',
  className,
  ...props
}: Readonly<DashboardGridProps>) {
  return (
    <main className={cn('space-y-6 pb-12', className)} {...props}>
      <header className="space-y-2">{header}</header>

      {/* KPI Cards Grid: 1 col mobile -> 2 col tablet -> 4 col desktop */}
      <section
        aria-label={kpiAriaLabel}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpiCards}
      </section>

      {/* Quick Actions (if present) */}
      {quickActions && (
        <section
          aria-label="Thao tác nhanh"
          className="flex items-center gap-3 overflow-x-auto pb-1"
        >
          {quickActions}
        </section>
      )}

      {/* Charts Grid */}
      <section
        aria-label={chartsAriaLabel}
        className={cn(
          'grid gap-6',
          secondaryChart ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'
        )}
      >
        <div className={cn(secondaryChart ? 'lg:col-span-2' : 'w-full')}>
          {primaryChart}
        </div>
        {secondaryChart && <div className="lg:col-span-1">{secondaryChart}</div>}
      </section>

      {/* Recent Activity Section */}
      <section aria-label={activityAriaLabel} className="space-y-4">
        {recentActivity}
      </section>
    </main>
  )
}
