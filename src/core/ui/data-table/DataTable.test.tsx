import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DataTable } from './DataTable'
import { DataTableColumnHeader } from './DataTableColumnHeader'

import type { ColumnDef, PaginationState } from './types'

interface TestUser {
  id: string
  name: string
  role: string
  score: number
}

const mockUsers: TestUser[] = [
  { id: 'usr-1', name: 'Alice Smith', role: 'admin', score: 95 },
  { id: 'usr-2', name: 'Bob Jones', role: 'user', score: 70 },
  { id: 'usr-3', name: 'Charlie Brown', role: 'editor', score: 85 },
  { id: 'usr-4', name: 'Diana Prince', role: 'admin', score: 99 },
  { id: 'usr-5', name: 'Evan Wright', role: 'user', score: 60 },
]

const testColumns: ColumnDef<TestUser>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Name" />
    ),
    cell: ({ row }) => <span>{row.original.name}</span>,
    enableSorting: true,
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <span>{row.original.role}</span>,
  },
  {
    accessorKey: 'score',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Score" />
    ),
    cell: ({ row }) => <span>{row.original.score}</span>,
    enableSorting: true,
  },
]

describe('DataTable', () => {
  describe('client mode', () => {
    it('renders data and handles client-side sorting', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={testColumns}
          getRowId={(u) => u.id}
        />
      )

      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Jones')).toBeInTheDocument()

      // Click on Score header to sort
      const scoreSortBtn = screen.getByRole('button', { name: /sort score/i })
      fireEvent.click(scoreSortBtn)

      // First click: ascending (lowest score first: Evan Wright, 60)
      const rowsAsc = screen.getAllByRole('row')
      expect(rowsAsc[1]).toHaveTextContent('Evan Wright')

      // Second click: descending (highest score first: Diana Prince, 99)
      fireEvent.click(scoreSortBtn)
      const rowsDesc = screen.getAllByRole('row')
      expect(rowsDesc[1]).toHaveTextContent('Diana Prince')
    })

    it('paginates data in client mode', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={testColumns}
          defaultPageSize={2}
          pageSizeOptions={[2, 4, 10]}
          getRowId={(u) => u.id}
        />
      )

      // Page 1: Alice, Bob
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Jones')).toBeInTheDocument()
      expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument()

      // Go to next page
      const nextBtn = screen.getByRole('button', { name: /next page/i })
      fireEvent.click(nextBtn)

      // Page 2: Charlie, Diana
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument()
      expect(screen.getByText('Diana Prince')).toBeInTheDocument()
      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
    })
  })

  describe('manual mode', () => {
    it('delegates pagination to consumer without client slicing', () => {
      const onPaginationChange = vi.fn()

      const pagination: PaginationState = {
        pageIndex: 1, // 0-indexed page 2
        pageSize: 2,
      }

      render(
        <DataTable
          mode="manual"
          data={mockUsers.slice(2, 4)} // Server already sliced
          rowCount={5}
          columns={testColumns}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          getRowId={(u) => u.id}
        />
      )

      expect(screen.getByText('Charlie Brown')).toBeInTheDocument()
      expect(screen.getByText('Diana Prince')).toBeInTheDocument()

      // Click previous page button
      const prevBtn = screen.getByRole('button', { name: /previous page/i })
      fireEvent.click(prevBtn)

      expect(onPaginationChange).toHaveBeenCalledWith({
        pageIndex: 0,
        pageSize: 2,
      })
    })

    it('automatically recovers when server rowCount shrinks and current page exceeds total', () => {
      const onPaginationChange = vi.fn()

      const { rerender } = render(
        <DataTable
          mode="manual"
          data={mockUsers}
          rowCount={50} // 5 pages of 10
          columns={testColumns}
          pagination={{ pageIndex: 4, pageSize: 10 }} // On page 5
          onPaginationChange={onPaginationChange}
          getRowId={(u) => u.id}
        />
      )

      // Now server responds with filtered rowCount = 15 (only 2 pages: 0 and 1)
      rerender(
        <DataTable
          mode="manual"
          data={mockUsers}
          rowCount={15}
          columns={testColumns}
          pagination={{ pageIndex: 4, pageSize: 10 }}
          onPaginationChange={onPaginationChange}
          getRowId={(u) => u.id}
        />
      )

      // Should automatically clamp back to pageIndex 1 (page 2)
      expect(onPaginationChange).toHaveBeenCalledWith({
        pageIndex: 1,
        pageSize: 10,
      })
    })
  })

  describe('row selection & bulk action bar', () => {
    it('selects rows with true getRowId and shows selection bar', () => {
      const onRowSelectionChange = vi.fn()

      render(
        <DataTable
          data={mockUsers}
          columns={testColumns}
          enableRowSelection
          getRowId={(u) => u.id}
          onRowSelectionChange={onRowSelectionChange}
          selectionBarSlot={(count, _rows, clear) => (
            <div data-testid="bulk-bar">
              <span>{count} selected</span>
              <button onClick={clear}>Clear</button>
            </div>
          )}
        />
      )

      // Select first row checkbox
      const rowCheckboxes = screen.getAllByRole('checkbox', {
        name: /select row/i,
      })
      fireEvent.click(rowCheckboxes[0])

      expect(onRowSelectionChange).toHaveBeenCalledWith({ 'usr-1': true })
    })
  })

  describe('loading, error and empty states', () => {
    it('renders skeleton rows when isLoading is true', () => {
      render(
        <DataTable
          data={[]}
          columns={testColumns}
          isLoading={true}
          getRowId={(u) => u.id}
        />
      )

      expect(screen.getByTestId('data-table-skeleton')).toBeInTheDocument()
      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
    })

    it('renders error message when error is passed', () => {
      render(
        <DataTable
          data={[]}
          columns={testColumns}
          error="Failed to load items from backend"
          getRowId={(u) => u.id}
        />
      )

      expect(
        screen.getByText('Failed to load items from backend')
      ).toBeInTheDocument()
    })

    it('renders emptyMessage when data is empty', () => {
      render(
        <DataTable
          data={[]}
          columns={testColumns}
          emptyMessage="Kayıt bulunamadı"
          getRowId={(u) => u.id}
        />
      )

      expect(screen.getByText('Kayıt bulunamadı')).toBeInTheDocument()
    })
  })
})
