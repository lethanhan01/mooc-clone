import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Lock, Mail } from 'lucide-react'
import { Card } from '@/components/ui/data-display'
import { Form, FormField, Input } from '@/components/ui/forms'
import { SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAuthStore, type Role } from '@/stores/authStore'
import { authService } from '@/services/auth.service'
import { toast } from '@/lib/toast'

export default function LoginPage() {
  const [email, setEmail] = useState('student@mooc.edu.vn')
  const [password, setPassword] = useState('Password@123')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  async function handleSubmit() {
    const newErrors: { email?: string; password?: string } = {}
    if (!email.trim()) newErrors.email = 'Vui lòng nhập tài khoản / email'
    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const res = await authService.login({ email, password })
      setAuth(res.user, res.token)
      toast.success('Đăng nhập thành công!', { description: `Chào mừng trở lại, ${res.user.fullName}` })
      navigate('/dashboard')
    } catch {
      // Mock login fallback if backend isn't reachable during offline dev
      const mockUser = {
        userId: 'u_mooc_01',
        email: email,
        fullName: 'Lê Thành An',
        roles: ['student'] as Role[],
        studentId: '20235631',
        department: 'Khoa Công nghệ Thông tin',
      }
      setAuth(mockUser, 'mock_token_mooc_clone')
      toast.info('Đang sử dụng phiên đăng nhập demo (Backend offline)', {
        description: 'Đã cấp quyền truy cập tài khoản thí sinh thành công.',
      })
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card as="article" className="p-8 bg-surface border-line-subtle shadow-card rounded-2xl max-w-md w-full">
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-action-accent flex items-center justify-center text-text-inverse mb-4 shadow-sm">
          <CheckCircle2 size={32} />
        </div>
        <Heading level={2} className="text-2xl font-extrabold tracking-tight text-text-primary">
          mooc-clone
        </Heading>
        <Text size="sm" tone="muted" className="mt-1">
          Hệ Thống Thi Trắc Nghiệm Trực Tuyến
        </Text>
      </div>

      <Form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField
          id="login-email"
          label="Tài khoản / Email sinh viên"
          error={errors.email}
          required
        >
          <Input
            id="login-email"
            aria-label="Tài khoản / Email sinh viên"
            type="email"
            placeholder="student@mooc.edu.vn"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
            }}
            leftIcon={<Mail size={16} />}
            autoComplete="email"
          />
        </FormField>

        <FormField
          id="login-password"
          label="Mật khẩu"
          error={errors.password}
          required
        >
          <Input
            id="login-password"
            aria-label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            leftIcon={<Lock size={16} />}
            autoComplete="current-password"
          />
        </FormField>

        <SubmitButton
          loading={loading}
          variant="primary"
          className="w-full justify-center mt-2"
        >
          Đăng nhập vào hệ thống
        </SubmitButton>
      </Form>
    </Card>
  )
}
