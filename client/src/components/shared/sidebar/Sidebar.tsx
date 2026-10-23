import { useRef, useEffect, useState } from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { SidebarNav } from './SidebarNav'
import { getSQBNavSections } from './sidebar.config'
import type { SidebarProps } from './sidebar.types'

export function Sidebar({
  isMobileOpen = false,
  onCloseMobile,
}: Readonly<SidebarProps>) {
  const [expanded, setExpanded] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { pathname } = useLocation()

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
    setExpanded(true)
  }

  function handleMouseLeave() {
    closeTimerRef.current = setTimeout(() => setExpanded(false), 300)
  }

  const sections = getSQBNavSections()

  return (
    <aside
      className={`rogym-sidebar fixed top-0 left-0 h-full z-40 bg-surface border-r border-line-subtle transition-all duration-300 flex flex-col ${
        expanded ? 'w-64' : 'w-18'
      } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Thanh điều hướng chính"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-line-subtle shrink-0">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-action-accent flex items-center justify-center text-text-inverse font-bold shrink-0">
            <GraduationCap size={24} />
          </div>
          {expanded && (
            <div className="truncate">
              <span className="font-extrabold text-base tracking-tight text-text-primary block">
                mooc-clone
              </span>
              <span className="text-[11px] text-text-muted block">
                Online Quiz & Exam
              </span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <SidebarNav sections={sections} expanded={expanded} />
      </div>
    </aside>
  )
}
