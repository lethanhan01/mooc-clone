import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Lock, Mail, UserRound, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/data-display'
import { Form, FormField, Input } from '@/components/ui/forms'
import { Button, ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAuthStore } from '@/stores/authStore'
import { DEMO_ACCOUNTS } from '@/services/mockData'
import { getHomePathForRoles } from '@/stores/mockExamStore'
import { toast } from '@/lib/toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  function loginAs(kind: 'teacher' | 'student') {
    const account = DEMO_ACCOUNTS[kind]
    setAuth(account.user, `mock_token_${kind}`)
    toast.success('Đăng nhập demo thành công')
    navigate(getHomePathForRoles(account.user.roles))
  }

  async function handleSubmit() {
    const newErrors: { email?: string; password?: string } = {}
    if (!email.trim()) newErrors.email = 'Vui lòng nhập tên đăng nhập hoặc email'
    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const normalized = email.trim().toLowerCase()
      const match = Object.values(DEMO_ACCOUNTS).find(
        (a) => a.email.toLowerCase() === normalized && a.password === password
      )
      if (!match) {
        setErrors({ password: 'Email hoặc mật khẩu không đúng (dùng tài khoản demo)' })
        return
      }
      setAuth(match.user, `mock_token_${match.user.roles[0]}`)
      toast.success('Đăng nhập thành công!')
      navigate(getHomePathForRoles(match.user.roles))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card as="article" className="p-8 bg-surface border-line-subtle shadow-card rounded-2xl w-full">
      <header className="mb-6">
        <Heading level={1} className="text-2xl font-extrabold tracking-tight text-text-primary">
          Đăng nhập hệ thống
        </Heading>
        <Text size="sm" tone="muted" className="mt-1">
          Chào mừng bạn đến với Cổng thi trực tuyến
        </Text>
      </header>

      <Form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField id="login-email" label="Tên đăng nhập hoặc Email:" error={errors.email} required>
          <Input
            id="login-email"
            aria-label="Tên đăng nhập hoặc Email"
            type="email"
            placeholder="taikhoan@mooc.edu.vn"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
            }}
            leftIcon={<Mail size={16} />}
            autoComplete="username"
          />
        </FormField>

        <FormField id="login-password" label="Mật khẩu:" error={errors.password} required>
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

        <SubmitButton loading={loading} variant="primary" className="w-full justify-center uppercase tracking-wide">
          Đăng nhập
        </SubmitButton>
      </Form>

      <footer className="mt-4 flex flex-col gap-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Demo quick-login grid] */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-line-subtle pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<GraduationCap size={16} />}
            onClick={() => loginAs('teacher')}
            className="justify-center"
          >
            Đăng nhập Giáo viên Demo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<BookOpen size={16} />}
            onClick={() => loginAs('student')}
            className="justify-center"
          >
            Đăng nhập Học sinh Demo
          </Button>
        </div>

        <Text size="sm" tone="muted" className="text-center mt-2">
          Bạn chưa có tài khoản?{' '}
          <ButtonLink to="/register" variant="ghost" size="sm" className="inline px-1 text-action-accent">
            Đăng ký ngay
          </ButtonLink>
        </Text>
        <Text size="xs" tone="muted" className="text-center flex items-center justify-center gap-1">
          <UserRound size={12} /> teacher@mooc.edu.vn / student@mooc.edu.vn · Password@123
        </Text>
      </footer>
    </Card>
  )
}
