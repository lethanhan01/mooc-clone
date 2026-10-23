import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  Children,
  isValidElement,
  type ReactNode,
  type HTMLAttributes,
} from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, type LucideIcon } from 'lucide-react'
import { type Tone, type Emphasis } from '@/lib/variants'

export type AlertTone = Tone
export type AlertEmphasis = Emphasis

export const alertVariants = cva(
  'relative flex items-start gap-3 rounded-xl border p-3.5 sm:p-4 text-sm transition-all',
  {
    variants: {
      tone: {
        success: '',
        warning: '',
        danger: '',
        info: '',
        neutral: '',
        accent: '',
      },
      emphasis: {
        solid: '',
        subtle: '',
        outline: '',
      },
    },
    defaultVariants: {
      tone: 'info',
      emphasis: 'subtle',
    },
  }
)

export type AlertVariantProps = VariantProps<typeof alertVariants>

export interface AlertTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  className?: string
  children?: ReactNode
}

export interface AlertDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  className?: string
  children?: ReactNode
}

export interface AlertIconProps extends HTMLAttributes<HTMLElement> {
  icon?: LucideIcon | ReactNode
  size?: number
  className?: string
  children?: ReactNode
}

export interface AlertActionProps extends HTMLAttributes<HTMLElement> {
  className?: string
  children?: ReactNode
}

export interface AlertCloseButtonProps extends HTMLAttributes<HTMLButtonElement> {
  className?: string
  children?: ReactNode
}

export interface AlertProgressBarProps extends HTMLAttributes<HTMLProgressElement> {
  duration?: number
  className?: string
}

export interface AlertProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  as?: 'aside' | 'section' | 'article'
  tone?: AlertTone
  emphasis?: AlertEmphasis
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  autoDismiss?: number
  showProgressBar?: boolean
  onClose?: () => void
  closeAriaLabel?: string
  className?: string
  children?: ReactNode
}

export interface AlertContextValue {
  tone: Tone
  emphasis: Emphasis
  onClose?: () => void
  closeAriaLabel?: string
  autoDismiss?: number
  isPaused: boolean
}

export const AlertContext = createContext<AlertContextValue | null>(null)
export const useAlertContext = () => useContext(AlertContext)

export function hasChildComponent(children: ReactNode, displayName: string): boolean {
  let found = false
  Children.forEach(children, (child) => {
    if (isValidElement(child) && (child.type as { displayName?: string })?.displayName === displayName) {
      found = true
    }
  })
  return found
}

export function getDefaultAlertIconComponent(tone: Tone): LucideIcon {
  switch (tone) {
    case 'danger':
      return AlertCircle
    case 'warning':
      return AlertTriangle
    case 'success':
      return CheckCircle2
    case 'info':
    case 'neutral':
    case 'accent':
    default:
      return Info
  }
}

export const getDefaultAlertIcon = getDefaultAlertIconComponent

export interface UseAlertAutoDismissOptions {
  autoDismiss?: number
  onClose?: () => void
}

export function useAlertAutoDismiss({ autoDismiss, onClose }: UseAlertAutoDismissOptions) {
  const [isPaused, setIsPaused] = useState(false)
  const remainingTimeRef = useRef<number>(autoDismiss ?? 0)
  const startTimeRef = useRef<number>(Date.now())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const pause = useCallback(() => {
    if (!autoDismiss || autoDismiss <= 0) return
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
      const elapsed = Date.now() - startTimeRef.current
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed)
    }
    setIsPaused(true)
  }, [autoDismiss])

  const resume = useCallback(() => {
    if (!autoDismiss || autoDismiss <= 0 || remainingTimeRef.current <= 0) return
    startTimeRef.current = Date.now()
    setIsPaused(false)
    timerRef.current = setTimeout(() => {
      onCloseRef.current?.()
    }, remainingTimeRef.current)
  }, [autoDismiss])

  useEffect(() => {
    if (!autoDismiss || autoDismiss <= 0) return
    remainingTimeRef.current = autoDismiss
    startTimeRef.current = Date.now()
    setIsPaused(false)

    timerRef.current = setTimeout(() => {
      onCloseRef.current?.()
    }, autoDismiss)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [autoDismiss])

  return { isPaused, pause, resume }
}

export interface UseAlertRuntimePropsOptions {
  tone?: Tone
  emphasis?: Emphasis
  autoDismiss?: number
  onClose?: () => void
  closeAriaLabel?: string
  role?: string
}

export function useAlertRuntimeProps({
  tone = 'info',
  emphasis = 'subtle',
  autoDismiss,
  onClose,
  closeAriaLabel = 'Close alert',
  role,
}: UseAlertRuntimePropsOptions) {
  const { isPaused, pause, resume } = useAlertAutoDismiss({ autoDismiss, onClose })

  const isAlertRole = tone === 'danger' || tone === 'warning'
  const effectiveRole = role ?? (isAlertRole ? 'alert' : 'status')
  const ariaLive: 'assertive' | 'polite' = isAlertRole ? 'assertive' : 'polite'

  const contextValue = useMemo<AlertContextValue>(
    () => ({
      tone,
      emphasis,
      onClose,
      closeAriaLabel,
      autoDismiss,
      isPaused,
    }),
    [tone, emphasis, onClose, closeAriaLabel, autoDismiss, isPaused]
  )

  return {
    isAlertRole,
    effectiveRole,
    ariaLive,
    contextValue,
    isPaused,
    pause,
    resume,
  }
}
