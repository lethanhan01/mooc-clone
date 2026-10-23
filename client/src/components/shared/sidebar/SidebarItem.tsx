import { NavLink, useLocation } from 'react-router-dom'
import { Badge } from '@/components/ui/data-display'
import type { NavItem } from './sidebar.types'

function isGroupActive(item: NavItem, pathname: string): boolean {
  if (!item.children) return false
  return item.children.some((c) => pathname === c.to || pathname.startsWith(c.to + '/'))
}

export function SidebarItem({
  item,
  expanded,
}: Readonly<{
  item: NavItem
  expanded: boolean
}>) {
  const { pathname } = useLocation()
  const hasChildren = Boolean(item.children?.length)
  const groupActive = hasChildren && isGroupActive(item, pathname)
  const showChildren = expanded && hasChildren && groupActive

  const badgeContent = item.badge
    ? Number(item.badge) > 99
      ? '99+'
      : item.badge
    : null

  return (
    <div>
      <NavLink
        to={item.to}
        end={!hasChildren}
        title={!expanded ? item.label : undefined}
        className={({ isActive }) => {
          const active = hasChildren ? groupActive : isActive
          return `rogym-sidebar__nav-link rogym-sweep flex items-center py-2.5 rounded-xl text-sm font-medium ${
            expanded ? 'px-3' : 'justify-center px-0'
          } ${
            active
              ? 'bg-action-accent-soft text-action-accent font-semibold'
              : 'text-fg-secondary hover:text-fg-primary'
          }`
        }}
      >
        <span className="shrink-0 relative">
          {item.icon}
          {!expanded && Boolean(badgeContent) && (
            <Badge
              tone="danger"
              emphasis="solid"
              size="sm"
              className="absolute -top-1 -right-1.5 h-4 min-w-4 p-0 px-1 text-[10px] flex items-center justify-center font-bold"
            >
              {badgeContent}
            </Badge>
          )}
        </span>
        <span className="rogym-sidebar__label flex-1 flex items-center justify-between">
          <span>{item.label}</span>
          {expanded && Boolean(badgeContent) && (
            <Badge
              tone="danger"
              emphasis="solid"
              size="sm"
              className="ml-2 h-4 min-w-4 p-0 px-1.5 text-[10px] flex items-center justify-center font-bold"
            >
              {badgeContent}
            </Badge>
          )}
        </span>
      </NavLink>

      {/* Sub-items — hiển thị khi expanded VÀ group đang active */}
      {hasChildren && (
        <div className={`rogym-sidebar__subnav ${showChildren ? 'is-open' : ''}`}>
          <div className="flex flex-col gap-0.5 pl-3 pr-1 pt-1 pb-1">
            {item.children!.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                end
                className={({ isActive }) =>
                  `rogym-sweep flex h-8 items-center rounded-lg px-3 text-xs font-medium ${
                    isActive
                      ? 'bg-action-accent-soft text-action-accent font-semibold'
                      : 'text-fg-secondary hover:text-fg-primary'
                  }`
                }
              >
                <span className="mr-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
