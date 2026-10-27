import { lazy } from 'react'
import { Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/shared/protected-route/ProtectedRoute'

const TeacherDashboardPage = lazy(() => import('@/pages/teacher/TeacherDashboardPage'))
const TeacherRoomsPage = lazy(() => import('@/pages/teacher/TeacherRoomsPage'))
const TeacherRoomCreatePage = lazy(() => import('@/pages/teacher/TeacherRoomCreatePage'))
const TeacherRoomQuestionsPage = lazy(() => import('@/pages/teacher/TeacherRoomQuestionsPage'))
const TeacherRoomMonitorPage = lazy(() => import('@/pages/teacher/TeacherRoomMonitorPage'))
const TeacherRoomResultsPage = lazy(() => import('@/pages/teacher/TeacherRoomResultsPage'))
const TeacherReportsPage = lazy(() => import('@/pages/teacher/TeacherReportsPage'))
const TeacherSystemLogsPage = lazy(() => import('@/pages/teacher/TeacherSystemLogsPage'))

export const teacherRoutes = (
  <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
    <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
    <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
    <Route path="/teacher/rooms" element={<TeacherRoomsPage />} />
    <Route path="/teacher/rooms/create" element={<TeacherRoomCreatePage />} />
    <Route path="/teacher/rooms/:roomId/questions" element={<TeacherRoomQuestionsPage />} />
    <Route path="/teacher/rooms/:roomId/monitor" element={<TeacherRoomMonitorPage />} />
    <Route path="/teacher/rooms/:roomId/results" element={<TeacherRoomResultsPage />} />
    <Route path="/teacher/reports" element={<TeacherReportsPage />} />
    <Route path="/teacher/logs" element={<TeacherSystemLogsPage />} />
  </Route>
)
