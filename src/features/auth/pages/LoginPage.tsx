import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { ROUTES } from '@/config'
import { Form, TextField, PasswordField, useAppForm } from '@/core/forms'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/core/ui'

import { loginSchema, useLoginMutation } from '../api'

import type { LoginFormData } from '../types'

export function LoginPage() {
  const { t } = useTranslation()
  const loginMutation = useLoginMutation()

  const form = useAppForm({
    schema: loginSchema,
    defaultValues: {
      email: '',
      password: '',
    },
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
        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <TextField
            control={form.control}
            name="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <PasswordField
            control={form.control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

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
        </Form>
      </CardContent>
    </Card>
  )
}
