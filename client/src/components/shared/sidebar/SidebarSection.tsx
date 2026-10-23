export function SidebarSection({ label }: Readonly<{ label: string }>) {
  return (
    <div className="rogym-sidebar__section-label">
      {label}
    </div>
  )
}
