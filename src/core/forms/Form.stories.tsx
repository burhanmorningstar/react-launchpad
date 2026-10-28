import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Button } from '@/core/ui/components/button'

import {
  Form,
  TextField,
  PasswordField,
  NumberField,
  TextareaField,
  SelectField,
  CheckboxField,
  SwitchField,
  RadioField,
  useAppForm,
  vMsg,
} from './index'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Core/Forms',
  parameters: {
    layout: 'padded',
  },
}

export default meta

const userProfileSchema = z.object({
  fullName: z.string().min(2, vMsg('validation:minLength', { count: 2 })),
  email: z.string().email(vMsg('validation:email')),
  password: z.string().min(8, vMsg('validation:minLength', { count: 8 })),
  age: z.number().min(18, vMsg('validation:min', { count: 18 })),
  role: z.string().min(1, vMsg('validation:required')),
  bio: z
    .string()
    .max(200, vMsg('validation:maxLength', { count: 200 }))
    .optional(),
  newsletter: z.boolean().default(false),
  notifications: z.boolean().default(true),
  themePreference: z.enum(['system', 'light', 'dark']),
})

type UserProfileFormValues = z.infer<typeof userProfileSchema>

function CompleteFormDemo() {
  const { i18n } = useTranslation()
  const form = useAppForm<UserProfileFormValues>({
    schema: userProfileSchema,
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      age: 25,
      role: 'developer',
      bio: '',
      newsletter: true,
      notifications: true,
      themePreference: 'system',
    },
  })

  const onSubmit = (data: UserProfileFormValues) => {
    alert(JSON.stringify(data, null, 2))
  }

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'tr' ? 'en' : 'tr')
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            User Profile Form
          </h2>
          <p className="text-sm text-muted-foreground">
            Complete suite of accessible, localized form fields.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={toggleLanguage}>
          {i18n.language === 'tr' ? 'Switch to English' : "Türkçe'ye Geç"}
        </Button>
      </div>

      <Form form={form} onSubmit={onSubmit} className="space-y-4">
        <TextField
          control={form.control}
          name="fullName"
          label="Full Name"
          placeholder="e.g. Jane Doe"
          description="Your legal or display name."
          required
        />

        <TextField
          control={form.control}
          name="email"
          type="email"
          label="Email Address"
          placeholder="name@example.com"
          required
        />

        <PasswordField
          control={form.control}
          name="password"
          label="Password"
          placeholder="••••••••"
          description="At least 8 characters."
          required
        />

        <NumberField
          control={form.control}
          name="age"
          label="Age"
          placeholder="25"
          min={0}
          max={120}
          required
        />

        <SelectField
          control={form.control}
          name="role"
          label="Primary Role"
          placeholder="Select role"
          options={[
            { label: 'Frontend Developer', value: 'frontend' },
            { label: 'Backend Developer', value: 'backend' },
            { label: 'Fullstack Engineer', value: 'developer' },
            { label: 'UI/UX Designer', value: 'designer' },
            { label: 'Product Manager', value: 'pm' },
          ]}
          required
        />

        <TextareaField
          control={form.control}
          name="bio"
          label="Biography"
          placeholder="Tell us a little bit about yourself..."
          rows={3}
        />

        <RadioField
          control={form.control}
          name="themePreference"
          label="Theme Preference"
          description="Choose how the interface appears."
          options={[
            { label: 'System Default', value: 'system' },
            { label: 'Light Mode', value: 'light' },
            { label: 'Dark Mode', value: 'dark' },
          ]}
        />

        <div className="space-y-3 pt-2">
          <CheckboxField
            control={form.control}
            name="newsletter"
            label="Subscribe to weekly developer newsletter"
            description="Tips, updates and product news once a week."
          />

          <SwitchField
            control={form.control}
            name="notifications"
            label="Push notifications"
            description="Receive immediate alerts for team activity."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() => form.reset()}
            disabled={form.formState.isSubmitting}
          >
            Reset
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Submit Profile'}
          </Button>
        </div>
      </Form>
    </div>
  )
}

export const AllFields: StoryObj = {
  render: () => <CompleteFormDemo />,
}

export const ValidationStates: StoryObj = {
  render: () => {
    const form = useAppForm({
      schema: userProfileSchema,
      defaultValues: {
        fullName: 'A',
        email: 'invalid-email',
        password: 'short',
        age: 12,
        role: '',
        bio: 'x'.repeat(250),
        newsletter: false,
        notifications: false,
        themePreference: 'light',
      },
      mode: 'all',
    })

    return (
      <div className="mx-auto max-w-xl space-y-4 rounded-xl border border-destructive/20 bg-card p-6">
        <h3 className="font-semibold text-destructive">
          Validation Errors Demo
        </h3>
        <Form form={form} onSubmit={() => {}} className="space-y-4">
          <TextField
            control={form.control}
            name="fullName"
            label="Full Name"
            required
          />
          <TextField
            control={form.control}
            name="email"
            label="Email"
            required
          />
          <PasswordField
            control={form.control}
            name="password"
            label="Password"
            required
          />
          <NumberField control={form.control} name="age" label="Age" required />
          <Button
            type="button"
            onClick={async () => {
              await form.trigger()
            }}
          >
            Trigger Validation
          </Button>
        </Form>
      </div>
    )
  },
}
