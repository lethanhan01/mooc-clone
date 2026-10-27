import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/actions'
import { useAuthStore, getHomePathForRoles, mapAuthResponseToUser } from '@/stores/authStore'
import { authService } from '@/services/auth.service'
import { toast } from '@/lib/toast'

export function RoleSwitcherPill() {
  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const isTeacher = user.roles.includes('teacher')

  async function switchRole() {
    setLoading(true)
    try {
      const username = isTeacher ? 'student_alice' : 'teacher_le'
      const res = await authService.login({
        usernameOrEmail: username,
        password: 'password123',
      })
      const loggedInUser = mapAuthResponseToUser(res)
      setAuth(loggedInUser, res.token)
      toast.success(`Đã chuyển sang ${isTeacher ? 'Học sinh' : 'Giáo viên'}`, {
        description: res.displayName,
      })
      navigate(getHomePathForRoles(loggedInUser.roles), { replace: true })
    } catch {
      toast.error('Không thể chuyển vai trò tự động', {
        description: 'Vui lòng kiểm tra kết nối tới server.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={loading}
      leftIcon={loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowLeftRight size={14} />}
      onClick={switchRole}
      aria-label="Chuyển nhanh vai trò qua API"
      className="hidden h-8 px-2 text-xs sm:inline-flex"
    >
      {isTeacher ? '→ Học sinh' : '→ Giáo viên'}
    </Button>
  )
}

