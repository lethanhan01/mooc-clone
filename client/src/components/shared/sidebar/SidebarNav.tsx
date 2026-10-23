import type { NavSection } from './sidebar.types'
import { SidebarItem } from './SidebarItem'
import { SidebarSection } from './SidebarSection'

export function SidebarNav({
  sections,
  expanded,
}: Readonly<{
  sections: NavSection[]
  expanded: boolean
}>) {
  return (
    <nav className="flex flex-col gap-1 px-2">
      {sections.map((section, si) => (
        <div
          key={section.label ?? section.items[0]?.to ?? `nav-section-${si}`}
          className={si > 0 ? 'mt-1' : ''}
        >
          {section.label && <SidebarSection label={section.label} />}
          <div className="flex flex-col gap-1">
            {section.items.map((item) => (
              <SidebarItem key={item.to} item={item} expanded={expanded} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}
