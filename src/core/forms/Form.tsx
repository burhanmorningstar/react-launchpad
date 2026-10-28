import type { FormHTMLAttributes, ReactNode } from 'react'

import {
  FormProvider,
  type FieldValues,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form'

import { cn } from '@/core/ui/utils'

export interface FormProps<
  TFieldValues extends FieldValues = FieldValues,
> extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onError'> {
  form: UseFormReturn<TFieldValues>
  onSubmit: SubmitHandler<TFieldValues>
  onError?: SubmitErrorHandler<TFieldValues>
  children: ReactNode
  focusFirstError?: boolean
}

export function Form<TFieldValues extends FieldValues = FieldValues>({
  form,
  onSubmit,
  onError,
  children,
  className,
  focusFirstError = true,
  ...props
}: FormProps<TFieldValues>) {
  const handleFormError: SubmitErrorHandler<TFieldValues> = (errors, event) => {
    if (focusFirstError && typeof document !== 'undefined') {
      const errorKeys = Object.keys(errors)
      if (errorKeys.length > 0) {
        const firstErrorKey = errorKeys[0]
        const invalidElement =
          document.querySelector(`[name="${firstErrorKey}"]`) ||
          document.querySelector('[aria-invalid="true"]')
        if (invalidElement && 'focus' in invalidElement) {
          ;(invalidElement as HTMLElement).focus()
        }
      }
    }
    onError?.(errors, event)
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, handleFormError)}
        className={cn('space-y-4', className)}
        noValidate
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  )
}
