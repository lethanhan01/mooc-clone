import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { PageLoader } from '@/components/shared/spinner/Spinner'
import { ErrorBoundary } from '@/components/shared/error-boundary/ErrorBoundary'
import { ThemeToggle } from '@/components/ui/navigation'
import { LanguageSwitcher } from '@/components/ui/typography'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}
