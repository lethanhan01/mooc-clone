import { useCallback, useEffect, useState, type SyntheticEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import { Card } from '@/components/ui/data-display'
import { Form, FormField, Input } from '@/components/ui/forms'
import { ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { getHomePathForRoles, mapAuthResponseToUser, useAuthStore, type Role } from '@/stores/authStore'
import { authService } from '@/services/auth.service'
import { toast } from '@/lib/toast'

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ usernameOrEmail?: string; password?: string }>({})
  const setAuth = useAuthStore((s) => s.setAuth)
  const user = useAuthStore((s) => s.user)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)
  const navigate = useNavigate()
  const location = useLocation()

  const getDestination = useCallback(
    (roles: Role[] = []) => {
      const stateFrom = (location.state as { from?: { pathname?: string; search?: string; hash?: string } | string })?.from
      if (typeof stateFrom === 'string' && stateFrom.length > 0) {
        return stateFrom
      }
      if (stateFrom && typeof stateFrom === 'object' && stateFrom.pathname) {
        return `${stateFrom.pathname}${stateFrom.search || ''}${stateFrom.hash || ''}`
      }
      return getHomePathForRoles(roles)
    },
    [location.state]
  )

  // Tự động chuyển hướng đến Dashboard nếu người dùng đã đăng nhập từ trước
  useEffect(() => {
    if (hasHydrated && user) {
      navigate(getDestination(user.roles), { replace: true })
    }
  }, [hasHydrated, user, navigate, getDestination])

  async function handleSubmit(e?: SyntheticEvent<HTMLFormElement>) {
    e?.preventDefault()
    let u = usernameOrEmail.trim()
    let p = password

    // Fallback: Đọc dữ liệu từ form native phòng trường hợp browser autofill không kích hoạt React onChange
    if (e?.currentTarget) {
      const formData = new FormData(e.currentTarget)
      const rawU = formData.get('usernameOrEmail')
      const rawP = formData.get('password')
      const formU = typeof rawU === 'string' ? rawU.trim() : ''
      const formP = typeof rawP === 'string' ? rawP : ''
      if (formU && !u) {
        u = formU
        setUsernameOrEmail(formU)
      }
      if (formP && !p) {
        p = formP
        setPassword(formP)
      }
    }

    const newErrors: { usernameOrEmail?: string; password?: string } = {}
    if (!u) newErrors.usernameOrEmail = 'Vui lòng nhập tên đăng nhập hoặc email'
    if (!p) newErrors.password = 'Vui lòng nhập mật khẩu'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const authData = await authService.login({
        usernameOrEmail: u,
        password: p,
      })
      const loggedInUser = mapAuthResponseToUser(authData)
      setAuth(loggedInUser, authData.token)
      toast.success('Đăng nhập thành công!')
      navigate(getDestination(loggedInUser.roles), { replace: true })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Tên đăng nhập hoặc mật khẩu không chính xác'
      setErrors({ password: message })
      toast.error(message)
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
        <FormField
          id="login-username-or-email"
          label="Tên đăng nhập hoặc Email:"
          error={errors.usernameOrEmail}
          required
        >
          <Input
            id="login-username-or-email"
            name="usernameOrEmail"
            aria-label="Tên đăng nhập hoặc Email"
            type="text"
            placeholder="taikhoan@mooc.edu.vn"
            value={usernameOrEmail}
            onChange={(e) => {
              setUsernameOrEmail(e.target.value)
              if (errors.usernameOrEmail) {
                setErrors((prev) => ({ ...prev, usernameOrEmail: undefined }))
              }
            }}
            leftIcon={<Mail size={16} />}
            autoComplete="username"
          />
        </FormField>

        <FormField id="login-password" label="Mật khẩu:" error={errors.password} required>
          <Input
            id="login-password"
            name="password"
            aria-label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: undefined }))
              }
            }}
            leftIcon={<Lock size={16} />}
            autoComplete="current-password"
          />
        </FormField>

        <SubmitButton
          loading={loading}
          variant="primary"
          className="w-full justify-center uppercase tracking-wide"
        >
          Đăng nhập
        </SubmitButton>
      </Form>

      <footer className="mt-6 border-t border-line-subtle pt-4 text-center">
        <Text size="sm" tone="muted">
          Bạn chưa có tài khoản?{' '}
          <ButtonLink to="/register" variant="ghost" size="sm" className="inline px-1 text-action-accent">
            Đăng ký ngay
          </ButtonLink>
        </Text>
      </footer>
    </Card>
  )
}
