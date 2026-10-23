import {
  useState,
  useRef,
  type DragEvent,
  type ChangeEvent,
  type ReactNode,
  forwardRef,
  useMemo,
  useEffect,
} from 'react'
import { cn } from '@/utils'
import { useFormField } from './form-field-context'
import {
  type FileUploadVariant,
  FileUploadContext,
  validateFile,
  createSafeObjectUrl,
  revokeSafeObjectUrl,
} from './file-upload-utils'
import {
  FileUploadDropzone,
  FileUploadAvatar,
  FileUploadPreview,
  FileUploadProgressBar,
  FileUploadRemoveButton,
} from './file-upload-subcomponents'

export type { FileUploadVariant } from './file-upload-utils'
export {
  FileUploadDropzone,
  FileUploadAvatar,
  FileUploadPreview,
  FileUploadProgressBar,
  FileUploadRemoveButton,
  type FileUploadDropzoneProps,
} from './file-upload-subcomponents'

// ─── FileUpload Root Component ───────────────────────────────────────────────

export interface FileUploadProps {
  value?: File | string | null
  onChange?: (file: File | null) => void
  accept?: string
  maxSizeMB?: number
  variant?: FileUploadVariant
  placeholder?: string
  helperText?: string
  disabled?: boolean
  loading?: boolean
  progress?: number
  error?: boolean | string
  className?: string
  children?: ReactNode
}

interface FileUploadComponent
  extends React.ForwardRefExoticComponent<FileUploadProps & React.RefAttributes<HTMLDivElement>> {
  Dropzone: typeof FileUploadDropzone
  Avatar: typeof FileUploadAvatar
  Preview: typeof FileUploadPreview
  ProgressBar: typeof FileUploadProgressBar
  RemoveButton: typeof FileUploadRemoveButton
}

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      value,
      onChange,
      accept = 'image/*',
      maxSizeMB = 5,
      variant = 'dropzone',
      placeholder = 'Kéo thả tệp vào đây hoặc nhấn để chọn',
      helperText,
      disabled = false,
      loading = false,
      progress,
      error,
      className,
      children,
    },
    ref
  ) => {
    const formField = useFormField()
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
      if (typeof value === 'string') return value
      if (value instanceof File) return createSafeObjectUrl(value)
      return null
    })
    const [fileError, setFileError] = useState<string | null>(null)

    const effectiveDisabled = Boolean(disabled || formField?.disabled || loading)
    const effectiveError = error || fileError || formField?.error
    const hasError = Boolean(effectiveError)

    useEffect(() => {
      if (typeof value === 'string') {
        setPreviewUrl(value)
      } else if (value instanceof File) {
        const url = createSafeObjectUrl(value)
        setPreviewUrl(url)
        return () => {
          if (url) revokeSafeObjectUrl(url)
        }
      } else if (value === null) {
        setPreviewUrl(null)
      }
    }, [value])

    function handleFile(file: File | null) {
      if (!file) {
        setPreviewUrl(null)
        setFileError(null)
        onChange?.(null)
        return
      }

      const validationError = validateFile(file, maxSizeMB, accept)
      if (validationError) {
        setFileError(validationError)
        return
      }

      setFileError(null)
      if (file.type.startsWith('image/')) {
        setPreviewUrl(createSafeObjectUrl(file))
      } else {
        setPreviewUrl(null)
      }
      onChange?.(file)
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0] ?? null
      handleFile(file)
    }

    function handleClear(e?: React.MouseEvent) {
      e?.stopPropagation()
      if (inputRef.current) inputRef.current.value = ''
      handleFile(null)
    }

    function triggerFileSelect() {
      if (!effectiveDisabled) {
        inputRef.current?.click()
      }
    }

    const contextValue = useMemo(
      () => ({
        value,
        previewUrl,
        disabled: effectiveDisabled,
        loading,
        hasError,
        fileError,
        progress,
        isDragging,
        accept,
        maxSizeMB,
        placeholder,
        helperText,
        onFileSelect: handleFile,
        onClear: handleClear,
        inputRef,
        triggerFileSelect,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [value, previewUrl, effectiveDisabled, loading, hasError, fileError, progress, isDragging, accept, maxSizeMB, placeholder, helperText]
    )

    const hiddenInput = (
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={effectiveDisabled}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />
    )

    // ── Compound API Mode ─────────────────────────────────────────────────────
    if (children) {
      return (
        <FileUploadContext.Provider value={contextValue}>
          <div ref={ref} className={cn('w-full space-y-2', className)}>
            {hiddenInput}
            {children}
            {fileError && <p className="text-xs text-status-danger-fg font-medium">{fileError}</p>}
          </div>
        </FileUploadContext.Provider>
      )
    }

    // ── Shorthand API Mode ────────────────────────────────────────────────────
    return (
      <FileUploadContext.Provider value={contextValue}>
        <div ref={ref} className={cn('w-full space-y-2', className)}>
          {hiddenInput}

          {variant === 'avatar' ? (
            <FileUploadAvatar />
          ) : (
            <FileUploadDropzone
              onDragOver={(e: DragEvent<HTMLDivElement>) => {
                e.preventDefault()
                if (!effectiveDisabled) setIsDragging(true)
              }}
              onDragLeave={(e: DragEvent<HTMLDivElement>) => {
                e.preventDefault()
                setIsDragging(false)
              }}
              onDrop={(e: DragEvent<HTMLDivElement>) => {
                e.preventDefault()
                setIsDragging(false)
                if (effectiveDisabled) return
                const file = e.dataTransfer.files?.[0] ?? null
                handleFile(file)
              }}
            />
          )}

          {fileError && <p className="text-xs text-status-danger-fg font-medium">{fileError}</p>}
        </div>
      </FileUploadContext.Provider>
    )
  }
) as FileUploadComponent

FileUpload.displayName = 'FileUpload'
FileUpload.Dropzone = FileUploadDropzone
FileUpload.Avatar = FileUploadAvatar
FileUpload.Preview = FileUploadPreview
FileUpload.ProgressBar = FileUploadProgressBar
FileUpload.RemoveButton = FileUploadRemoveButton
