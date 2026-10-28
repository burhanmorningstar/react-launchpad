import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import i18n from '@/i18n'

import {
  Form,
  TextField,
  PasswordField,
  NumberField,
  CheckboxField,
  TextareaField,
  useAppForm,
  mapFieldErrors,
  vMsg,
} from './index'

const testSchema = z.object({
  username: z.string().min(3, vMsg('validation:minLength', { count: 3 })),
  email: z.string().email(vMsg('validation:email')),
  age: z
    .number()
    .min(18, vMsg('validation:min', { min: 18 }))
    .optional(),
  password: z.string().min(6, vMsg('validation:minLength', { count: 6 })),
  terms: z.boolean().refine((val) => val === true, vMsg('validation:required')),
  bio: z.string().optional(),
})

type TestFormData = z.infer<typeof testSchema>

function TestFormComponent({
  onSubmit = vi.fn(),
}: {
  onSubmit?: (data: TestFormData) => void
}) {
  const form = useAppForm<TestFormData>({
    schema: testSchema,
    defaultValues: {
      username: '',
      email: '',
      password: '',
      terms: false,
    },
  })

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-4">
      <TextField
        name="username"
        label="Username"
        hint="Choose a unique handle"
      />

      <TextField name="email" label="Email" type="email" />

      <NumberField name="age" label="Age" />

      <PasswordField name="password" label="Password" />

      <CheckboxField name="terms" label="I accept the terms and conditions" />

      <TextareaField name="bio" label="Biography" />

      <button type="submit">Submit</button>
    </Form>
  )
}

describe('Form & Field system', () => {
  it('connects label, input, description and error accessibility attributes', async () => {
    const user = userEvent.setup()
    render(<TestFormComponent />)

    const usernameInput = screen.getByLabelText('Username')
    expect(usernameInput).toBeInTheDocument()
    expect(usernameInput).toHaveAttribute('aria-describedby')

    // Submit without filling to trigger validation
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(usernameInput).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('translates validation error messages dynamically without losing input values', async () => {
    const user = userEvent.setup()
    i18n.changeLanguage('en')

    render(<TestFormComponent />)

    const emailInput = screen.getByLabelText('Email')
    await user.type(emailInput, 'invalid-email')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument()
    })

    // Language switched to Turkish dynamically
    await act(async () => {
      await i18n.changeLanguage('tr')
    })

    await waitFor(() => {
      expect(
        screen.getByText('Geçerli bir e-posta adresi giriniz')
      ).toBeInTheDocument()
    })

    // Input value is preserved
    expect(emailInput).toHaveValue('invalid-email')

    // Switch back to English
    await act(async () => {
      await i18n.changeLanguage('en')
    })
  })

  it('differentiates between 0 and empty input in NumberField', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()
    render(<TestFormComponent onSubmit={handleSubmit} />)

    const ageInput = screen.getByLabelText('Age')
    await user.type(ageInput, '0')

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    // Age 0 is less than 18, so it fails min 18, proving 0 was not converted to undefined/empty
    await waitFor(() => {
      expect(screen.getByText(/Must be at least 18/)).toBeInTheDocument()
    })
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<TestFormComponent />)

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleButton = screen.getByRole('button', {
      name: /show password|toggle password/i,
    })
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('maps server field errors and form root errors with mapFieldErrors', () => {
    const mockSetError = vi.fn()
    const mockForm = { setError: mockSetError } as unknown as Parameters<
      typeof mapFieldErrors
    >[0]

    mapFieldErrors(
      mockForm,
      {
        fieldErrors: {
          email: 'validation:email',
          unknownField: 'Some unknown error',
        },
        message: 'Invalid registration parameters',
      },
      ['email', 'password', 'username']
    )

    expect(mockSetError).toHaveBeenCalledWith('email', {
      type: 'server',
      message: 'validation:email',
    })

    // unknownField and generic message mapped to root
    expect(mockSetError).toHaveBeenCalledWith('root.serverError', {
      type: 'server',
      message: 'Some unknown error',
    })
  })
})
