import type { ReactNode } from 'react'

import { cn } from '@/core/ui/utils'

export interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  breadcrumbs?: ReactNode
  actions?: ReactNode
  meta?: ReactNode
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  meta,
  headingLevel = 1,
  className,
}: PageHeaderProps) {
  const Heading = `h${headingLevel}` as const

  return (
    <header
      className={cn(
        'flex flex-col gap-4 border-b border-border/40 pb-5 md:flex-row md:items-center md:justify-between',
        className
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {breadcrumbs ? (
          <div className="mb-1 text-sm text-muted-foreground">
            {breadcrumbs}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2.5">
          <Heading className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </Heading>
          {meta ? (
            <div className="flex items-center gap-1.5">{meta}</div>
          ) : null}
        </div>
        {description ? (
          <p className="text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-2 md:self-center">
          {actions}
        </div>
      ) : null}
    </header>
  )
}
