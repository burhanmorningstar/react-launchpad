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

import { loginSchema, useLoginMutation } from '../api'

import type { LoginFormData } from '../types'

export function LoginPage() {
  const { t } = useTranslation()
  const loginMutation = useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="login-email">Email</FieldLabel>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              {...register('email')}
            />
            <FieldError id="login-email-error">
              {errors.email?.message}
            </FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.password)}>
            <FieldLabel htmlFor="login-password">Password</FieldLabel>
            <Input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'login-password-error' : undefined
              }
              {...register('password')}
            />
            <FieldError id="login-password-error">
              {errors.password?.message}
            </FieldError>
          </Field>

          {loginMutation.error && (
            <div className="rounded-md bg-error/10 p-3 text-sm text-error">
              {(
                loginMutation.error as {
                  response?: { data?: { message?: string } }
                }
              )?.response?.data?.message ||
                t('auth.invalidCredentials', 'Invalid email or password')}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={loginMutation.isPending}
          >
            Login
          </Button>

          <p className="text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER} className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
