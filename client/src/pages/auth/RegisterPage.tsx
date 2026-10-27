import { useEffect, useState, type SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/data-display'
import { Form, FormField, Input } from '@/components/ui/forms'
import { ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAuthStore, getHomePathForRoles } from '@/stores/authStore'
import { authService } from '@/services/auth.service'
import { toast } from '@/lib/toast'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const user = useAuthStore((s) => s.user)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)
  const navigate = useNavigate()

  useEffect(() => {
    if (hasHydrated && user) {
      navigate(getHomePathForRoles(user.roles), { replace: true })
    }
  }, [hasHydrated, user, navigate])

  function clearError(field: string) {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(e?: SyntheticEvent<HTMLFormElement>) {
    e?.preventDefault()
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
      await authService.register({
        username: username.trim(),
        email: email.trim(),
        password,
        displayName: fullName.trim(),
      })
      toast.success('Đăng ký thành công', { description: 'Vui lòng đăng nhập với tài khoản mới tạo' })
      navigate('/login', { replace: true })
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
          : 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'
      toast.error('Đăng ký không thành công', { description: message })
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
            name="fullName"
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
            name="username"
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
            name="email"
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
              name="password"
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
              name="confirm"
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
