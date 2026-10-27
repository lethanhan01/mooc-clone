import { Suspense } from 'react'
import { Toaster } from 'sonner'
import { ErrorBoundary } from './components/shared/error-boundary/ErrorBoundary'
import { FullScreenLoader } from './components/shared/spinner/Spinner'
import { AppRoutes } from './routes/AppRoutes'
import { useTheme } from './stores/themeStore'

export default function App() {
  useTheme()

  return (
    <ErrorBoundary>
      <Suspense fallback={<FullScreenLoader />}>
        <AppRoutes />

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
