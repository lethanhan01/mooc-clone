import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ProtectedRoute } from './components/shared/protected-route/ProtectedRoute'
import { FullScreenLoader } from './components/shared/spinner/Spinner'
import { ErrorBoundary } from './components/shared/error-boundary/ErrorBoundary'
import { useTheme } from './stores/themeStore'
import { useAuthStore } from './stores/authStore'
import { getHomePathForRoles } from './stores/mockExamStore'

const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))
const AuthLayout = lazy(() => import('./layouts/AuthLayout'))
const ExamLayout = lazy(() => import('./layouts/ExamLayout'))

const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))
const DesignSystemShowcasePage = lazy(() => import('./pages/dev/DesignSystemShowcasePage'))

const TeacherDashboardPage = lazy(() => import('./pages/teacher/TeacherDashboardPage'))
const TeacherRoomsPage = lazy(() => import('./pages/teacher/TeacherRoomsPage'))
const TeacherRoomCreatePage = lazy(() => import('./pages/teacher/TeacherRoomCreatePage'))
const TeacherRoomQuestionsPage = lazy(() => import('./pages/teacher/TeacherRoomQuestionsPage'))
const TeacherRoomMonitorPage = lazy(() => import('./pages/teacher/TeacherRoomMonitorPage'))
const TeacherRoomResultsPage = lazy(() => import('./pages/teacher/TeacherRoomResultsPage'))
const TeacherReportsPage = lazy(() => import('./pages/teacher/TeacherReportsPage'))
const TeacherSystemLogsPage = lazy(() => import('./pages/teacher/TeacherSystemLogsPage'))

const StudentDashboardPage = lazy(() => import('./pages/student/StudentDashboardPage'))
const StudentRoomsPage = lazy(() => import('./pages/student/StudentRoomsPage'))
const StudentWaitingRoomPage = lazy(() => import('./pages/student/StudentWaitingRoomPage'))
const StudentLiveExamPage = lazy(() => import('./pages/student/StudentLiveExamPage'))
const StudentExamSummaryPage = lazy(() => import('./pages/student/StudentExamSummaryPage'))
const StudentExamReviewPage = lazy(() => import('./pages/student/StudentExamReviewPage'))
const StudentPracticeTopicsPage = lazy(() => import('./pages/student/StudentPracticeTopicsPage'))
const StudentPracticeExamPage = lazy(() => import('./pages/student/StudentPracticeExamPage'))
const StudentPracticeResultPage = lazy(() => import('./pages/student/StudentPracticeResultPage'))
const StudentHistoryPage = lazy(() => import('./pages/student/StudentHistoryPage'))

function RoleHomeRedirect() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={getHomePathForRoles(user.roles)} replace />
}

export default function App() {
  useTheme()

  return (
    <ErrorBoundary>
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<ProfilePage />} />
              <Route path="/showcase" element={<DesignSystemShowcasePage />} />

              <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
                <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
                <Route path="/teacher/rooms" element={<TeacherRoomsPage />} />
                <Route path="/teacher/rooms/create" element={<TeacherRoomCreatePage />} />
                <Route path="/teacher/rooms/:roomId/questions" element={<TeacherRoomQuestionsPage />} />
                <Route path="/teacher/rooms/:roomId/monitor" element={<TeacherRoomMonitorPage />} />
                <Route path="/teacher/rooms/:roomId/results" element={<TeacherRoomResultsPage />} />
                <Route path="/teacher/reports" element={<TeacherReportsPage />} />
                <Route path="/teacher/logs" element={<TeacherSystemLogsPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['student', 'user', 'admin']} />}>
                <Route path="/student/dashboard" element={<StudentDashboardPage />} />
                <Route path="/student/rooms" element={<StudentRoomsPage />} />
                <Route path="/student/rooms/:roomId/waiting" element={<StudentWaitingRoomPage />} />
                <Route path="/student/rooms/:roomId/summary" element={<StudentExamSummaryPage />} />
                <Route path="/student/rooms/:roomId/review" element={<StudentExamReviewPage />} />
                <Route path="/student/practice" element={<StudentPracticeTopicsPage />} />
                <Route path="/student/practice/result" element={<StudentPracticeResultPage />} />
                <Route path="/student/history" element={<StudentHistoryPage />} />
              </Route>
            </Route>

            <Route element={<ExamLayout />}>
              <Route element={<ProtectedRoute allowedRoles={['student', 'user', 'admin']} />}>
                <Route path="/student/rooms/:roomId/exam" element={<StudentLiveExamPage />} />
                <Route path="/student/practice/exam" element={<StudentPracticeExamPage />} />
              </Route>
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

        <Toaster
          position="top-right"
          closeButton
          duration={2000}
          toastOptions={{
            duration: 2000,
            className: 'rogym-toast',
            unstyled: true,
          }}
        />
      </Suspense>
    </ErrorBoundary>
  )
}
