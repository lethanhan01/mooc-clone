import React, { useMemo } from 'react'
import DOMPurify from 'dompurify'
import { cn } from '@/utils'

export interface SanitizedHTMLProps extends React.HTMLAttributes<HTMLDivElement> {
  html: string
  allowedTags?: string[]
  allowedAttributes?: string[]
}

/**
 * SanitizedHTML Component (SEC-001)
 * Safely renders HTML strings by sanitizing with DOMPurify to eliminate XSS risks.
 */
export const SanitizedHTML: React.FC<SanitizedHTMLProps> = ({
  html,
  allowedTags,
  allowedAttributes,
  className,
  ...props
}) => {
  const cleanHtml = useMemo(() => {
    if (!html) return ''

    const config: Parameters<typeof DOMPurify.sanitize>[1] = {}
    if (allowedTags) {
      config.ALLOWED_TAGS = allowedTags
    }
    if (allowedAttributes) {
      config.ALLOWED_ATTR = allowedAttributes
    }

    return DOMPurify.sanitize(html, config)
  }, [html, allowedTags, allowedAttributes])

  // rogym-convention-exempt: NO_DANGEROUS_HTML [Sanitized via DOMPurify]
  const dangerousHtmlProps = { dangerouslySetInnerHTML: { __html: cleanHtml } }

  return (
    <div
      className={cn('prose dark:prose-invert max-w-none text-surface-card-fg', className)}
      {...dangerousHtmlProps}
      {...props}
    />
  )
}

SanitizedHTML.displayName = 'SanitizedHTML'
