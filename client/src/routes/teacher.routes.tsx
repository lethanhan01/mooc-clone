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
const TeacherQuestionBanksPage = lazy(() => import('@/pages/teacher/question-banks/TeacherQuestionBanksPage'))
const TeacherQuestionBankDetailPage = lazy(
  () => import('@/pages/teacher/question-banks/TeacherQuestionBankDetailPage')
)
const TeacherQuestionImportPage = lazy(() => import('@/pages/teacher/question-banks/TeacherQuestionImportPage'))
const TeacherQuestionFormPage = lazy(() => import('@/pages/teacher/question-banks/TeacherQuestionFormPage'))
const TeacherExamsPage = lazy(() => import('@/pages/teacher/exams/TeacherExamsPage'))
const TeacherExamGeneratePage = lazy(() => import('@/pages/teacher/exams/TeacherExamGeneratePage'))
const TeacherExamDetailPage = lazy(() => import('@/pages/teacher/exams/TeacherExamDetailPage'))
const TeacherRoomAssignPage = lazy(() => import('@/pages/teacher/rooms/TeacherRoomAssignPage'))
const TeacherRoomLogsPage = lazy(() => import('@/pages/teacher/rooms/TeacherRoomLogsPage'))
const TeacherStudentsImportPage = lazy(() => import('@/pages/teacher/students/TeacherStudentsImportPage'))

export const teacherRoutes = (
  <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
    <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
    <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
    <Route path="/teacher/question-banks" element={<TeacherQuestionBanksPage />} />
    <Route path="/teacher/question-banks/:bankId" element={<TeacherQuestionBankDetailPage />} />
    <Route path="/teacher/question-banks/:bankId/import" element={<TeacherQuestionImportPage />} />
    <Route path="/teacher/question-banks/:bankId/questions/new" element={<TeacherQuestionFormPage />} />
    <Route path="/teacher/exams" element={<TeacherExamsPage />} />
    <Route path="/teacher/exams/generate" element={<TeacherExamGeneratePage />} />
    <Route path="/teacher/exams/:examId" element={<TeacherExamDetailPage />} />
    <Route path="/teacher/rooms" element={<TeacherRoomsPage />} />
    <Route path="/teacher/rooms/create" element={<TeacherRoomCreatePage />} />
    <Route path="/teacher/rooms/:roomId/questions" element={<TeacherRoomQuestionsPage />} />
    <Route path="/teacher/rooms/:roomId/monitor" element={<TeacherRoomMonitorPage />} />
    <Route path="/teacher/rooms/:roomId/results" element={<TeacherRoomResultsPage />} />
    <Route path="/teacher/rooms/:roomId/assign" element={<TeacherRoomAssignPage />} />
    <Route path="/teacher/rooms/:roomId/logs" element={<TeacherRoomLogsPage />} />
    <Route path="/teacher/students/import" element={<TeacherStudentsImportPage />} />
    <Route path="/teacher/reports" element={<TeacherReportsPage />} />
    <Route path="/teacher/logs" element={<TeacherSystemLogsPage />} />
  </Route>
)
