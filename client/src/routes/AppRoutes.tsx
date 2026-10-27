import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/shared/protected-route/ProtectedRoute'
import { useAuthStore, getHomePathForRoles } from '@/stores/authStore'

import { authRoutes } from './auth.routes'
import { teacherRoutes } from './teacher.routes'
import { studentDashboardRoutes, studentExamRoutes } from './student.routes'
import { profileRoutes } from './profile.routes'

const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'))
const AuthLayout = lazy(() => import('@/layouts/AuthLayout'))
const ExamLayout = lazy(() => import('@/layouts/ExamLayout'))

const DesignSystemShowcasePage = lazy(() => import('@/pages/dev/DesignSystemShowcasePage'))

export function RoleHomeRedirect() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={getHomePathForRoles(user.roles)} replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        {authRoutes}
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {profileRoutes}
          <Route path="/showcase" element={<DesignSystemShowcasePage />} />
          {teacherRoutes}
          {studentDashboardRoutes}
        </Route>

        <Route element={<ExamLayout />}>
          {studentExamRoutes}
        </Route>
      </Route>

      <Route path="/dashboard" element={<RoleHomeRedirect />} />
      <Route path="/exams" element={<Navigate to="/student/rooms" replace />} />
      <Route path="/questions" element={<Navigate to="/teacher/rooms" replace />} />
      <Route path="/practice" element={<Navigate to="/student/practice" replace />} />
      <Route path="/history" element={<Navigate to="/student/history" replace />} />
      <Route path="/" element={<RoleHomeRedirect />} />
      <Route path="*" element={<RoleHomeRedirect />} />
    </Routes>
  )
}
