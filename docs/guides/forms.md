# Forms & Validation Guide

React Launchpad provides a type-safe form architecture combining **React Hook Form**, **Zod**, **shadcn/Radix UI primitives**, and **react-i18next** localized validation.

---

## 1. Core Principles

1. **Single Source of Truth:** The Zod schema defines both runtime validation and the inferred TypeScript type.
2. **Accessible Controls:** Form controls render with associated `<FormLabel>`, `<FormControl>`, and `<FormMessage>` wired to ARIA descriptors.
3. **Localized Error Messages:** Validation errors use translation keys (`validation:required`, `validation:invalidEmail`) rather than hardcoded English strings.

---

## 2. Basic Form Pattern

```typescript
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/core/ui/components/form'
import { Input } from '@/core/ui/components/input'
import { Button } from '@/core/ui/components/button'

export const loginSchema = z.object({
  email: z.string().min(1, 'validation:required').email('validation:invalidEmail'),
  password: z.string().min(8, 'validation:minLength'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({ onSubmit }: { onSubmit: (values: LoginFormValues) => void }) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Log in</Button>
      </form>
    </Form>
  )
}
```

---

## 3. Advanced Form Controls

- **Combobox & Select:** Accessible multi-choice and searchable dropdowns with keyboard navigation.
- **Date Pickers:** Single date and date range pickers backed by Radix Popover and calendar components.
- **Dynamic Field Arrays (`FieldArray`):** Add, remove, and re-order dynamic lists of inputs with automatic index management.
- **Multi-Step Wizards (`FormStepper`):** Built-in stepper hook and progress indicators for complex multi-page onboarding or checkout flows.
