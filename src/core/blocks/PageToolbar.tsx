import type { ReactNode } from 'react'

import { cn } from '@/core/ui/utils'

export interface PageToolbarProps {
  search?: ReactNode
  filters?: ReactNode
  actions?: ReactNode
  viewToggle?: ReactNode
  children?: ReactNode
  className?: string
}

export function PageToolbar({
  search,
  filters,
  actions,
  viewToggle,
  children,
  className,
}: PageToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {search ? (
          <div className="w-full sm:w-auto sm:min-w-[240px]">{search}</div>
        ) : null}
        {filters ? (
          <div className="flex flex-wrap items-center gap-2">{filters}</div>
        ) : null}
        {children}
      </div>

      {actions || viewToggle ? (
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          {actions}
          {viewToggle}
        </div>
      ) : null}
    </div>
  )
}
