import { Suspense, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from '@/components/shared/sidebar/Sidebar'
import { Topbar } from '@/components/shared/topbar/Topbar'
import { PageLoader } from '@/components/shared/spinner/Spinner'
import { ErrorBoundary } from '@/components/shared/error-boundary/ErrorBoundary'
import { Button } from '@/components/ui/actions'
import { cn } from '@/utils/cn'

export default function DashboardLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [App shell flex row] */
    <div className="rogym-dashboard-layout has-sidebar flex min-h-screen bg-bg-base text-text-primary">
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        expanded={sidebarExpanded}
        onExpandedChange={setSidebarExpanded}
      />

      {isMobileOpen ? (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Mobile sidebar backdrop] */
        <div
          className="rogym-sidebar-backdrop fixed inset-0 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {/* Main column — padding syncs with sidebar width so content slides */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Main column shell] */}
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col transition-[padding] duration-200 ease-out',
          sidebarExpanded ? 'md:pl-60' : 'md:pl-16'
        )}
      >
        {/* Mobile menu strip */}
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Mobile header strip] */}
        <div className="sticky top-0 z-20 flex h-12 items-center border-b border-line-subtle bg-surface px-3 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Mở menu điều hướng"
          >
            <Menu size={18} />
          </Button>
          <span className="ml-2 text-sm font-bold text-text-primary">MOOC Clone</span>
        </div>

        <Topbar />

        <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 py-3 sm:px-4 sm:py-4 lg:px-5">
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
