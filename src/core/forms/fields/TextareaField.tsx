import type { TextareaHTMLAttributes } from 'react'

import {
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import { Textarea } from '@/core/ui/components/textarea'
import { cn } from '@/core/ui/utils'

import { FieldShell } from '../FieldShell'

import type { BaseFieldProps } from '../types'

export interface TextareaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
  extends
    BaseFieldProps<TFieldValues, TName>,
    Omit<
      TextareaHTMLAttributes<HTMLTextAreaElement>,
      'name' | 'disabled' | 'required'
    > {}

export function TextareaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control: _control,
  label,
  hint,
  description,
  required,
  disabled,
  className,
  labelClassName,
  hintClassName,
  errorClassName,
  placeholder,
  rows = 4,
  ...textareaProps
}: TextareaFieldProps<TFieldValues, TName>) {
  const { register } = useFormContext<TFieldValues>()

  return (
    <FieldShell
      name={name}
      label={label}
      hint={hint}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
      labelClassName={labelClassName}
      hintClassName={hintClassName}
      errorClassName={errorClassName}
    >
      {(ctx) => (
        <Textarea
          id={ctx.id}
          rows={rows}
          placeholder={placeholder}
          disabled={ctx.disabled}
          aria-invalid={ctx.ariaInvalid}
          aria-describedby={ctx.ariaDescribedBy}
          className={cn(
            ctx.hasError && 'border-destructive focus-visible:ring-destructive'
          )}
          {...register(name)}
          {...textareaProps}
        />
      )}
    </FieldShell>
  )
}
