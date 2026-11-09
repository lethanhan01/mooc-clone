import { KeyRound } from 'lucide-react'
import { cn } from '@/utils'
import { ButtonLink } from '@/components/ui/actions'
import { Text } from '@/components/ui/typography'
import { useAuthStore } from '@/stores/authStore'
import { useMockTeacherStore } from '@/stores/mockTeacherStore'

export function PasswordReminderBanner({
  showAction = true,
  className,
}: Readonly<{ showAction?: boolean; className?: string }>) {
  const user = useAuthStore((s) => s.user)
  const students = useMockTeacherStore((s) => s.students)
  const demoPasswordReminder = useMockTeacherStore((s) => s.demoPasswordReminder)

  if (!user?.roles.includes('student')) return null

  const email = user.email?.toLowerCase() ?? ''
  const local = email.split('@')[0]
  const studentId = user.studentId?.toLowerCase() ?? ''
  const match = students.find(
    (stu) =>
      stu.email.toLowerCase() === email ||
      stu.username.toLowerCase() === local ||
      (studentId.length > 0 && stu.username.toLowerCase() === studentId)
  )
  const visible = match ? match.mustChangePassword : demoPasswordReminder
  if (!visible) return null

  return (
    <section
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-status-warning-border bg-status-warning-bg px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Banner icon row] */}
      <div className="flex items-start gap-2 text-sm text-status-warning-fg">
        <KeyRound size={16} className="mt-0.5 shrink-0" aria-hidden />
        <Text size="sm" className="text-status-warning-fg">
          Tài khoản được cấp mật khẩu tạm. Hãy đổi mật khẩu ở hồ sơ — đây chỉ là lời nhắc, bạn vẫn dùng app bình thường.
        </Text>
      </div>
      {showAction ? (
        <ButtonLink to="/profile" variant="outline" size="sm">
          Đổi mật khẩu
        </ButtonLink>
      ) : null}
    </section>
  )
}
