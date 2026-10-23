import { forwardRef } from 'react'
import { cn } from '@/utils'
import {
  labelVariants,
  type LabelProps,
  type LabelVariantsProps,
} from './label-utils'

export type { LabelProps, LabelVariantsProps }

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ htmlFor, required, size, disabled, className, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={cn(labelVariants({ size, disabled }), className)}
        {...props}
      >
        <span>{children}</span>
        {required ? (
          <span className="text-status-danger-fg font-bold" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
    )
  }
)
Label.displayName = 'Label'
