import * as React from 'react'

import { Edit2, Plus, Search, Trash2, UserCheck, UserX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/core/blocks'
import { queryParsers } from '@/core/routing/queryState'
import { useUrlState } from '@/core/routing/useUrlState'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/core/ui/components/alert-dialog'
import { Badge } from '@/core/ui/components/badge'
import { Button } from '@/core/ui/components/button'
import { Checkbox } from '@/core/ui/components/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/ui/components/dialog'
import { Input } from '@/core/ui/components/input'
import { Label } from '@/core/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/ui/components/select'
import { DataTable, DataTableColumnHeader } from '@/core/ui/data-table'
import { demoData } from '@/examples/adapters/demoData'
import type { DemoUser } from '@/examples/fixtures/users'

import type { ColumnDef, RowSelectionState } from '@tanstack/react-table'

const tableFilterSchema = {
  search: queryParsers.string(''),
  role: queryParsers.string('all'),
  page: queryParsers.number({ defaultValue: 1, min: 1, integer: true }),
  pageSize: queryParsers.number({
    defaultValue: 10,
    min: 5,
    max: 100,
    integer: true,
  }),
}

export default function TablesPage() {
  const { t } = useTranslation('examples')
  const [params, setParams] = useUrlState(tableFilterSchema)
  const [, setTick] = React.useState(0)

  // Subscriptions to demoData changes
  React.useEffect(() => {
    return demoData.subscribe(() => {
      setTick((prev) => prev + 1)
    })
  }, [])

  // Modals state
  const [editingUser, setEditingUser] = React.useState<DemoUser | null>(null)
  const [deletingUser, setDeletingUser] = React.useState<DemoUser | null>(null)
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false)
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  // Form states for Add/Edit
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user' as 'admin' | 'user' | 'moderator',
    status: 'active' as 'active' | 'inactive' | 'pending',
  })

  const usersResult = demoData.listUsers({
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    role: params.role,
  })

  const openAddUser = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      status: 'active',
    })
    setIsAddUserOpen(true)
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      demoData.createUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        status: formData.status,
      })
      setIsAddUserOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const openEditUser = (user: DemoUser) => {
    setEditingUser(user)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
    })
  }

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    demoData.updateUser(editingUser.id, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role,
      status: formData.status,
    })
    setEditingUser(null)
  }

  const handleConfirmDelete = () => {
    if (!deletingUser) return
    demoData.deleteUser(deletingUser.id)
    setDeletingUser(null)
  }

  const handleBulkDelete = () => {
    const ids = Object.keys(rowSelection)
    demoData.deleteUsers(ids)
    setRowSelection({})
  }

  const columns = React.useMemo<ColumnDef<DemoUser>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(val) =>
              table.toggleAllPageRowsSelected(Boolean(val))
            }
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(val) => row.toggleSelected(Boolean(val))}
            aria-label={`Select row ${row.original.firstName} ${row.original.lastName}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-foreground">
              {row.original.firstName} {row.original.lastName}
            </div>
            <div className="text-xs text-muted-foreground">
              {row.original.email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => {
          const role = row.original.role
          return (
            <Badge
              variant={
                role === 'admin'
                  ? 'default'
                  : role === 'moderator'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {role}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.original.status
          return (
            <div className="flex items-center gap-1.5 text-xs">
              {status === 'active' ? (
                <UserCheck className="h-3.5 w-3.5 text-green-600" />
              ) : status === 'pending' ? (
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
              ) : (
                <UserX className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="capitalize">{status}</span>
            </div>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center gap-1 justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                aria-label={`Edit ${user.firstName} ${user.lastName}`}
                onClick={() => openEditUser(user)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-destructive hover:text-destructive"
                aria-label={`Delete ${user.firstName} ${user.lastName}`}
                onClick={() => setDeletingUser(user)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title={t('tables.title', 'Data Table with URL State')}
          description={t(
            'tables.description',
            'Demonstrates client/manual data tables with search filters, column sorting, pagination and modal confirmation.'
          )}
        />
        <Button onClick={openAddUser} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('tables.addUser', 'Add User')}
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('tables.search', 'Search users...')}
            value={params.search}
            onChange={(e) => setParams({ search: e.target.value, page: 1 })}
            className="pl-8"
          />
        </div>

        <div className="w-40">
          <Select
            value={params.role}
            onValueChange={(val) => setParams({ role: val, page: 1 })}
          >
            <SelectTrigger aria-label="Filter by role">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('tables.allRoles', 'All Roles')}
              </SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={usersResult.items}
        columns={columns}
        getRowId={(row) => row.id}
        enableRowSelection
        selectedRowIds={rowSelection}
        onRowSelectionChange={setRowSelection}
        selectionBarSlot={(selectedCount) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {t('tables.bulkDelete', 'Delete Selected')} ({selectedCount})
          </Button>
        )}
      />

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <form onSubmit={handleCreateUser}>
            <DialogHeader>
              <DialogTitle>{t('tables.addUser', 'Add User')}</DialogTitle>
              <DialogDescription>
                Create a new user profile stored in local demo memory.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="add-firstName">First Name</Label>
                  <Input
                    id="add-firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="add-lastName">Last Name</Label>
                  <Input
                    id="add-lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="add-role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val: 'admin' | 'user' | 'moderator') =>
                    setFormData({ ...formData, role: val })
                  }
                >
                  <SelectTrigger id="add-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddUserOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={Boolean(editingUser)}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent>
          <form onSubmit={handleUpdateUser}>
            <DialogHeader>
              <DialogTitle>{t('tables.editUser', 'Edit User')}</DialogTitle>
              <DialogDescription>
                Update user details in memory.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val: 'admin' | 'user' | 'moderator') =>
                    setFormData({ ...formData, role: val })
                  }
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: 'active' | 'inactive' | 'pending') =>
                    setFormData({ ...formData, status: val })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User AlertDialog */}
      <AlertDialog
        open={Boolean(deletingUser)}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('tables.deleteConfirmTitle', 'Delete User Confirmation')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'tables.deleteConfirmDesc',
                'Are you sure you want to delete this user? This action cannot be undone.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
