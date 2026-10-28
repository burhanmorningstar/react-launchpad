import type { InputHTMLAttributes } from 'react'

import {
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import { Input } from '@/core/ui/components/input'
import { cn } from '@/core/ui/utils'

import { FieldShell } from '../FieldShell'

import type { BaseFieldProps } from '../types'

export interface TextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
  extends
    BaseFieldProps<TFieldValues, TName>,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'name' | 'disabled' | 'required'
    > {}

export function TextField<
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
  type = 'text',
  placeholder,
  ...inputProps
}: TextFieldProps<TFieldValues, TName>) {
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
        <Input
          id={ctx.id}
          type={type}
          placeholder={placeholder}
          disabled={ctx.disabled}
          aria-invalid={ctx.ariaInvalid}
          aria-describedby={ctx.ariaDescribedBy}
          className={cn(
            ctx.hasError && 'border-destructive focus-visible:ring-destructive'
          )}
          {...register(name)}
          {...inputProps}
        />
      )}
    </FieldShell>
  )
}
