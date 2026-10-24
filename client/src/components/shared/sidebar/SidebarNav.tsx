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
    <nav className="flex flex-col gap-0.5 px-0.5">
      {sections.map((section, si) => (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Nav section group] */
        <div
          key={section.label ?? section.items[0]?.to ?? `nav-section-${si}`}
          className={si > 0 ? 'mt-1.5 border-t border-line-subtle pt-1.5' : ''}
        >
          {section.label ? <SidebarSection label={section.label} /> : null}
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Nav items stack] */}
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => (
              <SidebarItem key={item.to} item={item} expanded={expanded} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}
