import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import {
  Form,
  TextField,
  ComboboxField,
  MultiSelectField,
  DateField,
  DateRangeField,
  FieldArray,
  FormStepper,
  useAppForm,
  useFormStepper,
  useFormDraft,
  useUnsavedChanges,
} from './index'

describe('Advanced Forms System', () => {
  describe('FieldArray', () => {
    const arraySchema = z.object({
      users: z.array(
        z.object({
          name: z.string().min(2, 'Name too short'),
          role: z.string().min(1, 'Role required'),
        })
      ),
    })

    type ArrayFormValues = z.infer<typeof arraySchema>

    function ArrayTestForm({
      onSubmit = vi.fn(),
    }: {
      onSubmit?: (data: ArrayFormValues) => void
    }) {
      const form = useAppForm<ArrayFormValues>({
        schema: arraySchema,
        defaultValues: {
          users: [
            { name: 'Alice', role: 'Admin' },
            { name: '', role: 'User' },
          ],
        },
      })

      return (
        <Form form={form} onSubmit={onSubmit}>
          <FieldArray name="users">
            {({ fields, append, remove }) => (
              <div>
                {fields.map((fieldItem, index) => (
                  <div key={fieldItem.id} data-testid={`user-row-${index}`}>
                    <TextField
                      name={`users.${index}.name` as const}
                      label={`User ${index} Name`}
                    />
                    <TextField
                      name={`users.${index}.role` as const}
                      label={`User ${index} Role`}
                    />
                    <button type="button" onClick={() => remove(index)}>
                      Remove {index}
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => append({ name: 'New User', role: 'Guest' })}
                >
                  Add User
                </button>
              </div>
            )}
          </FieldArray>
          <button type="submit">Submit Users</button>
        </Form>
      )
    }

    it('renders initial items and appends new rows correctly', async () => {
      const user = userEvent.setup()
      render(<ArrayTestForm />)

      expect(screen.getByTestId('user-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('user-row-1')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Add User' }))

      expect(screen.getByTestId('user-row-2')).toBeInTheDocument()
    })

    it('removes row and maps nested error message to the exact row index', async () => {
      const user = userEvent.setup()
      render(<ArrayTestForm />)

      // Submit to trigger validation: row 1 name is empty (''), row 0 is valid ('Alice')
      await user.click(screen.getByRole('button', { name: 'Submit Users' }))

      await waitFor(() => {
        expect(screen.getByText('Name too short')).toBeInTheDocument()
      })

      // Row 0 has Alice, row 1 has error. Remove row 0.
      await user.click(screen.getByRole('button', { name: 'Remove 0' }))

      // Now the previously row 1 item shifted to row 0, preserving its error state
      await waitFor(() => {
        expect(screen.queryByTestId('user-row-1')).not.toBeInTheDocument()
      })
    })
  })

  describe('FormStepper', () => {
    const wizardSchema = z.object({
      step1Name: z.string().min(2, 'Step 1 Name too short'),
      step2Email: z.string().email('Step 2 invalid email'),
    })

    type WizardValues = z.infer<typeof wizardSchema>

    function WizardTestComponent({
      onComplete = vi.fn(),
    }: {
      onComplete?: (data: WizardValues) => void
    }) {
      const form = useAppForm<WizardValues>({
        schema: wizardSchema,
        defaultValues: {
          step1Name: '',
          step2Email: '',
        },
      })

      const steps = [
        {
          id: 'step1',
          title: 'Account Info',
          fields: ['step1Name'] as const,
        },
        {
          id: 'step2',
          title: 'Contact Info',
          fields: ['step2Email'] as const,
        },
      ]

      const stepper = useFormStepper({
        steps,
        form,
        onComplete,
      })

      return (
        <Form form={form} onSubmit={() => {}}>
          <FormStepper
            steps={steps}
            currentStepIndex={stepper.currentStepIndex}
          >
            {stepper.currentStepIndex === 0 && (
              <div>
                <TextField name="step1Name" label="Step 1 Name" />
                <button type="button" onClick={() => stepper.nextStep()}>
                  Next Step
                </button>
              </div>
            )}

            {stepper.currentStepIndex === 1 && (
              <div>
                <TextField name="step2Email" label="Step 2 Email" />
                <button type="button" onClick={() => stepper.prevStep()}>
                  Previous Step
                </button>
                <button type="button" onClick={() => stepper.nextStep()}>
                  Finish
                </button>
              </div>
            )}
          </FormStepper>
        </Form>
      )
    }

    it('blocks forward navigation if current step fields are invalid', async () => {
      const user = userEvent.setup()
      render(<WizardTestComponent />)

      expect(screen.getByLabelText('Step 1 Name')).toBeInTheDocument()

      // Click Next with empty input
      await user.click(screen.getByRole('button', { name: 'Next Step' }))

      // Remains on step 1 and displays validation error
      await waitFor(() => {
        expect(screen.getByText('Step 1 Name too short')).toBeInTheDocument()
      })
      expect(screen.queryByLabelText('Step 2 Email')).not.toBeInTheDocument()
    })

    it('advances to next step when valid, supports going back and completes', async () => {
      const user = userEvent.setup()
      const handleComplete = vi.fn()
      render(<WizardTestComponent onComplete={handleComplete} />)

      await user.type(screen.getByLabelText('Step 1 Name'), 'John Doe')
      await user.click(screen.getByRole('button', { name: 'Next Step' }))

      // Successfully on Step 2
      await waitFor(() => {
        expect(screen.getByLabelText('Step 2 Email')).toBeInTheDocument()
      })

      // Go back to Step 1 without validation error
      await user.click(screen.getByRole('button', { name: 'Previous Step' }))
      expect(screen.getByLabelText('Step 1 Name')).toHaveValue('John Doe')

      // Go forward again
      await user.click(screen.getByRole('button', { name: 'Next Step' }))
      expect(screen.getByLabelText('Step 2 Email')).toBeInTheDocument()

      // Fill valid email and finish
      await user.type(screen.getByLabelText('Step 2 Email'), 'john@example.com')
      await user.click(screen.getByRole('button', { name: 'Finish' }))

      await waitFor(() => {
        expect(handleComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            step1Name: 'John Doe',
            step2Email: 'john@example.com',
          })
        )
      })
    })
  })

  describe('ComboboxField', () => {
    it('supports static options and selection', () => {
      const schema = z.object({ framework: z.string() })

      function ComboboxTestForm() {
        const form = useAppForm({
          schema,
          defaultValues: { framework: 'react' },
        })

        return (
          <Form form={form} onSubmit={() => {}}>
            <ComboboxField
              name="framework"
              label="Framework"
              options={[
                { value: 'react', label: 'React' },
                { value: 'vue', label: 'Vue' },
              ]}
            />
          </Form>
        )
      }

      render(<ComboboxTestForm />)
      expect(screen.getByText('React')).toBeInTheDocument()
    })

    it('supports async querying and handles stale request abortion', async () => {
      const schema = z.object({ country: z.string() })
      const queryFn = vi
        .fn()
        .mockImplementation(async (query: string, signal?: AbortSignal) => {
          if (signal?.aborted) return []
          return [
            { value: 'tr', label: `Turkey (${query})` },
            { value: 'de', label: `Germany (${query})` },
          ]
        })

      function AsyncComboboxTestForm() {
        const form = useAppForm({
          schema,
          defaultValues: { country: '' },
        })

        return (
          <Form form={form} onSubmit={() => {}}>
            <ComboboxField
              name="country"
              label="Country"
              queryFn={queryFn}
              debounceMs={10}
            />
          </Form>
        )
      }

      render(<AsyncComboboxTestForm />)
      expect(screen.getByText('Select an option...')).toBeInTheDocument()
    })
  })

  describe('MultiSelectField', () => {
    const multiSchema = z.object({
      tags: z.array(z.string()),
    })

    function MultiSelectTestForm({
      onSubmit = vi.fn(),
    }: {
      onSubmit?: (data: { tags: string[] }) => void
    }) {
      const form = useAppForm({
        schema: multiSchema,
        defaultValues: {
          tags: ['react'],
        },
      })

      return (
        <Form form={form} onSubmit={onSubmit}>
          <MultiSelectField
            name="tags"
            label="Tags"
            options={[
              { value: 'react', label: 'React' },
              { value: 'vue', label: 'Vue' },
              { value: 'svelte', label: 'Svelte' },
            ]}
          />
          <button type="submit">Submit Tags</button>
        </Form>
      )
    }

    it('renders initial tag badges and allows removing tags', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn()
      render(<MultiSelectTestForm onSubmit={handleSubmit} />)

      expect(screen.getByText('React')).toBeInTheDocument()

      // Click the remove icon on React tag
      const removeBtn = screen.getByRole('button', { name: 'Remove React' })
      await user.click(removeBtn)

      // Submit and verify tags is now empty
      await user.click(screen.getByRole('button', { name: 'Submit Tags' }))

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ tags: [] }),
          expect.anything()
        )
      })
    })
  })

  describe('DateField & DateRangeField', () => {
    const dateSchema = z.object({
      birthday: z.string().optional(),
      range: z
        .object({ from: z.string().optional(), to: z.string().optional() })
        .optional(),
    })

    function DateTestForm() {
      const form = useAppForm({
        schema: dateSchema,
        defaultValues: {
          birthday: '2026-10-28',
          range: { from: '2026-10-01', to: '2026-10-15' },
        },
      })

      return (
        <Form form={form} onSubmit={() => {}}>
          <DateField name="birthday" label="Birthday" />
          <DateRangeField name="range" label="Date Range" />
        </Form>
      )
    }

    it('displays formatted date and allows clearing', async () => {
      const user = userEvent.setup()
      render(<DateTestForm />)

      // Formatted date label appears inside button
      expect(screen.getByText('10/28/2026')).toBeInTheDocument()
      expect(
        screen.getByText(/10\/1\/2026\s*-\s*10\/15\/2026/)
      ).toBeInTheDocument()

      // Clear button resets the date
      const clearBtn = screen.getByRole('button', { name: 'Clear date' })
      await user.click(clearBtn)

      expect(screen.getByText('Pick a date')).toBeInTheDocument()
    })
  })

  describe('useFormDraft', () => {
    const draftSchema = z.object({
      title: z.string(),
      password: z.string(),
    })

    type DraftFormValues = z.infer<typeof draftSchema>

    function DraftTestComponent({ version = 1 }: { version?: number }) {
      const form = useAppForm<DraftFormValues>({
        schema: draftSchema,
        defaultValues: {
          title: '',
          password: '',
        },
      })

      const { hasDraft, restoreDraft, clearDraft } = useFormDraft({
        form,
        storageKey: 'test-form-draft',
        version,
        debounceMs: 50,
      })

      return (
        <Form form={form} onSubmit={() => {}}>
          <TextField name="title" label="Title" />
          <TextField name="password" label="Password" type="password" />
          <div data-testid="draft-status">
            {hasDraft ? 'HAS_DRAFT' : 'NO_DRAFT'}
          </div>
          <button type="button" onClick={() => restoreDraft()}>
            Restore
          </button>
          <button type="button" onClick={() => clearDraft()}>
            Clear
          </button>
        </Form>
      )
    }

    it('persists changes excluding sensitive fields and restores correctly', async () => {
      sessionStorage.clear()
      const user = userEvent.setup()
      render(<DraftTestComponent />)

      const titleInput = screen.getByLabelText('Title')
      const passwordInput = screen.getByLabelText('Password')

      await user.type(titleInput, 'Draft Project')
      await user.type(passwordInput, 'SuperSecret123')

      // Wait for debounce persistence
      await waitFor(() => {
        const stored = sessionStorage.getItem('test-form-draft')
        expect(stored).toBeTruthy()
      })

      const raw = JSON.parse(sessionStorage.getItem('test-form-draft')!)
      // Title is saved
      expect(raw.data.title).toBe('Draft Project')
      // Password was excluded automatically for security
      expect(raw.data.password).toBeUndefined()
    })

    it('invalidates draft if version mismatches', () => {
      sessionStorage.setItem(
        'test-form-draft',
        JSON.stringify({
          version: 1,
          savedAt: Date.now(),
          data: { title: 'Old Draft' },
        })
      )

      // Render with version 2
      render(<DraftTestComponent version={2} />)

      // Old draft should be cleared due to version mismatch
      expect(screen.getByTestId('draft-status')).toHaveTextContent('NO_DRAFT')
      expect(sessionStorage.getItem('test-form-draft')).toBeNull()
    })
  })

  describe('useUnsavedChanges', () => {
    function UnsavedTestComponent({ isDirty }: { isDirty: boolean }) {
      useUnsavedChanges({
        isDirty,
        message: 'Leave warning',
      })

      return <div>Unsaved Guard</div>
    }

    it('attaches beforeunload listener when dirty', () => {
      const addSpy = vi.spyOn(window, 'addEventListener')
      const removeSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = render(<UnsavedTestComponent isDirty={true} />)

      expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))

      unmount()

      expect(removeSpy).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      )
      addSpy.mockRestore()
      removeSpy.mockRestore()
    })
  })
})
