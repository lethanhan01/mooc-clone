import { type ReactNode } from 'react'
import { Button, type ButtonProps } from './Button'

export interface SubmitButtonProps extends Omit<ButtonProps, 'type'> {
  children?: ReactNode
}

export function SubmitButton({
  children = 'Lưu thay đổi',
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  form,
  ...props
}: Readonly<SubmitButtonProps>) {
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled}
      form={form}
      {...props}
    >
      {children}
    </Button>
  )
}
