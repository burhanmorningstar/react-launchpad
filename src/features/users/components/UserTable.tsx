import { useMemo, useCallback, useState, useRef } from 'react'

import { clsx } from 'clsx'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  Button,
  useToast,
} from '@/core/ui'
import { DataTable } from '@/core/ui/components/DataTable'

import { useDeleteUser } from '../api'

import type { User } from '../types'
import type { ColumnDef } from '@tanstack/react-table'

interface UserTableProps {
  users: User[]
  isLoading?: boolean
  onEdit?: (user: User) => void
  onView?: (user: User) => void
}

const statusColors = {
  active:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
}

const roleColors = {
  admin:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  moderator: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  user: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

export function UserTable({
  users,
  isLoading,
  onEdit,
  onView,
}: UserTableProps) {
  const [pendingUser, setPendingUser] = useState<User | null>(null)
  const deleteTrigger = useRef<HTMLButtonElement | null>(null)
  const tableRegion = useRef<HTMLDivElement | null>(null)
  const deletionSucceeded = useRef(false)
  const { success, error } = useToast()
  const deleteUser = useDeleteUser()

  const handleDelete = useCallback((user: User, trigger: HTMLButtonElement) => {
    deleteTrigger.current = trigger
    deletionSucceeded.current = false
    setPendingUser(user)
  }, [])

  const confirmDelete = async () => {
    if (!pendingUser || deleteUser.isPending) return
    try {
      await deleteUser.mutateAsync(pendingUser.id)
      deletionSucceeded.current = true
      setPendingUser(null)
      success('User deleted successfully')
    } catch {
      error('Failed to delete user')
    }
  }

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'User',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              {row.original.avatar ? (
                <img
                  src={row.original.avatar}
                  alt={`${row.original.firstName} ${row.original.lastName}`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium">
                  {row.original.firstName[0]}
                  {row.original.lastName[0]}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium">
                {row.original.firstName} {row.original.lastName}
              </p>
              <p className="text-sm text-text-secondary">
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <span
            className={clsx(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
              roleColors[row.original.role]
            )}
          >
            {row.original.role}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={clsx(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
              statusColors[row.original.status]
            )}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onView(row.original)
                }}
              >
                View
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(row.original)
                }}
              >
                Edit
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(row.original, e.currentTarget)
              }}
              className="text-error hover:text-error"
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onView, handleDelete]
  )

  return (
    <div ref={tableRegion} role="region" aria-label="Users table" tabIndex={-1}>
      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        enableSorting
        enablePagination
        emptyMessage="No users found"
      />
      <AlertDialog
        open={Boolean(pendingUser)}
        onOpenChange={(open) => {
          if (!open && !deleteUser.isPending) setPendingUser(null)
        }}
      >
        <AlertDialogContent
          onEscapeKeyDown={(event) => {
            if (deleteUser.isPending) event.preventDefault()
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            const target =
              !deletionSucceeded.current && deleteTrigger.current?.isConnected
                ? deleteTrigger.current
                : tableRegion.current
            target?.focus()
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {pendingUser?.firstName}{' '}
              {pendingUser?.lastName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUser.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteUser.isPending}
              aria-busy={deleteUser.isPending}
              onClick={(event) => {
                event.preventDefault()
                void confirmDelete()
              }}
            >
              {deleteUser.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
