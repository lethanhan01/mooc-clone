import {
  useState, useRef, forwardRef, useMemo,
  type KeyboardEvent, type ReactNode,
} from 'react'
import { Chip, type ChipTone } from '../data-display/Chip'
import { cn } from '@/utils'
import { useFormField } from './form-field-context'
import {
  type TagInputSize, tagInputWrapperVariants,
  TagInputContext, useTagInputContext, normalizeTagInputSize,
} from './tag-input-utils'

export type { TagInputSize } from './tag-input-utils'

const DEFAULT_TAGS: string[] = []

// ─── TagInput.List (top-level sub-component) ─────────────────────────────────

export interface TagListProps {
  children?: ReactNode
  className?: string
}

export const TagList = ({ children, className }: Readonly<TagListProps>) => {
  return (
    <ul className={cn('m-0 flex list-none flex-wrap items-center gap-1.5 p-0', className)}>
      {children}
    </ul>
  )
}
TagList.displayName = 'TagInput.List'

// ─── TagInput.Tag (top-level sub-component) ──────────────────────────────────

export interface TagItemProps {
  tag: string
  index: number
  tone?: ChipTone
  className?: string
}

export const TagItem = ({ tag, index, tone, className }: Readonly<TagItemProps>) => {
  const ctx = useTagInputContext()
  const effectiveTone = tone ?? ctx?.tone ?? 'accent'
  const isRemovable = !ctx?.disabled

  return (
    <li className="inline-flex list-none">
      <Chip
        label={tag}
        tone={effectiveTone}
        size="sm"
        removable={isRemovable}
        onRemove={() => ctx?.removeTag(index)}
        disabled={ctx?.disabled}
        className={className}
      />
    </li>
  )
}
TagItem.displayName = 'TagInput.Tag'

// ─── TagInput.Field (top-level sub-component) ────────────────────────────────

export interface TagFieldProps {
  placeholder?: string
  className?: string
  id?: string
  'aria-label'?: string
}

export const TagField = forwardRef<HTMLInputElement, TagFieldProps>(
  ({ placeholder = 'Nhập thẻ...', className, id, 'aria-label': ariaLabel }, ref) => {
    const ctx = useTagInputContext()
    const formField = useFormField()

    if (ctx?.isFull || ctx?.disabled) return null

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        ctx?.addTag(ctx.inputVal)
      } else if (e.key === 'Backspace' && !ctx?.inputVal && (ctx?.tags.length ?? 0) > 0) {
        ctx?.removeTag(ctx.tags.length - 1)
      }
    }

    return (
      <input
        ref={(node) => {
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
          ctx?.registerInputRef(node)
        }}
        type="text"
        id={id ?? formField?.id}
        aria-label={ariaLabel ?? (placeholder || 'Nhập thẻ')}
        value={ctx?.inputVal ?? ''}
        onChange={(e) => ctx?.setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => ctx?.addTag(ctx.inputVal)}
        placeholder={(ctx?.tags.length ?? 0) === 0 ? placeholder : ''}
        className={cn(
          'flex-1 min-w-[120px] bg-transparent py-1 px-1 text-xs text-fg-primary placeholder:text-fg-muted focus:outline-hidden',
          className
        )}
      />
    )
  }
)
TagField.displayName = 'TagInput.Field'

// ─── TagInput Root Component ─────────────────────────────────────────────────

export interface TagInputProps {
  value?: string[]
  defaultValue?: string[]
  onChange?: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  disabled?: boolean
  tone?: ChipTone
  size?: TagInputSize
  className?: string
  error?: boolean | string
  allowDuplicates?: boolean
  children?: ReactNode
  'aria-label'?: string
}

interface TagInputComponent
  extends React.ForwardRefExoticComponent<TagInputProps & React.RefAttributes<HTMLFieldSetElement>> {
  List: typeof TagList
  Tag: typeof TagItem
  Field: typeof TagField
}

export const TagInput = forwardRef<HTMLFieldSetElement, TagInputProps>(
  (
    {
      value,
      defaultValue = DEFAULT_TAGS,
      onChange,
      placeholder = 'Nhập thẻ và nhấn Enter...',
      maxTags,
      disabled = false,
      tone = 'accent',
      size = 'md',
      className,
      error,
      allowDuplicates = false,
      children,
      'aria-label': ariaLabel = 'Danh sách thẻ',
    },
    ref
  ) => {
    const formField = useFormField()
    const isControlled = value !== undefined
    const [internalTags, setInternalTags] = useState<string[]>(defaultValue)
    const [inputVal, setInputVal] = useState('')
    const inputRef = useRef<HTMLInputElement | null>(null)

    const effectiveTags = isControlled ? (value ?? []) : internalTags
    const effectiveDisabled = disabled || Boolean(formField?.disabled)
    const hasError = Boolean(error || formField?.error)
    const effectiveSize = normalizeTagInputSize(size)
    const isFull = maxTags !== undefined && effectiveTags.length >= maxTags

    function updateTags(nextTags: string[]) {
      if (!isControlled) setInternalTags(nextTags)
      onChange?.(nextTags)
    }

    function addTag(rawTag: string) {
      const tag = rawTag.trim()
      if (!tag) return
      if (!allowDuplicates && effectiveTags.includes(tag)) {
        setInputVal('')
        return
      }
      if (isFull) return
      updateTags([...effectiveTags, tag])
      setInputVal('')
    }

    function removeTag(index: number) {
      if (effectiveDisabled) return
      updateTags(effectiveTags.filter((_, i) => i !== index))
    }

    const contextValue = useMemo(
      () => ({
        tags: effectiveTags,
        disabled: effectiveDisabled,
        hasError,
        size: effectiveSize,
        tone,
        maxTags,
        isFull,
        inputVal,
        setInputVal,
        addTag,
        removeTag,
        registerInputRef: (node: HTMLInputElement | null) => {
          inputRef.current = node
        },
        focusInput: () => inputRef.current?.focus(),
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [effectiveTags, effectiveDisabled, hasError, effectiveSize, tone, maxTags, isFull, inputVal]
    )

    const content = children ?? (
      <>
        <TagList>
          {effectiveTags.map((tag, idx) => (
            <TagItem key={`${tag}-${idx}`} tag={tag} index={idx} tone={tone} />
          ))}
        </TagList>

        <TagField placeholder={placeholder} />
      </>
    )

    return (
      <TagInputContext.Provider value={contextValue}>
        <fieldset
          ref={ref}
          aria-label={ariaLabel}
          className={cn(
            'm-0 min-w-0',
            tagInputWrapperVariants({ hasError, disabled: effectiveDisabled, size: effectiveSize }),
            className
          )}
        >
          <legend className="sr-only">{ariaLabel}</legend>
          {content}
        </fieldset>
      </TagInputContext.Provider>
    )
  }
) as TagInputComponent

TagInput.displayName = 'TagInput'
TagInput.List = TagList
TagInput.Tag = TagItem
TagInput.Field = TagField
