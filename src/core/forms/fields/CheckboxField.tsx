import {
  get,
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Checkbox } from '@/core/ui/components/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/core/ui/components/field'
import { cn } from '@/core/ui/utils'

import { formatValidationMessage } from '../validation'

import type { BaseFieldProps } from '../types'

export type CheckboxFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = BaseFieldProps<TFieldValues, TName>

export function CheckboxField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control: explicitControl,
  label,
  hint,
  description,
  required,
  disabled,
  className,
  labelClassName,
  hintClassName,
  errorClassName,
}: CheckboxFieldProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>()
  const control = explicitControl || formContext?.control
  const formState = formContext?.formState
  const { t } = useTranslation()

  const effectiveHint = hint ?? description
  const id = `checkbox-${name.replace(/\./g, '-')}`
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  const fieldError = formState ? get(formState.errors, name) : undefined
  const hasError = Boolean(fieldError)
  const localizedError = formatValidationMessage(
    fieldError?.message as string | undefined,
    t
  )

  return (
    <Field data-invalid={hasError} className={cn('gap-2', className)}>
      <div className="flex items-start gap-2.5">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Checkbox
              id={id}
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? errorId : effectiveHint ? hintId : undefined
              }
            />
          )}
        />
        {label && (
          <div className="flex flex-col gap-0.5">
            <FieldLabel
              htmlFor={id}
              className={cn('cursor-pointer font-normal', labelClassName)}
            >
              {label}
              {required && (
                <span className="ml-1 text-destructive" aria-hidden="true">
                  *
                </span>
              )}
            </FieldLabel>
            {effectiveHint && (
              <FieldDescription id={hintId} className={hintClassName}>
                {effectiveHint}
              </FieldDescription>
            )}
          </div>
        )}
      </div>

      {hasError && localizedError && (
        <FieldError id={errorId} className={errorClassName}>
          {localizedError}
        </FieldError>
      )}
    </Field>
  )
}
