import type { ReactNode } from 'react'

import { cn } from '@/core/ui/utils'

export interface PageSectionProps {
  as?: 'section' | 'div' | 'article'
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export function PageSection({
  as: Component = 'section',
  title,
  description,
  actions,
  children,
  className,
  headerClassName,
  contentClassName,
}: PageSectionProps) {
  const hasHeader = Boolean(title || description || actions)

  return (
    <Component className={cn('flex flex-col gap-4', className)}>
      {hasHeader ? (
        <div
          className={cn(
            'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between',
            headerClassName
          )}
        >
          <div className="flex flex-col gap-1">
            {title ? (
              <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2 sm:self-center">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={cn('min-w-0', contentClassName)}>{children}</div>
    </Component>
  )
}
