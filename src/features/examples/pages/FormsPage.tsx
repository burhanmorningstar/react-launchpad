import * as React from 'react'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { PageHeader } from '@/core/blocks'
import {
  Form,
  TextField,
  SelectField,
  TextareaField,
  CheckboxField,
  FormStepper,
  useAppForm,
  useFormStepper,
} from '@/core/forms'
import { Button } from '@/core/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/ui/components/card'
import { demoData } from '@/examples/adapters/demoData'

const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z
    .string()
    .min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  role: z.enum(['user', 'moderator', 'admin']),
  bio: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const wizardStep1Schema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' }),
  displayName: z.string().min(2, { message: 'Display name is required' }),
})

const wizardStep2Schema = z.object({
  newsletter: z.boolean().default(false),
  marketing: z.boolean().default(false),
})

const wizardFullSchema = wizardStep1Schema.and(wizardStep2Schema)

export default function FormsPage() {
  const { t } = useTranslation('examples')
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  )
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [wizardSuccess, setWizardSuccess] = React.useState<boolean>(false)

  // Profile Form
  const profileForm = useAppForm({
    schema: profileSchema,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'user' as const,
      bio: '',
    },
  })

  const onProfileSubmit = (data: ProfileFormData) => {
    setServerError(null)
    setSuccessMessage(null)

    try {
      demoData.createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        bio: data.bio,
      })
      setSuccessMessage(
        t('forms.createdSuccess', 'Profile created successfully!')
      )
      profileForm.reset()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'fieldErrors' in err) {
        const error = err as {
          message: string
          fieldErrors?: Record<string, string>
        }
        setServerError(error.message)
        if (error.fieldErrors?.email) {
          profileForm.setError('email', {
            type: 'server',
            message: 'This email is already in use (simulated 422 conflict)',
          })
        }
      }
    }
  }

  // Wizard Form
  const wizardForm = useAppForm({
    schema: wizardFullSchema,
    defaultValues: {
      username: '',
      displayName: '',
      newsletter: true,
      marketing: false,
    },
  })

  const wizardSteps = [
    {
      id: 'account',
      title: t('forms.stepAccount', 'Account'),
      fields: ['username', 'displayName'] as const,
    },
    {
      id: 'preferences',
      title: t('forms.stepPreferences', 'Preferences'),
      fields: ['newsletter', 'marketing'] as const,
    },
  ]

  const stepper = useFormStepper({
    steps: wizardSteps,
    form: wizardForm,
    onComplete: () => {
      setWizardSuccess(true)
    },
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('forms.title', 'Interactive Form Workflows')}
        description={t(
          'forms.description',
          'Demonstrates React Hook Form, localized Zod validation, server error mapping and multi-step wizards.'
        )}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Simple Profile Form with 422 error simulation */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('forms.createProfile', 'Create User Profile')}
            </CardTitle>
            <CardDescription>
              {t(
                'forms.conflictHint',
                "Tip: Enter 'taken@example.com' to observe a 422 server conflict error mapped to the email input."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {successMessage && (
              <div
                role="status"
                className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-300 rounded-md border border-green-200 dark:border-green-800"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{successMessage}</span>
              </div>
            )}
            {serverError && (
              <div
                role="alert"
                className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20"
              >
                <AlertCircle className="h-4 w-4" />
                <span>{serverError}</span>
              </div>
            )}

            <Form
              form={profileForm}
              onSubmit={onProfileSubmit}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  name="firstName"
                  label={t('forms.firstName', 'First Name')}
                  required
                />
                <TextField
                  name="lastName"
                  label={t('forms.lastName', 'Last Name')}
                  required
                />
              </div>

              <TextField
                name="email"
                type="email"
                label={t('forms.email', 'Email Address')}
                required
              />

              <SelectField
                name="role"
                label={t('forms.role', 'Role')}
                options={[
                  { value: 'user', label: 'Standard User' },
                  { value: 'moderator', label: 'Moderator' },
                  { value: 'admin', label: 'Administrator' },
                ]}
              />

              <TextareaField
                name="bio"
                label={t('forms.bio', 'Biography')}
                placeholder="Brief description about the user..."
              />

              <Button type="submit" className="w-full">
                {t('forms.submit', 'Submit Profile')}
              </Button>
            </Form>
          </CardContent>
        </Card>

        {/* Multi-step Wizard */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('forms.wizardTitle', 'Multi-Step Onboarding Wizard')}
            </CardTitle>
            <CardDescription>
              Step-by-step wizard validation with controlled progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {wizardSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
                <h3 className="font-semibold text-lg">Onboarding Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  Your preferences have been saved successfully.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setWizardSuccess(false)
                    wizardForm.reset()
                  }}
                >
                  Start Over
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <FormStepper
                  steps={wizardSteps}
                  currentStepIndex={stepper.currentStepIndex}
                  completedSteps={stepper.completedSteps}
                  onStepClick={stepper.goToStep}
                />
                <Form
                  form={wizardForm}
                  onSubmit={() => stepper.nextStep()}
                  className="space-y-6 pt-4"
                >
                  {stepper.currentStepIndex === 0 && (
                    <div className="space-y-4">
                      <TextField name="username" label="Username" required />
                      <TextField
                        name="displayName"
                        label="Display Name"
                        required
                      />
                    </div>
                  )}

                  {stepper.currentStepIndex === 1 && (
                    <div className="space-y-4">
                      <CheckboxField
                        name="newsletter"
                        label={t(
                          'forms.newsletter',
                          'Subscribe to developer newsletter'
                        )}
                      />
                      <CheckboxField
                        name="marketing"
                        label={t('forms.marketing', 'Receive product updates')}
                      />
                    </div>
                  )}

                  <div className="flex justify-between pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={stepper.isFirstStep}
                      onClick={stepper.prevStep}
                    >
                      Previous
                    </Button>
                    {stepper.isLastStep ? (
                      <Button type="submit">Complete Setup</Button>
                    ) : (
                      <Button type="button" onClick={() => stepper.nextStep()}>
                        Next Step
                      </Button>
                    )}
                  </div>
                </Form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
