import {
  get,
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/core/ui/components/field'
import { Switch } from '@/core/ui/components/switch'
import { cn } from '@/core/ui/utils'

import { formatValidationMessage } from '../validation'

import type { BaseFieldProps } from '../types'

export type SwitchFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = BaseFieldProps<TFieldValues, TName>

export function SwitchField<
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
}: SwitchFieldProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>()
  const control = explicitControl || formContext?.control
  const formState = formContext?.formState
  const { t } = useTranslation()

  const effectiveHint = hint ?? description
  const id = `switch-${name.replace(/\./g, '-')}`
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
      <div className="flex items-center justify-between gap-4">
        {label ? (
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
        ) : effectiveHint ? (
          <FieldDescription id={hintId} className={hintClassName}>
            {effectiveHint}
          </FieldDescription>
        ) : null}

        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Switch
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
      </div>

      {hasError && localizedError && (
        <FieldError id={errorId} className={errorClassName}>
          {localizedError}
        </FieldError>
      )}
    </Field>
  )
}
