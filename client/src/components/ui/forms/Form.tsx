import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type FormEvent,
  type FormHTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { cn } from '@/utils'

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /**
   * Ngăn chặn việc submit form ngoài ý muốn khi người dùng nhấn Enter trên các ô input văn bản đơn lẻ.
   * Ngoại lệ: Không ngăn Enter trên <textarea> hoặc khi focus trực tiếp trên nút submit.
   * @default false (tuân thủ hành vi web tiêu chuẩn)
   */
  preventEnterSubmit?: boolean
}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  (
    {
      children,
      className,
      noValidate = true,
      preventEnterSubmit = false,
      role,
      onKeyDown,
      onSubmit,
      ...props
    },
    ref
  ) => {
    // Tự động gán role="form" khi form có tên trợ năng (accessible name qua aria-label hoặc aria-labelledby)
    // theo đúng W3C ARIA Authoring Practices Guide (APG)
    const hasAccessibleName = Boolean(props['aria-label'] || props['aria-labelledby'])
    const resolvedRole = role ?? (hasAccessibleName ? 'form' : undefined)

    const innerRef = useRef<HTMLFormElement | null>(null)
    const onKeyDownRef = useRef(onKeyDown)
    onKeyDownRef.current = onKeyDown

    const preventEnterSubmitRef = useRef(preventEnterSubmit)
    preventEnterSubmitRef.current = preventEnterSubmit

    const setFormRef = useCallback(
      (node: HTMLFormElement | null) => {
        innerRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref]
    )

    useEffect(() => {
      const formElement = innerRef.current
      if (!formElement) return

      const handleNativeKeyDown = (e: globalThis.KeyboardEvent) => {
        onKeyDownRef.current?.(e as unknown as KeyboardEvent<HTMLFormElement>)

        if (preventEnterSubmitRef.current && e.key === 'Enter') {
          const target = e.target as HTMLElement | null
          const tagName = target?.tagName?.toUpperCase()

          // Chỉ ngăn chặn hành vi submit ngầm ngoài ý muốn trên các ô input văn bản đơn lẻ
          // Bảo toàn hành vi phím Enter tiêu chuẩn cho <textarea>, <button> (mọi loại), checkbox, radio và custom controls
          if (tagName === 'INPUT') {
            const inputType = (target as HTMLInputElement).type?.toLowerCase()
            const isNonSubmittingInput = [
              'button',
              'submit',
              'reset',
              'checkbox',
              'radio',
              'file',
              'image',
            ].includes(inputType)

            if (!isNonSubmittingInput && !e.defaultPrevented) {
              e.preventDefault()
            }
          }
        }
      }

      formElement.addEventListener('keydown', handleNativeKeyDown)
      return () => {
        formElement.removeEventListener('keydown', handleNativeKeyDown)
      }
    }, [])

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      onSubmit?.(e as Parameters<NonNullable<FormProps['onSubmit']>>[0])
    }

    return (
      <form
        ref={setFormRef}
        className={cn(className)}
        noValidate={noValidate}
        role={resolvedRole}
        onSubmit={handleSubmit}
        {...props}
      >
        {children}
      </form>
    )
  }
)

Form.displayName = 'Form'
