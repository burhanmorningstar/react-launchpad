# DataTables & List Workflows Guide

React Launchpad provides a production-grade data table powered by **TanStack Table v8**, featuring sorting, multi-column filtering, URL-synced pagination, row selection, column visibility toggling, and export.

---

## 1. DataTable Architecture

The table architecture is organized into reusable compound primitives:

- `DataTable`: Root wrapper coordinating table state, sorting, and pagination.
- `DataTableToolbar`: Search input, faceted filter buttons, and view option dropdowns.
- `DataTableColumnHeader`: Accessible sorting indicators (ascending, descending, neutral).
- `DataTablePagination`: Page size selector, current page count, and next/prev buttons.
- `DataTableSelectionBar`: Floating bulk actions bar when one or more rows are checked.

---

## 2. Defining Columns

```typescript
import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/core/ui/data-table/DataTableColumnHeader'
import { Checkbox } from '@/core/ui/components/checkbox'

export interface UserRow {
  id: string
  name: string
  email: string
  role: string
}

export const columns: ColumnDef<UserRow>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(val) => row.toggleSelected(!!val)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
  },
]
```

---

## 3. URL State Synchronization

Tables integrate seamlessly with `useUrlState`:

- Page numbers, page sizes, sorting columns, and search queries serialize directly into URL search parameters.
- Reloading the page or sharing the link preserves the exact view, filtered results, and selected page.
