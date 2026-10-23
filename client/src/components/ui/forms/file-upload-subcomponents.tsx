import { type DragEvent, type ReactNode } from 'react'
import { UploadCloud, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react'
import { cn } from '@/utils'
import { Button } from '../actions/Button'
import { ProgressBar } from '../feedback/ProgressBar'
import {
  useFileUploadContext,
  fileUploadDropzoneVariants,
  fileUploadAvatarVariants,
} from './file-upload-utils'

// ─── FileUpload.RemoveButton (top-level) ─────────────────────────────────────

export const FileUploadRemoveButton = ({
  className,
  'aria-label': ariaLabel = 'Xóa tệp',
}: Readonly<{ className?: string; 'aria-label'?: string }>) => {
  const ctx = useFileUploadContext()
  if (!ctx?.previewUrl && !ctx?.value) return null

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={ctx.onClear}
      aria-label={ariaLabel}
      className={cn(
        'relative flex items-center justify-center rounded-full bg-surface-overlay/80 text-fg-primary hover:bg-status-danger-solid hover:text-fg-on-solid transition-colors',
        "after:content-[''] after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2",
        'after:min-h-[44px] after:min-w-[44px] after:w-full after:h-full sm:after:hidden',
        'h-6 w-6 min-h-0 min-w-0 p-0 cursor-pointer touch-manipulation z-10 active:scale-95',
        className
      )}
    >
      <X size={14} />
    </Button>
  )
}
FileUploadRemoveButton.displayName = 'FileUpload.RemoveButton'

// ─── FileUpload.ProgressBar (top-level) ───────────────────────────────────────

export const FileUploadProgressBar = ({ className }: Readonly<{ className?: string }>) => {
  const ctx = useFileUploadContext()
  if (!ctx?.loading) return null

  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-surface-overlay/80 backdrop-blur-xs p-4 z-20',
        className
      )}
      aria-live="polite"
      aria-busy="true"
    >
      <span className="mb-2 text-xs font-semibold text-fg-primary">Đang tải lên...</span>
      <ProgressBar value={ctx.progress ?? 50} tone="accent" className="w-48 max-w-full" />
    </div>
  )
}
FileUploadProgressBar.displayName = 'FileUpload.ProgressBar'

// ─── FileUpload.Preview (top-level) ──────────────────────────────────────────

export const FileUploadPreview = ({ className }: Readonly<{ className?: string }>) => {
  const ctx = useFileUploadContext()
  if (!ctx?.previewUrl) return null

  return (
    <div className={cn('relative flex flex-col items-center gap-3', className)}>
      <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-line-subtle shadow-xs">
        <img src={ctx.previewUrl} alt="File preview" className="h-full w-full object-cover" />
        <div className="absolute right-1 top-1">
          <FileUploadRemoveButton />
        </div>
      </div>
      <Button
        type="button"
        variant="link"
        size="sm"
        disabled={ctx.disabled}
        onClick={ctx.triggerFileSelect}
        className="text-xs text-action-primary font-medium flex items-center gap-1 hover:underline h-auto p-0"
      >
        <CheckCircle2 size={13} /> Nhấn hoặc kéo thả để thay đổi tệp
      </Button>
    </div>
  )
}
FileUploadPreview.displayName = 'FileUpload.Preview'

// ─── FileUpload.Avatar (top-level) ───────────────────────────────────────────

export const FileUploadAvatar = ({ className }: Readonly<{ className?: string }>) => {
  const ctx = useFileUploadContext()

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <button
        type="button"
        disabled={ctx?.disabled}
        onClick={ctx?.triggerFileSelect}
        aria-label="Chọn ảnh đại diện"
        className={cn(
          fileUploadAvatarVariants({ hasError: ctx?.hasError, disabled: ctx?.disabled }),
          'relative'
        )}
      >
        {ctx?.previewUrl ? (
          <img src={ctx.previewUrl} alt="Avatar preview" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon size={24} className="text-fg-muted group-hover:text-fg-primary" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-surface-overlay/70 opacity-0 transition-opacity group-hover:opacity-100">
          <UploadCloud size={20} className="text-fg-primary" />
        </div>
      </button>

      <div className="flex flex-col gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={ctx?.disabled}
          onClick={ctx?.triggerFileSelect}
        >
          Chọn ảnh đại diện
        </Button>
        {ctx?.helperText && <p className="text-xs text-fg-muted">{ctx.helperText}</p>}
        {ctx?.fileError && (
          <p className="text-xs text-status-danger-fg font-medium">{ctx.fileError}</p>
        )}
      </div>
    </div>
  )
}
FileUploadAvatar.displayName = 'FileUpload.Avatar'

// ─── FileUpload.Dropzone (top-level) ─────────────────────────────────────────

export interface FileUploadDropzoneProps {
  children?: ReactNode
  className?: string
  onDragOver?: (e: DragEvent<HTMLDivElement>) => void
  onDragLeave?: (e: DragEvent<HTMLDivElement>) => void
  onDrop?: (e: DragEvent<HTMLDivElement>) => void
}

export const FileUploadDropzone = ({
  children,
  className,
  onDragOver,
  onDragLeave,
  onDrop,
}: Readonly<FileUploadDropzoneProps>) => {
  const ctx = useFileUploadContext()

  if (children) {
    return (
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          fileUploadDropzoneVariants({
            isDragging: ctx?.isDragging,
            hasError: ctx?.hasError,
            disabled: ctx?.disabled,
          }),
          className
        )}
      >
        {children}
        <FileUploadProgressBar />
      </div>
    )
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        fileUploadDropzoneVariants({
          isDragging: ctx?.isDragging,
          hasError: ctx?.hasError,
          disabled: ctx?.disabled,
        }),
        className
      )}
    >
      {ctx?.previewUrl ? (
        <FileUploadPreview />
      ) : (
        <button
          type="button"
          disabled={ctx?.disabled}
          onClick={ctx?.triggerFileSelect}
          className="w-full flex flex-col items-center gap-2 bg-transparent border-0 cursor-pointer p-0 text-center"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-card-hover text-action-primary group-hover:scale-105 transition-transform">
            <UploadCloud size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-fg-primary">{ctx?.placeholder}</p>
            <p className="mt-1 text-xs text-fg-muted">
              {ctx?.helperText ?? `Tối đa ${ctx?.maxSizeMB ?? 5}MB (Hỗ trợ PNG, JPG, WEBP)`}
            </p>
          </div>
        </button>
      )}

      <FileUploadProgressBar />
    </div>
  )
}
FileUploadDropzone.displayName = 'FileUpload.Dropzone'
