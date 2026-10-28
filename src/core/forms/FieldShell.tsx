import { useId, type ReactNode } from 'react'

import { get, useFormContext, type FieldValues } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/core/ui/components/field'
import { cn } from '@/core/ui/utils'

import { formatValidationMessage } from './validation'

import type { BaseFieldProps } from './types'

export interface FieldRenderContext {
  id: string
  hintId: string
  errorId: string
  hasError: boolean
  ariaInvalid: boolean
  ariaDescribedBy: string | undefined
  disabled?: boolean
}

export interface FieldShellProps<
  TFieldValues extends FieldValues = FieldValues,
> extends BaseFieldProps<TFieldValues> {
  id?: string
  children: ReactNode | ((ctx: FieldRenderContext) => ReactNode)
}

export function FieldShell<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  hint,
  description,
  required,
  disabled,
  id: explicitId,
  className,
  labelClassName,
  hintClassName,
  errorClassName,
  children,
}: FieldShellProps<TFieldValues>) {
  const generatedId = useId()
  const { t } = useTranslation()
  const formContext = useFormContext<TFieldValues>()

  const effectiveHint = hint ?? description
  const id = explicitId || `field-${name.replace(/\./g, '-')}-${generatedId}`
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  const fieldError = formContext
    ? get(formContext.formState.errors, name)
    : undefined
  const hasError = Boolean(fieldError)
  const rawErrorMessage = fieldError?.message as string | undefined
  const localizedError = formatValidationMessage(rawErrorMessage, t)

  const describedByParts = []
  if (effectiveHint) describedByParts.push(hintId)
  if (hasError) describedByParts.push(errorId)
  const ariaDescribedBy =
    describedByParts.length > 0 ? describedByParts.join(' ') : undefined

  const renderContext: FieldRenderContext = {
    id,
    hintId,
    errorId,
    hasError,
    ariaInvalid: hasError,
    ariaDescribedBy,
    disabled,
  }

  return (
    <Field data-invalid={hasError} className={cn('gap-1.5', className)}>
      {label && (
        <FieldLabel htmlFor={id} className={labelClassName}>
          {label}
          {required && (
            <span className="ml-1 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </FieldLabel>
      )}

      {typeof children === 'function' ? children(renderContext) : children}

      {effectiveHint && !hasError && (
        <FieldDescription id={hintId} className={hintClassName}>
          {effectiveHint}
        </FieldDescription>
      )}

      {hasError && localizedError && (
        <FieldError id={errorId} className={errorClassName}>
          {localizedError}
        </FieldError>
      )}
    </Field>
  )
}
