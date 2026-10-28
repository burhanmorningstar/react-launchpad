import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { ROUTES } from '@/config'
import { Form, TextField, PasswordField, useAppForm } from '@/core/forms'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/core/ui'

import { registerSchema, useRegisterMutation } from '../api'

import type { RegisterFormData } from '../types'

export function RegisterPage() {
  const { t } = useTranslation()
  const registerMutation = useRegisterMutation()

  const form = useAppForm({
    schema: registerSchema,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
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
        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <TextField
            control={form.control}
            name="name"
            type="text"
            label="Name"
            placeholder="John Doe"
            autoComplete="name"
            required
          />

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
            placeholder="Create a password"
            autoComplete="new-password"
            required
          />

          <PasswordField
            control={form.control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
          />

          {registerMutation.error && (
            <div className="rounded-md bg-error/10 p-3 text-sm text-error">
              {(
                registerMutation.error as {
                  response?: { data?: { message?: string } }
                }
              )?.response?.data?.message ||
                t(
                  'auth.registrationFailed',
                  'Registration failed. Please try again.'
                )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={registerMutation.isPending}
          >
            Create Account
          </Button>

          <p className="text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </Form>
      </CardContent>
    </Card>
  )
}
