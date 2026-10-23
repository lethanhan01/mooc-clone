// rogym-convention-exempt: NO_TS_ANY [React.lazy internal generic constraint requires ComponentType<any>]
import { lazy, ComponentType, LazyExoticComponent } from 'react'

/**
 * Lazy Loading with Automatic Chunk Retry (PERF-003)
 * Wraps React.lazy with automatic retry when a dynamic chunk import fails
 * due to transient network drops or new version deployment invalidating older chunks.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  maxRetries = 2,
  intervalMs = 800
): LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      let attempts = 0

      const tryImport = () => {
        attempts++
        componentImport()
          .then(resolve)
          .catch((error) => {
            if (attempts <= maxRetries) {
              setTimeout(tryImport, intervalMs)
            } else {
              // If in browser and chunk failed repeatedly, attempt a one-time force reload
              const hasReloaded = typeof window !== 'undefined' && sessionStorage.getItem('chunk_reload_flag')
              if (!hasReloaded && typeof window !== 'undefined') {
                sessionStorage.setItem('chunk_reload_flag', 'true')
                window.location.reload()
                return
              }
              reject(error)
            }
          })
      }

      tryImport()
    })
  })
}
