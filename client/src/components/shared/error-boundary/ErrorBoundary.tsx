import { Component, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw, Home, ChevronDown } from 'lucide-react'
import type { ErrorBoundaryProps, ErrorBoundaryState } from './error-boundary.types'

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    console.error('[ErrorBoundary caught error]:', error, errorInfo)
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  public componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, idx) => key !== prevProps.resetKeys?.[idx]
      )
      if (hasResetKeyChanged) {
        this.resetState()
      }
    }
  }

  public resetState = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    })
  }

  private handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset()
      this.resetState()
    } else {
      this.resetState()
      window.location.reload()
    }
  }

  private handleNavigateHome = () => {
    this.resetState()
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome()
    } else {
      window.location.href = '/'
    }
  }

  public render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-status-danger-border bg-surface-card p-8 text-center shadow-glass"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-status-danger-bg text-status-danger-fg">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h2 className="mt-4 text-xl font-bold text-fg-primary">
            {this.props.fallbackTitle || 'Đã có sự cố xảy ra / An unexpected error occurred'}
          </h2>

          <p className="mt-2 max-w-md text-sm text-fg-secondary">
            {this.props.fallbackMessage ||
              'Đã xảy ra lỗi không mong muốn khi hiển thị nội dung này. Vui lòng thử tải lại trang.'}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-line-subtle bg-surface-sunken px-4 py-2 text-sm font-medium text-fg-primary hover:bg-surface-card-hover transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" /> Thử tải lại / Reload
            </button>

            <button
              type="button"
              onClick={this.handleNavigateHome}
              className="inline-flex items-center gap-2 rounded-xl bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-fg hover:bg-action-primary-hover transition-colors cursor-pointer"
            >
              <Home className="h-4 w-4" /> Về trang chủ / Home
            </button>
          </div>

          {isDev && this.state.error && (
            <div className="mt-6 w-full max-w-2xl text-left">
              <button
                type="button"
                onClick={() => this.setState((s) => ({ showDetails: !s.showDetails }))}
                className="flex items-center gap-1 text-xs text-status-danger-fg hover:underline cursor-pointer"
              >
                <ChevronDown className="h-3 w-3" /> Chi tiết lỗi (Chỉ hiển thị ở chế độ DEV)
              </button>
              {this.state.showDetails && (
                <pre className="mt-2 max-h-60 overflow-auto rounded-xl border border-status-danger-border bg-surface-sunken p-4 font-mono text-xs text-status-danger-fg whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              )}
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export type { ErrorBoundaryProps, ErrorBoundaryState } from './error-boundary.types'
