import { cva, type VariantProps } from 'class-variance-authority'
import type { Tone, Size } from '@/lib/variants'
import { toneClasses } from '@/lib/tone-styles'

export type AvatarSize = Size | '2xl' | 'hero'
export type AvatarShape = 'circle' | 'rounded'
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away'
export type AvatarTone = Tone | 'auto'

export const avatarVariants = cva(
  'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden transition-colors',
  {
    variants: {
      size: {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
        '2xl': 'w-20 h-20',
        hero: 'w-24 h-24',
      },
      shape: {
        circle: 'rounded-full',
        rounded: 'rounded-2xl',
      },
      border: {
        true: 'border shadow-xs',
        false: 'border-0',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
      border: true,
    },
  }
)

export type AvatarVariantProps = VariantProps<typeof avatarVariants>

export const SIZE_CLASSES: Record<
  AvatarSize,
  { container: string; text: string; iconSize: number; statusSize: string }
> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', iconSize: 12, statusSize: 'w-1.5 h-1.5 ring-1' },
  sm: { container: 'w-8 h-8', text: 'text-xs', iconSize: 15, statusSize: 'w-2 h-2 ring-1' },
  md: { container: 'w-10 h-10', text: 'text-sm font-semibold', iconSize: 18, statusSize: 'w-2.5 h-2.5 ring-2' },
  lg: { container: 'w-12 h-12', text: 'text-base font-semibold', iconSize: 22, statusSize: 'w-3 h-3 ring-2' },
  xl: { container: 'w-16 h-16', text: 'text-lg font-bold', iconSize: 28, statusSize: 'w-3.5 h-3.5 ring-2' },
  '2xl': { container: 'w-20 h-20', text: 'text-xl font-bold', iconSize: 36, statusSize: 'w-4 h-4 ring-2' },
  hero: { container: 'w-24 h-24', text: 'text-2xl font-black', iconSize: 44, statusSize: 'w-5 h-5 ring-2' },
}

export const STATUS_COLORS: Record<AvatarStatus, string> = {
  online: 'bg-status-success-solid',
  busy: 'bg-status-danger-solid',
  away: 'bg-status-warning-solid',
  offline: 'bg-fg-muted',
}

export const AUTO_TONES: Tone[] = ['accent', 'success', 'info', 'warning', 'danger']

export function hashTone(name?: string): Tone {
  if (!name) return 'accent'
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (name.codePointAt(i) ?? 0) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % AUTO_TONES.length
  return AUTO_TONES[index]
}

export function resolveAvatarToneClasses(tone: AvatarTone = 'auto', name?: string, alt?: string): string {
  const resolvedTone: Tone = tone === 'auto' ? hashTone(name || alt) : tone
  return toneClasses(resolvedTone, 'subtle')
}

export function getInitials(name?: string): string {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + (parts.at(-1)?.[0] ?? '')).toUpperCase()
}
