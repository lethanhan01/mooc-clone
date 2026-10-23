import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { Avatar } from '@/components/ui/data-display'
import { ThemeSegmentedControl } from '@/components/ui/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/overlay'
import { cn } from '@/utils/cn'

export function TopbarAvatarDropdown() {
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { t: tCommon } = useTranslation('common')

  const initials = user?.fullName
    ? user.fullName.trim().charAt(0).toUpperCase()
    : 'U'

  function goProfile() {
    setOpen(false)
    navigate('/profile')
  }

  function handleLogout() {
    setOpen(false)
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex shrink-0 items-center justify-center rounded-full border-2 border-transparent transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus cursor-pointer"
          aria-label={tCommon('user.menu', 'Menu người dùng')}
        >
          <Avatar
            src={user?.avatarUrl ?? undefined}
            name={user?.fullName ?? 'User'}
            fallback={initials}
            size="sm"
            tone="accent"
            className={cn(open && 'ring-2 ring-line-focus')}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 p-1 bg-surface border border-line-subtle shadow-card rounded-xl text-text-primary z-50"
      >
        <div className="px-3 py-2 border-b border-line-subtle">
          <p className="text-sm font-semibold truncate text-text-primary">
            {user?.fullName || 'Sinh viên HUST'}
          </p>
          <p className="text-xs text-text-muted truncate">
            {user?.email || 'student@sis.hust.edu.vn'}
          </p>
        </div>

        <DropdownMenuItem
          onClick={goProfile}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-hover cursor-pointer"
        >
          <User size={16} />
          <span>{tCommon('user.profile', 'Hồ sơ cá nhân')}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 border-t border-line-subtle" />

        <div className="px-3 py-1.5">
          <p className="text-xs text-text-muted mb-1.5 font-medium">Giao diện</p>
          <ThemeSegmentedControl size="sm" />
        </div>

        <DropdownMenuSeparator className="my-1 border-t border-line-subtle" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-tone-danger hover:bg-tone-danger/10 cursor-pointer"
        >
          <LogOut size={16} />
          <span>{tCommon('user.logout', 'Đăng xuất')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
