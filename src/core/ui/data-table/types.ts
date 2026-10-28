import type { ReactNode } from 'react'

import type {
  ColumnDef,
  PaginationState,
  SortingState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table'

export interface BaseDataTableProps<TData> {
  data: TData[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[]
  getRowId?: (row: TData, index: number) => string
  isLoading?: boolean
  error?: Error | string | null
  emptyMessage?: string
  className?: string
  ariaLabel?: string
  onRowClick?: (row: TData) => void
  enableRowSelection?: boolean
  selectedRowIds?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  toolbarSlot?: ReactNode
  selectionBarSlot?: (
    selectedCount: number,
    selectedRows: TData[],
    clearSelection: () => void
  ) => ReactNode
  pageSizeOptions?: number[]
  enableColumnVisibility?: boolean
  enableSorting?: boolean
  enablePagination?: boolean
}

export interface ClientDataTableProps<TData> extends BaseDataTableProps<TData> {
  mode?: 'client'
  defaultPageSize?: number
}

export interface ManualDataTableProps<TData> extends BaseDataTableProps<TData> {
  mode: 'manual'
  rowCount: number
  pageCount?: number
  pagination: PaginationState
  onPaginationChange: (pagination: PaginationState) => void
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
}

export type DataTableProps<TData> =
  | ClientDataTableProps<TData>
  | ManualDataTableProps<TData>

export type {
  ColumnDef,
  PaginationState,
  SortingState,
  VisibilityState,
  RowSelectionState,
}
