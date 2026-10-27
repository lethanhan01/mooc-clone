import { lazy } from 'react'
import { Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/shared/protected-route/ProtectedRoute'

const StudentDashboardPage = lazy(() => import('@/pages/student/StudentDashboardPage'))
const StudentRoomsPage = lazy(() => import('@/pages/student/StudentRoomsPage'))
const StudentWaitingRoomPage = lazy(() => import('@/pages/student/StudentWaitingRoomPage'))
const StudentLiveExamPage = lazy(() => import('@/pages/student/StudentLiveExamPage'))
const StudentExamSummaryPage = lazy(() => import('@/pages/student/StudentExamSummaryPage'))
const StudentExamReviewPage = lazy(() => import('@/pages/student/StudentExamReviewPage'))
const StudentPracticeTopicsPage = lazy(() => import('@/pages/student/StudentPracticeTopicsPage'))
const StudentPracticeExamPage = lazy(() => import('@/pages/student/StudentPracticeExamPage'))
const StudentPracticeResultPage = lazy(() => import('@/pages/student/StudentPracticeResultPage'))
const StudentHistoryPage = lazy(() => import('@/pages/student/StudentHistoryPage'))

export const studentDashboardRoutes = (
  <Route element={<ProtectedRoute allowedRoles={['student', 'user', 'admin']} />}>
    <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
    <Route path="/student/dashboard" element={<StudentDashboardPage />} />
    <Route path="/student/rooms" element={<StudentRoomsPage />} />
    <Route path="/student/rooms/:roomId/waiting" element={<StudentWaitingRoomPage />} />
    <Route path="/student/rooms/:roomId/summary" element={<StudentExamSummaryPage />} />
    <Route path="/student/rooms/:roomId/review" element={<StudentExamReviewPage />} />
    <Route path="/student/practice" element={<StudentPracticeTopicsPage />} />
    <Route path="/student/practice/result" element={<StudentPracticeResultPage />} />
    <Route path="/student/history" element={<StudentHistoryPage />} />
  </Route>
)

export const studentExamRoutes = (
  <Route element={<ProtectedRoute allowedRoles={['student', 'user', 'admin']} />}>
    <Route path="/student/rooms/:roomId/exam" element={<StudentLiveExamPage />} />
    <Route path="/student/practice/exam" element={<StudentPracticeExamPage />} />
  </Route>
)
