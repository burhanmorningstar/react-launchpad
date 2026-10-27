import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/ui'

import { useUsers } from '../api'
import { UserEditModal, UserTable, UserViewModal } from '../components'
import { USER_ROLES, USER_STATUSES } from '../types'

import type { User, UsersFilters, UserRole, UserStatus } from '../types'

export default function UsersPage() {
  const { t } = useTranslation('users')
  const [filters, setFilters] = useState<UsersFilters>({
    page: 1,
    limit: 10,
  })
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [viewingUser, setViewingUser] = useState<User | null>(null)

  const { data, isLoading } = useUsers(filters)

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }))
  }

  const handleRoleFilter = (role: string) => {
    setFilters((prev) => ({
      ...prev,
      role: role === 'all' ? undefined : (role as UserRole),
      page: 1,
    }))
  }

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status === 'all' ? undefined : (status as UserStatus),
      page: 1,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t('title', 'Users')}
          </h1>
          <p className="text-text-secondary">
            {t('description', 'Manage your team members and their permissions')}
          </p>
        </div>
        <Button>{t('addUser', 'Add User')}</Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-50">
          <Input
            aria-label={t('searchPlaceholder', 'Search users...')}
            placeholder={t('searchPlaceholder', 'Search users...')}
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="w-37.5">
          <Select
            value={filters.role || 'all'}
            onValueChange={(value) => handleRoleFilter(value)}
          >
            <SelectTrigger aria-label="Filter by role">
              <SelectValue placeholder={t('filters.allRoles', 'All Roles')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('filters.allRoles', 'All Roles')}
              </SelectItem>
              {USER_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {t(role.labelKey, role.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-37.5">
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => handleStatusFilter(value)}
          >
            <SelectTrigger
              aria-label={t('filters.allStatuses', 'Filter by status')}
            >
              <SelectValue
                placeholder={t('filters.allStatuses', 'All Statuses')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('filters.allStatuses', 'All Statuses')}
              </SelectItem>
              {USER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {t(status.labelKey, status.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <UserTable
        users={data?.data || []}
        isLoading={isLoading}
        onEdit={(user) => setEditingUser(user)}
        onView={(user) => setViewingUser(user)}
      />

      {data && (
        <div className="text-sm text-text-secondary">
          Showing {data.data.length} of {data.total} users
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {/* View User Modal */}
      {viewingUser && (
        <UserViewModal
          user={viewingUser}
          open={!!viewingUser}
          onClose={() => setViewingUser(null)}
          onEdit={() => {
            setEditingUser(viewingUser)
            setViewingUser(null)
          }}
        />
      )}
    </div>
  )
}
