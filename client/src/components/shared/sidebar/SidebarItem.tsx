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
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Sidebar item + optional subnav] */
    <div>
      <NavLink
        to={item.to}
        end={!hasChildren}
        title={!expanded ? item.label : undefined}
        className={({ isActive }) => {
          const active = hasChildren ? groupActive : isActive
          return `rogym-sidebar__nav-link flex items-center rounded-md py-1.5 text-[13px] font-medium ${
            expanded ? 'gap-2 px-2.5' : 'justify-center px-0'
          } ${
            active
              ? 'bg-action-accent-soft text-action-accent font-semibold'
              : 'text-fg-secondary hover:bg-surface-hover hover:text-fg-primary'
          }`
        }}
      >
        <span className="relative shrink-0 [&_svg]:size-4">{item.icon}</span>
        {expanded ? (
          <span className="rogym-sidebar__label flex flex-1 items-center justify-between">
            <span>{item.label}</span>
            {badgeContent ? (
              <Badge
                tone="danger"
                emphasis="solid"
                size="sm"
                className="ml-2 flex h-4 min-w-4 items-center justify-center p-0 px-1.5 text-[10px] font-bold"
              >
                {badgeContent}
              </Badge>
            ) : null}
          </span>
        ) : null}
      </NavLink>

      {hasChildren ? (
        <div className={`rogym-sidebar__subnav ${showChildren ? 'is-open' : ''}`}>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Subnav list] */}
          <div className="flex flex-col gap-0.5 py-0.5 pl-2.5 pr-1">
            {item.children!.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                end
                className={({ isActive }) =>
                  `flex h-7 items-center rounded-md px-2.5 text-xs font-medium ${
                    isActive
                      ? 'bg-action-accent-soft font-semibold text-action-accent'
                      : 'text-fg-secondary hover:bg-surface-hover hover:text-fg-primary'
                  }`
                }
              >
                <span className="mr-2 inline-block h-1 w-1 shrink-0 rounded-full bg-current opacity-60" />
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
