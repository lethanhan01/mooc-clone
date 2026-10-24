import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/actions'
import { useAuthStore } from '@/stores/authStore'
import { DEMO_STUDENT, DEMO_TEACHER } from '@/services/mockData'
import { getHomePathForRoles } from '@/stores/mockExamStore'
import { toast } from '@/lib/toast'

export function RoleSwitcherPill() {
  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  if (!user) return null

  const isTeacher = user.roles.includes('teacher') || user.roles.includes('admin')

  function switchRole() {
    const next = isTeacher ? DEMO_STUDENT : DEMO_TEACHER
    setAuth(next, `mock_token_${next.roles[0]}`)
    toast.success(`Đã chuyển sang ${isTeacher ? 'Học sinh' : 'Giáo viên'}`, {
      description: next.fullName,
    })
    navigate(getHomePathForRoles(next.roles), { replace: true })
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      leftIcon={<ArrowLeftRight size={14} />}
      onClick={switchRole}
      aria-label="Chuyển nhanh vai trò demo"
      className="hidden h-8 px-2 text-xs sm:inline-flex"
    >
      {isTeacher ? '→ Học sinh' : '→ Giáo viên'}
    </Button>
  )
}
