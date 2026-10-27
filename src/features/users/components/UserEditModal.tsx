import { useEffect, useMemo } from 'react'

import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  FieldError,
} from '@/core/ui'

import { useUpdateUser } from '../api'
import { USER_ROLES, USER_STATUSES } from '../types'

import type { UpdateUserDTO, User, UserRole, UserStatus } from '../types'

interface UserEditModalProps {
  user: User
  onClose: () => void
  open: boolean
}

export function UserEditModal({ user, onClose, open }: UserEditModalProps) {
  const { t } = useTranslation('users')
  const updateUser = useUpdateUser(user.id)

  const roleOptions = useMemo(
    () =>
      USER_ROLES.map((role) => ({
        value: role.value,
        label: t(role.labelKey, role.value),
      })),
    [t]
  )

  const statusOptions = useMemo(
    () =>
      USER_STATUSES.map((status) => ({
        value: status.value,
        label: t(status.labelKey, status.value),
      })),
    [t]
  )

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserDTO>({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    },
  })

  const roleValue = useWatch({ control, name: 'role' })
  const statusValue = useWatch({ control, name: 'status' })

  useEffect(() => {
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    })
  }, [user, reset])

  const onSubmit = async (data: UpdateUserDTO) => {
    try {
      await updateUser.mutateAsync(data)
      onClose()
    } catch {
      // Error handling is managed by the mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>{t('editUser.title', 'Edit User')}</DialogTitle>
          <DialogDescription>
            {t(
              'editUser.description',
              'Update user information and permissions'
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                {t('form.firstName', 'First Name')}
              </Label>
              <Input
                id="firstName"
                {...register('firstName', {
                  required: t('form.required', 'This field is required'),
                })}
                aria-invalid={Boolean(errors.firstName)}
                aria-describedby={
                  errors.firstName ? 'firstName-error' : undefined
                }
              />
              <FieldError id="firstName-error">
                {errors.firstName?.message}
              </FieldError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                {t('form.lastName', 'Last Name')}
              </Label>
              <Input
                id="lastName"
                {...register('lastName', {
                  required: t('form.required', 'This field is required'),
                })}
                aria-invalid={Boolean(errors.lastName)}
                aria-describedby={
                  errors.lastName ? 'lastName-error' : undefined
                }
              />
              <FieldError id="lastName-error">
                {errors.lastName?.message}
              </FieldError>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">{t('form.role', 'Role')}</Label>
              <Select
                value={roleValue}
                onValueChange={(value) => setValue('role', value as UserRole)}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{t('form.status', 'Status')}</Label>
              <Select
                value={statusValue}
                onValueChange={(value) =>
                  setValue('status', value as UserStatus)
                }
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('form.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || updateUser.isPending}
            >
              {updateUser.isPending
                ? t('form.saving', 'Saving...')
                : t('form.save', 'Save Changes')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
