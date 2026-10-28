import type { ReactNode } from 'react'

import { X } from 'lucide-react'

import { Button } from '@/core/ui/components/button'
import { Input } from '@/core/ui/components/input'

import { DataTableViewOptions } from './DataTableViewOptions'

import type { Table } from '@tanstack/react-table'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchColumnId?: string
  searchPlaceholder?: string
  enableColumnVisibility?: boolean
  children?: ReactNode
}

export function DataTableToolbar<TData>({
  table,
  searchColumnId,
  searchPlaceholder = 'Filter items...',
  enableColumnVisibility = true,
  children,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const searchColumn = searchColumnId ? table.getColumn(searchColumnId) : null

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-2">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {searchColumn && (
          <Input
            placeholder={searchPlaceholder}
            value={(searchColumn.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              searchColumn.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}

        {children}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {enableColumnVisibility && <DataTableViewOptions table={table} />}
    </div>
  )
}
