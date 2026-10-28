import { useState } from 'react'

import { z } from 'zod'

import { Button } from '@/core/ui/components/button'

import {
  ComboboxField,
  DateField,
  DateRangeField,
  FieldArray,
  Form,
  FormStepper,
  MultiSelectField,
  TextField,
  useAppForm,
  useFormDraft,
  useFormStepper,
  vMsg,
} from './index'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Core/Forms/Advanced',
  parameters: {
    layout: 'padded',
  },
}

export default meta

// 1. MultiStep Wizard Story
const wizardSchema = z.object({
  organizationName: z
    .string()
    .min(2, vMsg('validation:minLength', { count: 2 })),
  billingEmail: z.string().email(vMsg('validation:email')),
  plan: z.string().min(1, vMsg('validation:required')),
  teamMembers: z.array(
    z.object({
      name: z.string().min(2, vMsg('validation:minLength', { count: 2 })),
      email: z.string().email(vMsg('validation:email')),
    })
  ),
  deploymentRegion: z.string().min(1, vMsg('validation:required')),
})

type WizardValues = z.infer<typeof wizardSchema>

function MultiStepWizardDemo() {
  const form = useAppForm<WizardValues>({
    schema: wizardSchema,
    defaultValues: {
      organizationName: '',
      billingEmail: '',
      plan: 'pro',
      teamMembers: [{ name: 'Alex Lead', email: 'alex@example.com' }],
      deploymentRegion: 'eu-central',
    },
  })

  const steps = [
    {
      id: 'organization',
      title: 'Organization',
      description: 'Account details and billing',
      fields: ['organizationName', 'billingEmail'] as const,
    },
    {
      id: 'team',
      title: 'Team Members',
      description: 'Invite members to your workspace',
      fields: ['teamMembers'] as const,
    },
    {
      id: 'deployment',
      title: 'Review & Deploy',
      description: 'Region selection and summary',
      fields: ['deploymentRegion', 'plan'] as const,
    },
  ]

  const stepper = useFormStepper({
    steps,
    form,
    onComplete: (data) => {
      alert(`Wizard completed successfully!\n${JSON.stringify(data, null, 2)}`)
    },
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-foreground">
          Multi-Step Onboarding Wizard
        </h2>
        <p className="text-sm text-muted-foreground">
          Demonstrates per-step validation, history navigation and final
          submission.
        </p>
      </div>

      <FormStepper
        steps={steps}
        currentStepIndex={stepper.currentStepIndex}
        completedSteps={stepper.completedSteps}
        onStepClick={stepper.goToStep}
      />

      <Form
        form={form}
        onSubmit={() => stepper.nextStep()}
        className="space-y-6 pt-4"
      >
        {stepper.currentStepIndex === 0 && (
          <div className="space-y-4">
            <TextField
              name="organizationName"
              label="Organization Name"
              placeholder="Acme Corp"
              required
            />
            <TextField
              name="billingEmail"
              type="email"
              label="Billing Email"
              placeholder="billing@acme.com"
              required
            />
          </div>
        )}

        {stepper.currentStepIndex === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Workspace Members
              </h3>
            </div>
            <FieldArray name="teamMembers">
              {({ fields, append, remove }) => (
                <div className="space-y-3">
                  {fields.map((fieldItem, index) => (
                    <div
                      key={fieldItem.id}
                      className="flex items-end gap-3 rounded-lg border p-3 bg-muted/20"
                    >
                      <div className="flex-1">
                        <TextField
                          name={`teamMembers.${index}.name` as const}
                          label="Full Name"
                          placeholder="Jane Doe"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <TextField
                          name={`teamMembers.${index}.email` as const}
                          label="Email"
                          type="email"
                          placeholder="jane@acme.com"
                          required
                        />
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => remove(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ name: '', email: '' })}
                  >
                    + Add Another Member
                  </Button>
                </div>
              )}
            </FieldArray>
          </div>
        )}

        {stepper.currentStepIndex === 2 && (
          <div className="space-y-4">
            <ComboboxField
              name="deploymentRegion"
              label="Primary Deployment Region"
              options={[
                {
                  value: 'eu-central',
                  label: 'Europe (Frankfurt - eu-central-1)',
                },
                { value: 'eu-west', label: 'Europe (Ireland - eu-west-1)' },
                {
                  value: 'us-east',
                  label: 'US East (N. Virginia - us-east-1)',
                },
                {
                  value: 'ap-southeast',
                  label: 'Asia Pacific (Singapore - ap-southeast-1)',
                },
              ]}
              required
            />

            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
              <h4 className="font-semibold text-foreground">Review Summary</h4>
              <p>
                Organization:{' '}
                {form.watch('organizationName') || '(Not specified)'}
              </p>
              <p>Billing: {form.watch('billingEmail') || '(Not specified)'}</p>
              <p>Members Count: {form.watch('teamMembers').length}</p>
            </div>
          </div>
        )}

        <div className="flex justify-between border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={stepper.prevStep}
            disabled={stepper.isFirstStep}
          >
            Previous
          </Button>
          <Button type="submit">
            {stepper.isLastStep ? 'Complete & Launch' : 'Continue'}
          </Button>
        </div>
      </Form>
    </div>
  )
}

export const MultiStepWizard: StoryObj = {
  render: () => <MultiStepWizardDemo />,
}

// 2. Async Combobox and MultiSelect Story
const tagsSchema = z.object({
  country: z.string().min(1, vMsg('validation:required')),
  skills: z.array(z.string()).min(1, vMsg('validation:required')),
})

type TagsValues = z.infer<typeof tagsSchema>

function AsyncComboboxDemo() {
  const form = useAppForm<TagsValues>({
    schema: tagsSchema,
    defaultValues: {
      country: '',
      skills: ['react', 'typescript'],
    },
  })

  // Simulated async remote search
  const queryCountries = async (query: string, signal?: AbortSignal) => {
    await new Promise((r) => setTimeout(r, 400))
    if (signal?.aborted) return []
    const all = [
      { value: 'de', label: 'Germany' },
      { value: 'fr', label: 'France' },
      { value: 'gb', label: 'United Kingdom' },
      { value: 'tr', label: 'Turkey' },
      { value: 'us', label: 'United States' },
      { value: 'jp', label: 'Japan' },
      { value: 'ca', label: 'Canada' },
    ]
    if (!query) return all
    return all.filter((c) =>
      c.label.toLowerCase().includes(query.toLowerCase())
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-bold text-foreground">
        Async Search & Multi-Select
      </h3>
      <Form
        form={form}
        onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
        className="space-y-4"
      >
        <ComboboxField
          name="country"
          label="Country of Residence (Async Remote Query)"
          queryFn={queryCountries}
          placeholder="Search and pick a country..."
          required
        />

        <MultiSelectField
          name="skills"
          label="Primary Skills (Tags)"
          options={[
            { value: 'react', label: 'React' },
            { value: 'typescript', label: 'TypeScript' },
            { value: 'tailwind', label: 'Tailwind CSS' },
            { value: 'nextjs', label: 'Next.js' },
            { value: 'vite', label: 'Vite' },
            { value: 'graphql', label: 'GraphQL' },
          ]}
          required
        />

        <Button type="submit">Submit Selections</Button>
      </Form>
    </div>
  )
}

export const AsyncAndMultiSelect: StoryObj = {
  render: () => <AsyncComboboxDemo />,
}

// 3. Date & Date Range Picker Story
const dateSchema = z.object({
  singleDate: z.string().optional(),
  dateRange: z
    .object({ from: z.string().optional(), to: z.string().optional() })
    .optional(),
})

type DateValues = z.infer<typeof dateSchema>

function DatePickersDemo() {
  const form = useAppForm<DateValues>({
    schema: dateSchema,
    defaultValues: {
      singleDate: '2026-10-28',
      dateRange: { from: '2026-10-01', to: '2026-10-15' },
    },
  })

  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-bold text-foreground">
        Date & Range Pickers
      </h3>
      <Form
        form={form}
        onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
        className="space-y-4"
      >
        <DateField name="singleDate" label="Target Launch Date" />
        <DateRangeField name="dateRange" label="Sprint Duration" />
        <Button type="submit">Confirm Schedule</Button>
      </Form>
    </div>
  )
}

export const DatePickers: StoryObj = {
  render: () => <DatePickersDemo />,
}

// 4. Draft Autosave Demo
const draftSchema = z.object({
  articleTitle: z.string(),
  articleContent: z.string(),
  secretToken: z.string(),
})

type DraftValues = z.infer<typeof draftSchema>

function DraftPersistenceDemo() {
  const [notification, setNotification] = useState<string | null>(null)

  const form = useAppForm<DraftValues>({
    schema: draftSchema,
    defaultValues: {
      articleTitle: '',
      articleContent: '',
      secretToken: '',
    },
  })

  const { hasDraft, restoreDraft, clearDraft, lastSavedAt } = useFormDraft({
    form,
    storageKey: 'storybook-article-draft',
    debounceMs: 200,
  })

  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Draft Persistence (Autosave)
          </h3>
          <p className="text-xs text-muted-foreground">
            Type anything below, reload the story or switch tabs; changes
            persist automatically in sessionStorage (passwords excluded).
          </p>
        </div>
      </div>

      {hasDraft && (
        <div className="flex items-center justify-between rounded-md bg-accent p-3 text-sm">
          <span>
            Draft detected from{' '}
            {lastSavedAt
              ? new Date(lastSavedAt).toLocaleTimeString()
              : 'earlier session'}
            .
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                restoreDraft()
                setNotification('Draft restored!')
              }}
            >
              Restore Draft
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                clearDraft()
                setNotification('Draft discarded.')
              }}
            >
              Discard
            </Button>
          </div>
        </div>
      )}

      {notification && (
        <div className="text-xs text-primary font-medium">{notification}</div>
      )}

      <Form
        form={form}
        onSubmit={() => alert('Published!')}
        className="space-y-4"
      >
        <TextField
          name="articleTitle"
          label="Article Title"
          placeholder="My journey with React 19"
        />
        <TextField
          name="articleContent"
          label="Content"
          placeholder="Write draft here..."
        />
        <TextField
          name="secretToken"
          label="Secret API Key (Excluded from draft automatically)"
          type="password"
          placeholder="••••••••"
        />
        <Button type="submit">Publish Article</Button>
      </Form>
    </div>
  )
}

export const DraftAutosave: StoryObj = {
  render: () => <DraftPersistenceDemo />,
}
