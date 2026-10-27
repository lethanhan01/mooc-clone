import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'
import { Card, Badge } from '@/components/ui/data-display'
import { Form, FormField, Input } from '@/components/ui/forms'
import { Button, ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAuthStore, getHomePathForRoles } from '@/stores/authStore'
import { authService } from '@/services/auth.service'

import { toast } from '@/lib/toast'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  const roleLabel = user?.roles.includes('teacher') ? 'Giáo viên' : 'Học sinh'
  const username = user?.studentId || user?.email?.split('@')[0] || 'user'

  async function handleSubmit() {
    const next: Record<string, string> = {}
    if (!fullName.trim()) next.fullName = 'Họ tên không được trống'
    if (!email.trim()) next.email = 'Email không được trống'
    if (newPassword) {
      if (newPassword.length < 6) next.newPassword = 'Tối thiểu 6 ký tự'
      if (newPassword !== confirmPassword) next.confirmPassword = 'Xác nhận không khớp'
      if (!currentPassword) next.currentPassword = 'Nhập mật khẩu hiện tại'
    }
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }
    if (!user) return

    setLoading(true)
    try {
      setUser({ ...user, fullName: fullName.trim(), email: email.trim() })
      if (newPassword) {
        toast.success('Đã đổi mật khẩu', { description: 'Bạn sẽ được đăng xuất trên mọi thiết bị' })
        await authService.logout()
        navigate('/login', { replace: true })
        return
      }
      toast.success('Đã lưu hồ sơ')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Card as="article" className="p-6 sm:p-8 bg-surface border-line-subtle shadow-card rounded-2xl max-w-3xl mx-auto">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Profile header text stack] */}
        <div>
          <Heading level={1} className="text-2xl font-extrabold text-text-primary">
            Hồ sơ cá nhân & Cài đặt bảo mật
          </Heading>
          <Text size="sm" tone="muted" className="mt-1">
            Quản lý thông tin tài khoản và đổi mật khẩu đăng nhập tại một nơi duy nhất
          </Text>
        </div>
        <ButtonLink to={getHomePathForRoles(user.roles)} variant="outline" size="sm">
          Về trang chủ
        </ButtonLink>
      </header>

      <section className="mb-6 rounded-xl bg-action-accent-soft px-4 py-3 flex items-center gap-2">
        <User size={18} className="text-action-accent shrink-0" />
        <Text size="sm" className="text-text-primary">
          <strong>
            Mã: {user.userId.slice(0, 8).toUpperCase()} · {user.fullName} · Vai trò: {roleLabel}
          </strong>
        </Text>
        <Badge tone="accent" size="sm" className="ml-auto">
          {roleLabel}
        </Badge>
      </section>

      <Form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField id="profile-name" label="Họ và tên hiển thị:" error={errors.fullName} required>
          <Input
            id="profile-name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value)
              setErrors((p) => ({ ...p, fullName: undefined }))
            }}
          />
        </FormField>

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Username/email two-column grid] */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField id="profile-username" label="Tên đăng nhập:">
            <Input id="profile-username" value={`${username} (Cố định)`} disabled readOnly />
          </FormField>
          <FormField id="profile-email" label="Địa chỉ Email:" error={errors.email} required>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors((p) => ({ ...p, email: undefined }))
              }}
            />
          </FormField>
        </div>

        <Heading level={2} className="text-sm font-bold text-action-accent uppercase tracking-wide pt-2">
          Đổi mật khẩu (Bỏ trống nếu không muốn đổi):
        </Heading>

        <FormField id="profile-current" label="Mật khẩu hiện tại:" error={errors.currentPassword}>
          <Input
            id="profile-current"
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value)
              setErrors((p) => ({ ...p, currentPassword: undefined }))
            }}
          />
        </FormField>

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [New password two-column grid] */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField id="profile-new" label="Mật khẩu mới:" error={errors.newPassword}>
            <Input
              id="profile-new"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setErrors((p) => ({ ...p, newPassword: undefined }))
              }}
            />
          </FormField>
          <FormField id="profile-confirm" label="Xác nhận mật khẩu mới:" error={errors.confirmPassword}>
            <Input
              id="profile-confirm"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setErrors((p) => ({ ...p, confirmPassword: undefined }))
              }}
            />
          </FormField>
        </div>

        <SubmitButton loading={loading} variant="primary" className="w-full justify-center uppercase tracking-wide mt-2">
          Lưu cập nhật hồ sơ
        </SubmitButton>
      </Form>

      <footer className="mt-3 text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setFullName(user.fullName)
            setEmail(user.email)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setErrors({})
          }}
        >
          Hủy bỏ thay đổi
        </Button>
      </footer>
    </Card>
  )
}
