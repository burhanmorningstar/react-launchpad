import { BarChart3 } from 'lucide-react'

import { cn } from '@/core/ui/utils'

interface ChartEmptyStateProps {
  message?: string
  className?: string
}

export function ChartEmptyState({
  message = 'No data available to display chart',
  className,
}: ChartEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center bg-muted/20',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <BarChart3 className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
