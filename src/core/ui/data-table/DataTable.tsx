/* eslint-disable react-hooks/incompatible-library -- TanStack Table API is intentionally used */
import { useEffect, useMemo, useState } from 'react'

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { Checkbox } from '@/core/ui/components/checkbox'
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

import { DataTablePagination } from './DataTablePagination'
import { DataTableSelectionBar } from './DataTableSelectionBar'

import type { DataTableProps } from './types'
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'

export function DataTable<TData>({
  data,
  columns: userColumns,
  getRowId,
  isLoading = false,
  error = null,
  emptyMessage = 'No data available',
  className,
  ariaLabel = 'Data table',
  onRowClick,
  enableRowSelection = false,
  selectedRowIds,
  onRowSelectionChange,
  toolbarSlot,
  selectionBarSlot,
  pageSizeOptions = [10, 20, 30, 50],
  enableColumnVisibility: _enableColumnVisibility = true,
  enableSorting = true,
  enablePagination = true,
  ...props
}: DataTableProps<TData>) {
  const isManual = props.mode === 'manual'

  // Internal client states (fallback if not controlled)
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    {
      pageIndex: 0,
      pageSize:
        !isManual && 'defaultPageSize' in props && props.defaultPageSize
          ? props.defaultPageSize
          : (pageSizeOptions[0] ?? 10),
    }
  )
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({})

  // Determine active states
  const sorting = isManual ? (props.sorting ?? []) : internalSorting
  const pagination = isManual ? props.pagination : internalPagination
  const rowSelection = selectedRowIds ?? internalRowSelection

  // Row selection column auto-injection
  const columns = useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!enableRowSelection) return userColumns
    const hasSelect = userColumns.some((col) => col.id === 'select')
    if (hasSelect) return userColumns

    const selectCol: ColumnDef<TData, unknown> = {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all rows"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Select row ${row.id}`}
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }

    return [selectCol, ...userColumns]
  }, [enableRowSelection, userColumns])

  // Automatic recovery when server rowCount shrinks and current page exceeds total in manual mode
  useEffect(() => {
    if (!isManual) return
    const manualProps = props as Extract<
      DataTableProps<TData>,
      { mode: 'manual' }
    >
    const { rowCount, pagination: currentPag, onPaginationChange } = manualProps

    if (
      rowCount > 0 &&
      currentPag.pageIndex * currentPag.pageSize >= rowCount
    ) {
      const maxPageIndex = Math.max(
        0,
        Math.ceil(rowCount / currentPag.pageSize) - 1
      )
      onPaginationChange({
        pageIndex: maxPageIndex,
        pageSize: currentPag.pageSize,
      })
    }
  }, [isManual, props])

  // Setup table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      columnVisibility,
      columnFilters,
      rowSelection,
    },
    // Row ID mapping
    getRowId:
      getRowId ??
      ((row: TData, index: number) => {
        if (typeof row === 'object' && row !== null && 'id' in row) {
          return String((row as { id: unknown }).id)
        }
        return String(index)
      }),
    // Selection
    enableRowSelection,
    onRowSelectionChange: (updaterOrValue) => {
      const nextSelection =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(rowSelection)
          : updaterOrValue

      if (onRowSelectionChange) {
        onRowSelectionChange(nextSelection)
      } else {
        setInternalRowSelection(nextSelection)
      }
    },
    // Sorting
    enableSorting,
    onSortingChange: (updaterOrValue) => {
      const nextSorting =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(sorting)
          : updaterOrValue

      if (isManual && 'onSortingChange' in props && props.onSortingChange) {
        props.onSortingChange(nextSorting)
      } else {
        setInternalSorting(nextSorting)
      }
    },
    manualSorting: isManual,
    // Pagination
    onPaginationChange: (updaterOrValue) => {
      const nextPagination =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(pagination)
          : updaterOrValue

      if (isManual && 'onPaginationChange' in props) {
        props.onPaginationChange(nextPagination)
      } else {
        setInternalPagination(nextPagination)
      }
    },
    manualPagination: isManual,
    rowCount: isManual ? (props as { rowCount: number }).rowCount : undefined,
    pageCount:
      isManual && 'pageCount' in props && props.pageCount !== undefined
        ? props.pageCount
        : undefined,
    // Visibility & Filters
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    // Row models
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: !isManual ? getSortedRowModel() : undefined,
    getPaginationRowModel:
      enablePagination && !isManual ? getPaginationRowModel() : undefined,
    getFilteredRowModel: !isManual ? getFilteredRowModel() : undefined,
  })

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original)
  const selectedCount = selectedRows.length

  return (
    <div className={cn('w-full space-y-3', className)}>
      {toolbarSlot}

      {enableRowSelection &&
        (selectionBarSlot ? (
          selectionBarSlot(selectedCount, selectedRows, () =>
            table.resetRowSelection()
          )
        ) : (
          <DataTableSelectionBar
            selectedCount={selectedCount}
            selectedRows={selectedRows}
            clearSelection={() => table.resetRowSelection()}
          />
        ))}

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {typeof error === 'string' ? error : error.message}
        </div>
      ) : null}

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table aria-label={ariaLabel}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className="whitespace-nowrap font-medium"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <tr data-testid="data-table-skeleton">
                  <td colSpan={columns.length} className="p-4 space-y-3">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      onRowClick && 'cursor-pointer hover:bg-muted/50'
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="max-w-[300px] truncate"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {enablePagination && (
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      )}
    </div>
  )
}
