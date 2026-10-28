import type { ReactNode } from 'react'

import { RotateCcwIcon } from 'lucide-react'

import { Button } from '@/core/ui/components/button'
import { cn } from '@/core/ui/utils'

export interface FilterBarProps {
  children?: ReactNode
  activeFilters?: ReactNode
  onReset?: () => void
  resetLabel?: string
  className?: string
}

export function FilterBar({
  children,
  activeFilters,
  onReset,
  resetLabel = 'Reset filters',
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/30 p-2.5 text-sm',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {activeFilters ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {activeFilters}
          </div>
        ) : null}
      </div>

      {onReset ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{resetLabel}</span>
        </Button>
      ) : null}
    </div>
  )
}
