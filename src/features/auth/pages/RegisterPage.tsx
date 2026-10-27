import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { ROUTES } from '@/config'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Field,
  FieldLabel,
  FieldError,
} from '@/core/ui'

import { registerSchema, useRegisterMutation } from '../api'

import type { RegisterFormData } from '../types'

export function RegisterPage() {
  const { t } = useTranslation()
  const registerMutation = useRegisterMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="register-name">Name</FieldLabel>
            <Input
              id="register-name"
              type="text"
              placeholder="John Doe"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'register-name-error' : undefined}
              {...register('name')}
            />
            <FieldError id="register-name-error">
              {errors.name?.message}
            </FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="register-email">Email</FieldLabel>
            <Input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? 'register-email-error' : undefined
              }
              {...register('email')}
            />
            <FieldError id="register-email-error">
              {errors.email?.message}
            </FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.password)}>
            <FieldLabel htmlFor="register-password">Password</FieldLabel>
            <Input
              id="register-password"
              type="password"
              placeholder="Create a password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'register-password-error' : undefined
              }
              {...register('password')}
            />
            <FieldError id="register-password-error">
              {errors.password?.message}
            </FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.confirmPassword)}>
            <FieldLabel htmlFor="register-confirmPassword">
              Confirm Password
            </FieldLabel>
            <Input
              id="register-confirmPassword"
              type="password"
              placeholder="Confirm your password"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword
                  ? 'register-confirmPassword-error'
                  : undefined
              }
              {...register('confirmPassword')}
            />
            <FieldError id="register-confirmPassword-error">
              {errors.confirmPassword?.message}
            </FieldError>
          </Field>

          {registerMutation.error && (
            <p className="text-sm text-error">{t('errors.generic')}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={registerMutation.isPending}
          >
            Register
          </Button>

          <p className="text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
