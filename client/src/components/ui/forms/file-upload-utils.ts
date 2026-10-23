import { createContext, useContext } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

// ─── Types ───────────────────────────────────────────────────────────────────

export type FileUploadVariant = 'dropzone' | 'avatar' | 'compact'

// ─── CVA Variants ─────────────────────────────────────────────────────────────

/**
 * CVA variants cho vùng kéo thả Dropzone của FileUpload.
 * 100% Semantic Design Tokens: bg-surface-*, border-line-*, focus/hover rings.
 */
export const fileUploadDropzoneVariants = cva(
  [
    'group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-all duration-150',
    'p-6 cursor-pointer outline-hidden',
  ],
  {
    variants: {
      isDragging: {
        true: 'border-action-primary bg-action-primary/10 ring-2 ring-focus-ring',
        false: 'border-line-default bg-surface-sunken hover:border-line-strong hover:bg-surface-card-hover',
      },
      hasError: {
        true: 'border-status-danger-border bg-status-danger-bg text-status-danger-fg',
        false: '',
      },
      disabled: {
        true: 'pointer-events-none opacity-40 cursor-not-allowed bg-surface-sunken',
        false: '',
      },
    },
    defaultVariants: {
      isDragging: false,
      hasError: false,
      disabled: false,
    },
  }
)

export type FileUploadDropzoneVariantsProps = VariantProps<typeof fileUploadDropzoneVariants>

/** CVA variants cho nút tải ảnh đại diện Avatar */
export const fileUploadAvatarVariants = cva(
  [
    'group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-all p-0 outline-hidden',
    'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1',
  ],
  {
    variants: {
      hasError: {
        true: 'border-status-danger-border text-status-danger-fg',
        false: 'border-line-default bg-surface-sunken hover:border-action-primary hover:bg-surface-card-hover',
      },
      disabled: {
        true: 'pointer-events-none opacity-40 cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      hasError: false,
      disabled: false,
    },
  }
)

export type FileUploadAvatarVariantsProps = VariantProps<typeof fileUploadAvatarVariants>

// ─── Context ──────────────────────────────────────────────────────────────────

export interface FileUploadContextValue {
  value?: File | string | null
  previewUrl: string | null
  disabled: boolean
  loading: boolean
  hasError: boolean
  fileError: string | null
  progress?: number
  isDragging: boolean
  accept?: string
  maxSizeMB: number
  placeholder: string
  helperText?: string
  onFileSelect: (file: File | null) => void
  onClear: (e?: React.MouseEvent) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  triggerFileSelect: () => void
}

export const FileUploadContext = createContext<FileUploadContextValue | null>(null)

export function useFileUploadContext(): FileUploadContextValue | null {
  return useContext(FileUploadContext)
}

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function validateFile(file: File, maxSizeMB: number, accept?: string): string | null {
  if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
    return `Kích thước tệp vượt quá ${maxSizeMB}MB`
  }
  if (accept && accept !== '*/*' && !accept.includes('*')) {
    const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase())
    const fileType = file.type.toLowerCase()
    const fileName = file.name.toLowerCase()
    const matches = acceptedTypes.some((pattern) => {
      if (pattern.startsWith('.')) return fileName.endsWith(pattern)
      return fileType === pattern
    })
    if (!matches) {
      return `Định dạng tệp không được hỗ trợ (${accept})`
    }
  }
  return null
}

export function createSafeObjectUrl(file: File): string | null {
  if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    try {
      return URL.createObjectURL(file)
    } catch {
      return null
    }
  }
  return null
}

export function revokeSafeObjectUrl(url: string): void {
  if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
    try {
      URL.revokeObjectURL(url)
    } catch {
      // ignore
    }
  }
}

