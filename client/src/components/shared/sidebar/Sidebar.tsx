import { useEffect, useRef } from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { SidebarNav } from './SidebarNav'
import { getMoocNavSections } from './sidebar.config'
import { useAuthStore, type Role } from '@/stores/authStore'
import { getHomePathForRoles } from '@/stores/mockExamStore'
import type { SidebarProps } from './sidebar.types'

export function Sidebar({
  isMobileOpen = false,
  onCloseMobile,
  expanded = false,
  onExpandedChange,
}: Readonly<SidebarProps>) {
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { pathname } = useLocation()
  const roles = useAuthStore((s) => s.user?.roles ?? (['student'] as Role[]))

  useEffect(() => {
    onCloseMobile?.()
  }, [pathname, onCloseMobile])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  function handleMouseEnter() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    onExpandedChange?.(true)
  }

  function handleMouseLeave() {
    closeTimerRef.current = setTimeout(() => onExpandedChange?.(false), 180)
  }

  const sections = getMoocNavSections(roles)
  const homePath = getHomePathForRoles(roles)
  const showLabels = expanded || isMobileOpen

  return (
    <aside
      className={`rogym-sidebar fixed top-0 left-0 z-40 flex h-full flex-col border-r border-line-subtle transition-[width] duration-200 ease-out ${
        showLabels ? 'is-expanded w-60' : 'w-16'
      } ${isMobileOpen ? 'is-mobile-open translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Thanh điều hướng chính"
      aria-expanded={showLabels}
    >
      {/* Brand Header */}
      <div
        className={`rogym-sidebar__logo flex h-12 shrink-0 items-center border-b border-line-subtle ${
          showLabels ? 'gap-2.5 px-3' : 'justify-center px-0'
        }`}
      >
        <NavLink to={homePath} className="flex min-w-0 items-center gap-2.5">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Brand mark icon wrapper] */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-action-accent font-bold text-text-inverse">
            <GraduationCap size={18} />
          </div>
          {showLabels ? (
            /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Sidebar brand text stack] */
            <div className="min-w-0 truncate">
              <span className="block text-sm font-bold leading-tight tracking-tight text-text-primary">
                MOOC Clone
              </span>
              <span className="block text-[10px] leading-tight text-text-muted">
                Cổng thi trực tuyến
              </span>
            </div>
          ) : null}
        </NavLink>
      </div>

      {/* Nav List */}
      <div className={`flex-1 overflow-y-auto py-2 ${showLabels ? 'px-1.5' : 'px-1'}`}>
        <SidebarNav sections={sections} expanded={showLabels} />
      </div>
    </aside>
  )
}
