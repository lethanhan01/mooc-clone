import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button, ButtonLink, type ButtonSize, type ButtonVariant } from './Button'
import { cn } from '@/utils'

export interface BackButtonProps {
  to?: string
  label?: string
  onClick?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  iconOnly?: boolean
}

export function BackButton({
  to,
  label = 'Quay lại',
  onClick,
  variant = 'outline',
  size = 'sm',
  className,
  iconOnly = false,
}: Readonly<BackButtonProps>) {
  const navigate = useNavigate()

  if (to) {
    return (
      <ButtonLink
        to={to}
        variant={iconOnly ? 'secondary' : variant}
        size={iconOnly ? 'icon' : size}
        iconSize={iconOnly ? 'sm' : undefined}
        leftIcon={<ArrowLeft size={16} />}
        className={cn('shrink-0', className)}
        aria-label={label}
      >
        {!iconOnly && label}
      </ButtonLink>
    )
  }

  return (
    <Button
      type="button"
      variant={iconOnly ? 'secondary' : variant}
      size={iconOnly ? 'icon' : size}
      iconSize={iconOnly ? 'sm' : undefined}
      leftIcon={<ArrowLeft size={16} />}
      onClick={onClick ?? (() => navigate(-1))}
      className={cn('shrink-0', className)}
      aria-label={label}
    >
      {!iconOnly && label}
    </Button>
  )
}
