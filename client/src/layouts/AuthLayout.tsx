import { Suspense } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { PageLoader } from '@/components/shared/spinner/Spinner'
import { ErrorBoundary } from '@/components/shared/error-boundary/ErrorBoundary'
import { ThemeToggle } from '@/components/ui/navigation'
import { LanguageSwitcher } from '@/components/ui/typography'
import { ButtonLink } from '@/components/ui/actions'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col relative">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4">
        <Link to="/login" className="flex items-center gap-2 text-text-primary no-underline">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Auth brand mark] */}
          <span className="w-9 h-9 rounded-xl bg-action-accent text-text-inverse inline-flex items-center justify-center">
            <GraduationCap size={20} />
          </span>
          <strong className="text-lg font-extrabold tracking-tight">MOOC Clone</strong>
        </Link>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Auth header actions cluster] */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <ButtonLink to="/register" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Đăng ký ngay
          </ButtonLink>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Auth content width constraint] */}
        <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
