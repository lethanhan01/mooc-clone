import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/data-display'
import { Form, FormField, Input } from '@/components/ui/forms'
import { ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAuthStore, type Role } from '@/stores/authStore'
import { toast } from '@/lib/toast'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  function clearError(field: string) {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit() {
    const next: Record<string, string> = {}
    if (!fullName.trim()) next.fullName = 'Vui lòng nhập họ và tên'
    if (!username.trim()) next.username = 'Vui lòng nhập tên đăng nhập'
    if (!email.trim()) next.email = 'Vui lòng nhập email'
    if (password.length < 6) next.password = 'Mật khẩu tối thiểu 6 ký tự'
    if (confirm !== password) next.confirm = 'Xác nhận mật khẩu không khớp'
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }

    setLoading(true)
    try {
      setAuth(
        {
          userId: `u_${Date.now()}`,
          email: email.trim(),
          fullName: fullName.trim(),
          roles: ['student'] as Role[],
          studentId: username.trim(),
        },
        `mock_token_student_${Date.now()}`
      )
      toast.success('Đăng ký thành công', { description: 'Đã tạo tài khoản học sinh demo' })
      navigate('/student/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card as="article" className="p-8 bg-surface border-line-subtle shadow-card rounded-2xl w-full">
      <header className="mb-6">
        <Heading level={1} className="text-2xl font-extrabold text-text-primary">
          Đăng ký tài khoản Học sinh
        </Heading>
        <Text size="sm" tone="muted" className="mt-1">
          Tạo tài khoản để tham gia phòng thi và luyện tập
        </Text>
      </header>

      <Form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField id="reg-fullname" label="Họ và tên học sinh:" error={errors.fullName} required>
          <Input
            id="reg-fullname"
            value={fullName}
            placeholder="Nguyễn Văn A"
            onChange={(e) => {
              setFullName(e.target.value)
              clearError('fullName')
            }}
          />
        </FormField>
        <FormField id="reg-username" label="Tên đăng nhập:" error={errors.username} required>
          <Input
            id="reg-username"
            value={username}
            placeholder="hocsinh_vana"
            onChange={(e) => {
              setUsername(e.target.value)
              clearError('username')
            }}
          />
        </FormField>
        <FormField id="reg-email" label="Địa chỉ Email:" error={errors.email} required>
          <Input
            id="reg-email"
            type="email"
            value={email}
            placeholder="nguyenvana@gmail.com"
            onChange={(e) => {
              setEmail(e.target.value)
              clearError('email')
            }}
          />
        </FormField>

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Password fields two-column grid] */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField id="reg-password" label="Mật khẩu:" error={errors.password} required>
            <Input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                clearError('password')
              }}
            />
          </FormField>
          <FormField id="reg-confirm" label="Xác nhận mật khẩu:" error={errors.confirm} required>
            <Input
              id="reg-confirm"
              type="password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value)
                clearError('confirm')
              }}
            />
          </FormField>
        </div>

        <SubmitButton loading={loading} variant="primary" className="w-full justify-center uppercase tracking-wide">
          Đăng ký học sinh
        </SubmitButton>
      </Form>

      <footer className="mt-4 text-center">
        <Text size="sm" tone="muted">
          Đã có tài khoản?{' '}
          <ButtonLink to="/login" variant="ghost" size="sm" className="inline px-1 text-action-accent">
            Quay lại Đăng nhập
          </ButtonLink>
        </Text>
      </footer>
    </Card>
  )
}
