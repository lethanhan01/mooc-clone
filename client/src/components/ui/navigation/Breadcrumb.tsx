import * as React from 'react'
import { ChevronRight, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils'

export const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<'nav'> & {
    separator?: React.ReactNode
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />)
Breadcrumb.displayName = 'Breadcrumb'

export const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<'ol'>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      'flex flex-wrap items-center gap-1.5 break-words text-xs text-fg-secondary sm:gap-2',
      className
    )}
    {...props}
  />
))
BreadcrumbList.displayName = 'BreadcrumbList'

export const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('inline-flex items-center gap-1.5 sm:gap-2', className)}
    {...props}
  />
))
BreadcrumbItem.displayName = 'BreadcrumbItem'

export interface BreadcrumbLinkProps
  extends React.ComponentPropsWithoutRef<'a'> {
  to?: string
  href?: string
}

export const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  BreadcrumbLinkProps
>(({ to, href, className, children, ...props }, ref) => {
  const linkClasses = cn(
    'transition-colors hover:text-fg-primary hover:underline underline-offset-4',
    className
  )

  if (to) {
    return (
      <Link
        ref={ref}
        to={to}
        className={linkClasses}
        {...(props as Omit<React.ComponentPropsWithoutRef<typeof Link>, 'to'>)}
      >
        {children}
      </Link>
    )
  }

  return (
    <a ref={ref} href={href} className={linkClasses} {...props}>
      {children}
    </a>
  )
})
BreadcrumbLink.displayName = 'BreadcrumbLink'


export const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-current="page"
    className={cn('font-semibold text-fg-primary truncate max-w-[200px] sm:max-w-none', className)}
    {...props}
  />
))
BreadcrumbPage.displayName = 'BreadcrumbPage'

export function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>) {
  return (
    <li
      aria-hidden="true"
      className={cn('text-fg-dim [&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? <ChevronRight size={14} />}
    </li>
  )
}
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'

export function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden="true"
      className={cn('flex h-9 w-9 items-center justify-center text-fg-dim', className)}
      {...props}
    >
      <MoreHorizontal size={14} />
      <span className="sr-only">Thêm mục</span>
    </span>
  )
}
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis'
