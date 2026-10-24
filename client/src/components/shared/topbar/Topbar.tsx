import { ThemeToggle } from '@/components/ui/navigation'
import { LanguageSwitcher } from '@/components/ui/typography'
import { TopbarAvatarDropdown } from './TopbarAvatarDropdown'
import type { TopbarProps } from './topbar.types'
import { cn } from '@/utils/cn'

export function Topbar({ className }: Readonly<TopbarProps> = {}) {
  return (
    <header
      className={cn(
        'sticky top-0 z-10 flex h-12 shrink-0 items-center justify-end gap-2 border-b border-line-subtle bg-surface px-3 sm:px-4',
        className
      )}
    >
      <ThemeToggle />
      <LanguageSwitcher />
      <TopbarAvatarDropdown />
    </header>
  )
}

export type { TopbarProps } from './topbar.types'
