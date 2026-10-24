import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, KeyRound, Sun, Moon, Monitor, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useTheme, type Theme } from '@/stores/themeStore'
import { Avatar } from '@/components/ui/data-display'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/overlay'
import { cn } from '@/utils/cn'

const THEME_OPTIONS: { value: Theme; icon: typeof Sun; labelKey: 'light' | 'dark' | 'system' }[] = [
  { value: 'light', icon: Sun, labelKey: 'light' },
  { value: 'dark', icon: Moon, labelKey: 'dark' },
  { value: 'system', icon: Monitor, labelKey: 'system' },
]

export function TopbarAvatarDropdown() {
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { t: tCommon } = useTranslation('common')

  const initials = user?.fullName
    ? user.fullName.trim().charAt(0).toUpperCase()
    : 'U'
  const isTeacher = Boolean(user?.roles.includes('teacher') || user?.roles.includes('admin'))
  const roleLabel = isTeacher ? 'Giáo viên' : 'Học sinh'

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
          className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-line-subtle bg-surface-card px-1.5 py-0.5 transition-colors hover:bg-surface-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus"
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
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Topbar name + role stack] */}
          <span className="hidden md:flex flex-col items-start pr-1">
            <span className="text-xs font-semibold text-fg-primary leading-tight max-w-36 truncate">
              {user?.fullName ?? 'Người dùng'}
            </span>
            <span className="text-[10px] text-fg-muted leading-tight">{roleLabel}</span>
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-50 w-72 rounded-xl border border-line-subtle bg-surface-card p-0 text-fg-primary shadow-card backdrop-blur-none"
      >
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Dropdown identity header] */}
        <div className="px-3.5 py-3 border-b border-line-subtle">
          <p className="text-sm font-semibold truncate text-fg-primary">
            {user?.fullName || 'Sinh viên HUST'}
          </p>
          <p className="mt-0.5 text-xs text-fg-muted truncate">
            {user?.studentId
              ? `Mã: ${user.studentId} · ${roleLabel}`
              : `${user?.email ?? ''} · ${roleLabel}`}
          </p>
        </div>

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Menu actions group] */}
        <div className="p-1.5">
          <DropdownMenuItem
            onClick={goProfile}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-fg-secondary hover:bg-surface-card-hover hover:text-fg-primary cursor-pointer"
          >
            <User size={16} className="shrink-0 text-fg-muted" />
            <span>Thay đổi thông tin</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={goProfile}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-fg-secondary hover:bg-surface-card-hover hover:text-fg-primary cursor-pointer"
          >
            <KeyRound size={16} className="shrink-0 text-fg-muted" />
            <span>Đổi mật khẩu</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-0 bg-line-subtle" />

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Theme picker — vertical list avoids label clipping] */}
        <div className="p-1.5" role="none">
          <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">
            {tCommon('theme.title', 'Giao diện')}
          </p>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Theme radio list] */}
          <div
            role="radiogroup"
            aria-label={tCommon('theme.title', 'Giao diện')}
            className="flex flex-col gap-0.5"
          >
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const isActive = theme === opt.value
              return (
                <DropdownMenuItem
                  key={opt.value}
                  role="radio"
                  aria-checked={isActive}
                  onSelect={(event) => {
                    event.preventDefault()
                    setTheme(opt.value)
                  }}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm',
                    isActive
                      ? 'bg-action-primary-soft text-action-primary font-medium focus:bg-action-primary-soft focus:text-action-primary'
                      : 'text-fg-secondary'
                  )}
                >
                  <Icon
                    size={16}
                    className={cn('shrink-0', isActive ? 'text-action-primary' : 'text-fg-muted')}
                  />
                  <span className="flex-1 text-left whitespace-nowrap">
                    {tCommon(`theme.${opt.labelKey}`)}
                  </span>
                  {isActive ? (
                    <Check size={14} className="shrink-0 text-action-primary" aria-hidden />
                  ) : null}
                </DropdownMenuItem>
              )
            })}
          </div>
        </div>

        <DropdownMenuSeparator className="my-0 bg-line-subtle" />

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Logout footer] */}
        <div className="p-1.5">
          <DropdownMenuItem
            onClick={handleLogout}
            destructive
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm cursor-pointer"
          >
            <LogOut size={16} className="shrink-0" />
            <span>{tCommon('user.logout', 'Đăng xuất')}</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
