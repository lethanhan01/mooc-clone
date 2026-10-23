import { Suspense, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from '@/components/shared/sidebar/Sidebar'
import { Topbar } from '@/components/shared/topbar/Topbar'
import { PageLoader } from '@/components/shared/spinner/Spinner'
import { ErrorBoundary } from '@/components/shared/error-boundary/ErrorBoundary'
import { Button } from '@/components/ui/actions'

export default function DashboardLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex">
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-18 min-w-0 transition-all duration-300">
        {/* Topbar */}
        <Topbar />

        {/* Mobile Header Menu Trigger */}
        <div className="md:hidden flex items-center h-16 px-4 border-b border-line-subtle sticky top-0 bg-surface z-20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Mở menu điều hướng"
          >
            <Menu size={20} />
          </Button>
          <span className="ml-3 font-bold text-base text-text-primary">
            SQB HUST
          </span>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
