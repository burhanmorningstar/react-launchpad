import { useState } from 'react'

import { MemoryRouter } from 'react-router'

import { useDebouncedValue } from '@/core/hooks'
import { queryParsers, useUrlState } from '@/core/routing'
import { Badge } from '@/core/ui/components/badge'

import { DataTable } from './DataTable'
import { DataTableColumnHeader } from './DataTableColumnHeader'

import type { ColumnDef, PaginationState } from './types'
import type { Meta, StoryObj } from '@storybook/react-vite'

interface Invoice {
  id: string
  invoiceNumber: string
  customer: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  notes: string
  issuedAt: string
}

const mockInvoices: Invoice[] = [
  {
    id: 'inv-1001',
    invoiceNumber: 'INV-2026-0001',
    customer: 'Acme International Corporation Holdings Ltd.',
    amount: 1450250.75,
    status: 'paid',
    notes:
      'Quarterly licensing fee for enterprise cloud services and premium technical support agreement across EMEA region.',
    issuedAt: '2026-01-15',
  },
  {
    id: 'inv-1002',
    invoiceNumber: 'INV-2026-0002',
    customer: 'Starlight Media Studios',
    amount: 87400.0,
    status: 'pending',
    notes: 'Post-production rendering and 3D visual effects milestone 2.',
    issuedAt: '2026-02-10',
  },
  {
    id: 'inv-1003',
    invoiceNumber: 'INV-2026-0003',
    customer: 'Nordic Clean Technologies AB',
    amount: 520000.0,
    status: 'overdue',
    notes: 'Renewable energy grid simulation platform consulting.',
    issuedAt: '2026-01-05',
  },
  {
    id: 'inv-1004',
    invoiceNumber: 'INV-2026-0004',
    customer: 'Apex Logistics & Freight Global',
    amount: 9450000.5,
    status: 'paid',
    notes: 'Automated warehouse tracking hardware firmware upgrade.',
    issuedAt: '2026-03-01',
  },
  {
    id: 'inv-1005',
    invoiceNumber: 'INV-2026-0005',
    customer: 'CyberGuard Systems Inc.',
    amount: 32000.25,
    status: 'pending',
    notes: 'Security penetration audit and SOC2 certification assistance.',
    issuedAt: '2026-03-12',
  },
]

const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: 'invoiceNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Invoice #" />
    ),
    cell: ({ row }) => (
      <span className="font-mono font-medium">
        {row.original.invoiceNumber}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.original.customer}>
        {row.original.customer}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-right block">
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(row.original.amount)}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status
      const variant =
        status === 'paid'
          ? 'default'
          : status === 'pending'
            ? 'secondary'
            : 'destructive'
      return <Badge variant={variant}>{status.toUpperCase()}</Badge>
    },
    enableSorting: true,
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }) => (
      <div
        className="max-w-[280px] truncate text-muted-foreground"
        title={row.original.notes}
      >
        {row.original.notes}
      </div>
    ),
  },
  {
    accessorKey: 'issuedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => <span>{row.original.issuedAt}</span>,
    enableSorting: true,
  },
]

const meta: Meta = {
  title: 'Core/UI/DataTable',
  component: DataTable,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="p-6 max-w-5xl mx-auto space-y-4">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
}

export default meta

export const ClientMode: StoryObj = {
  render: () => {
    return (
      <DataTable
        data={mockInvoices}
        columns={columns}
        enableRowSelection
        enableColumnVisibility
        enableSorting
        enablePagination
        defaultPageSize={5}
        getRowId={(row) => row.id}
      />
    )
  },
}

export const ManualModeWithUrlState: StoryObj = {
  render: () => {
    const urlSchema = {
      page: queryParsers.number({ defaultValue: 1, min: 1, max: 100 }),
      pageSize: queryParsers.number({ defaultValue: 2, min: 1, max: 50 }),
      q: queryParsers.string(''),
    }

    const { state, setParams } = useUrlState(urlSchema, {
      resetOnUpdate: {
        triggerKeys: ['q'],
        resetKeys: ['page'],
      },
    })

    const [searchInput, setSearchInput] = useState(state.q)
    const debouncedSearch = useDebouncedValue(searchInput, 300)

    // Simulate filtered and paginated data
    const filtered = mockInvoices.filter((inv) =>
      debouncedSearch
        ? inv.customer.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          inv.invoiceNumber
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase())
        : true
    )

    const pageIndex = state.page - 1
    const pagedData = filtered.slice(
      pageIndex * state.pageSize,
      pageIndex * state.pageSize + state.pageSize
    )

    const pagination: PaginationState = {
      pageIndex,
      pageSize: state.pageSize,
    }

    const onPaginationChange = (next: PaginationState) => {
      setParams({
        page: next.pageIndex + 1,
        pageSize: next.pageSize,
      })
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            className="border rounded px-3 py-1 text-sm bg-background text-foreground"
            placeholder="Search customer or invoice..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              setParams({ q: e.target.value })
            }}
          />
          <span className="text-xs text-muted-foreground font-mono">
            URL: ?page={state.page}&pageSize={state.pageSize}
            {state.q ? `&q=${encodeURIComponent(state.q)}` : ''}
          </span>
        </div>

        <DataTable
          mode="manual"
          data={pagedData}
          rowCount={filtered.length}
          columns={columns}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          getRowId={(row) => row.id}
          enableRowSelection
          pageSizeOptions={[2, 4, 10]}
        />
      </div>
    )
  },
}

export const LoadingState: StoryObj = {
  render: () => (
    <DataTable
      data={[]}
      columns={columns}
      isLoading={true}
      getRowId={(row) => row.id}
    />
  ),
}

export const EmptyState: StoryObj = {
  render: () => (
    <DataTable
      data={[]}
      columns={columns}
      emptyMessage="No invoices found matching your search criteria."
      getRowId={(row) => row.id}
    />
  ),
}
