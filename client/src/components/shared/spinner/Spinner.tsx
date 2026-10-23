import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import type { SpinnerProps, PageLoaderProps } from './spinner.types'

// Vòng tròn xoay dùng chung cho mọi trạng thái lazy-load / loading.
export function Spinner({ size = 24, className }: Readonly<SpinnerProps>) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent',
        className
      )}
      style={{ width: size, height: size }}
    />
  )
}

// Loader căn giữa cho Suspense fallback ở mức nội dung (trong layout đã render).
export function PageLoader({
  className,
  minHeight = '60vh',
  size = 36,
}: Readonly<PageLoaderProps>) {
  const { t } = useTranslation('common')
  return (
    <output
      aria-label={t('loading')}
      className={cn(
        'flex w-full items-center justify-center text-action-primary',
        className
      )}
      style={{ minHeight }}
    >
      <Spinner size={size} />
    </output>
  )
}

// Loader phủ toàn màn hình cho fallback route-level (App, AuthLayout).
export function FullScreenLoader() {
  const { t } = useTranslation('common')
  return (
    <output
      aria-label={t('loading')}
      className="flex min-h-screen w-full items-center justify-center bg-surface-base text-action-primary"
    >
      <Spinner size={44} />
    </output>
  )
}

export type { SpinnerProps, PageLoaderProps } from './spinner.types'
