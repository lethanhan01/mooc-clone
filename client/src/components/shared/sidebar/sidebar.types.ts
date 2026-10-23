import type { ReactNode } from 'react'

export interface SubItem {
  label: string
  to: string
}

export interface NavItem {
  label: string
  to: string
  icon: ReactNode
  badge?: number | string
  children?: SubItem[]
}

export interface NavSection {
  label?: string
  items: NavItem[]
}

export interface SidebarProps {
  isMobileOpen?: boolean
  onCloseMobile?: () => void
  className?: string
}
