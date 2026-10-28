import type { HTMLAttributes } from 'react'

import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'

import { Button } from '@/core/ui/components/button'
import { cn } from '@/core/ui/utils'

import type { Column } from '@tanstack/react-table'

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  const isSorted = column.getIsSorted()
  const ariaSort =
    isSorted === 'desc'
      ? 'descending'
      : isSorted === 'asc'
        ? 'ascending'
        : 'none'

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 hover:bg-accent hover:text-accent-foreground font-medium"
        aria-label={`Sort ${title}`}
        aria-sort={ariaSort}
        onClick={() => column.toggleSorting(isSorted === 'asc')}
      >
        <span>{title}</span>
        {isSorted === 'desc' ? (
          <ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
        ) : isSorted === 'asc' ? (
          <ArrowUp className="ml-2 h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronsUpDown className="ml-2 h-4 w-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  )
}
