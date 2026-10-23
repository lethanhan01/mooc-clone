import { ThemeToggle } from '@/components/ui/navigation'
import { LanguageSwitcher } from '@/components/ui/typography'
import { TopbarAvatarDropdown } from './TopbarAvatarDropdown'
import type { TopbarProps } from './topbar.types'
import { cn } from '@/utils/cn'

export function Topbar({ className }: Readonly<TopbarProps> = {}) {
  return (
    <header className={cn('fixed top-4 right-5 z-10 flex items-center gap-3', className)}>
      <ThemeToggle />
      <LanguageSwitcher />
      <TopbarAvatarDropdown />
    </header>
  )
}

export type { TopbarProps } from './topbar.types'
