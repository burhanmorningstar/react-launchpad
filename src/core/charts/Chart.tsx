import { useState } from 'react'

import { Table as TableIcon } from 'lucide-react'

import { Button } from '@/core/ui/components/button'
import { Skeleton } from '@/core/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/ui/components/table'
import { cn } from '@/core/ui/utils'

import { ChartEmptyState } from './ChartEmptyState'

import type { ChartProps } from './types'

export function Chart({
  data,
  config = {},
  isLoading = false,
  error = null,
  emptyMessage,
  className,
}: ChartProps) {
  const [showTable, setShowTable] = useState(false)
  const {
    title,
    description,
    formatValue = (v) => String(v),
    showTableAlternative = true,
    ariaLabel = title || 'Data chart',
    height = 240,
  } = config

  if (isLoading) {
    return (
      <div
        data-testid="chart-skeleton"
        className={cn('rounded-lg border p-4 space-y-3 bg-card', className)}
      >
        {title && <Skeleton className="h-5 w-40" />}
        <Skeleton className="h-4 w-60" />
        <div style={{ height }}>
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className={cn(
          'rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive',
          className
        )}
      >
        {typeof error === 'string' ? error : error.message}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn('rounded-lg border p-4 bg-card space-y-3', className)}>
        {title && <h3 className="font-semibold text-base">{title}</h3>}
        <ChartEmptyState message={emptyMessage} />
      </div>
    )
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div
      className={cn(
        'rounded-lg border p-4 bg-card text-card-foreground space-y-4',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          {title && <h3 className="font-semibold text-base">{title}</h3>}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        {showTableAlternative && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTable((prev) => !prev)}
            aria-label="View as data table"
            className="h-8 gap-1 text-xs"
          >
            <TableIcon className="h-3.5 w-3.5" />
            {showTable ? 'View Chart' : 'View Table'}
          </Button>
        )}
      </div>

      {showTable ? (
        <div className="rounded-md border overflow-hidden">
          <Table aria-label={`${ariaLabel} tabular format`}>
            <TableHeader>
              <TableRow>
                <TableHead>Category / Label</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((point, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{point.label}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatValue(point.value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div
          role="graphics-document"
          aria-label={ariaLabel}
          className="w-full flex items-end gap-2 pt-6"
          style={{ height }}
        >
          {data.map((point, index) => {
            const heightPercent = Math.max(
              5,
              Math.round((point.value / maxValue) * 100)
            )
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center h-full justify-end group relative"
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-0.5 rounded bg-popover text-popover-foreground text-xs shadow-md pointer-events-none whitespace-nowrap z-10 font-mono">
                  {formatValue(point.value)}
                </div>

                {/* Bar */}
                <div
                  className="w-full max-w-[48px] rounded-t transition-all duration-300 bg-primary group-hover:bg-primary/80"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: point.color,
                  }}
                  role="graphics-symbol"
                  aria-label={`${point.label}: ${formatValue(point.value)}`}
                />

                {/* Label */}
                <span className="mt-2 text-xs text-muted-foreground truncate max-w-full text-center">
                  {point.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
