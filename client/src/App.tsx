import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ProtectedRoute } from './components/shared/protected-route/ProtectedRoute'
import { FullScreenLoader } from './components/shared/spinner/Spinner'
import { ErrorBoundary } from './components/shared/error-boundary/ErrorBoundary'
import { useTheme } from './stores/themeStore'

const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))
const AuthLayout = lazy(() => import('./layouts/AuthLayout'))

const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const DesignSystemShowcasePage = lazy(() => import('./pages/dev/DesignSystemShowcasePage'))

export default function App() {
  // Sync global theme
  useTheme()

  return (
    <ErrorBoundary>
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          {/* Public Authentication Flow */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Standalone Design System Showcase */}
          <Route path="/showcase" element={<DesignSystemShowcasePage />} />

          {/* Protected Application Flow */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/exams" element={<DashboardPage />} />
              <Route path="/questions" element={<DashboardPage />} />
              <Route path="/feed" element={<DashboardPage />} />
              <Route path="/settings" element={<DashboardPage />} />
            </Route>
          </Route>

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all Not Found Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </Suspense>
    </ErrorBoundary>
  )
}
