import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { PageLoader } from '@/components/shared/spinner/Spinner'
import { ErrorBoundary } from '@/components/shared/error-boundary/ErrorBoundary'

export default function ExamLayout() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
