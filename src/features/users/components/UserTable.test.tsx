import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'

import { UserTable } from './UserTable'

const { mutation } = vi.hoisted(() => ({ mutation: vi.fn() }))
vi.mock('../api', () => ({
  useDeleteUser: () => ({ mutateAsync: mutation, isPending: false }),
}))
beforeEach(() => mutation.mockReset().mockResolvedValue(undefined))

it('confirms deletion with the shared alert dialog without a legacy modal provider', async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <UserTable
        users={[
          {
            id: 'test-user',
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.test',
            role: 'user',
            status: 'active',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
          },
        ]}
      />
    </QueryClientProvider>
  )
  const trigger = screen.getByRole('button', { name: 'Delete' })
  await userEvent.click(trigger)
  const dialog = screen.getByRole('alertdialog', { name: 'Delete User' })
  expect(dialog).toHaveAccessibleDescription(/Ada Lovelace/)
  await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
  await waitFor(() =>
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  )
  expect(trigger).toHaveFocus()
  queryClient.clear()
})

it('keeps keyboard focus on the table after a successful deletion removes its trigger', async () => {
  const users = [
    {
      id: 'test-user',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.test',
      role: 'user' as const,
      status: 'active' as const,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ]
  const { rerender } = render(<UserTable users={users} />)
  await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
  await userEvent.click(
    within(screen.getByRole('alertdialog')).getByRole('button', {
      name: 'Delete',
    })
  )
  await waitFor(() =>
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  )
  expect(mutation).toHaveBeenCalledWith('test-user')
  await act(async () => {
    rerender(<UserTable users={[]} />)
  })
  expect(screen.getByRole('region', { name: 'Users table' })).toHaveFocus()
})
