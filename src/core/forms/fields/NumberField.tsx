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

export interface NumberFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
  extends
    BaseFieldProps<TFieldValues, TName>,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'name' | 'type' | 'disabled' | 'required' | 'value'
    > {
  step?: number | string
  min?: number
  max?: number
}

export function NumberField<
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
  step = 1,
  min,
  max,
  placeholder,
  ...inputProps
}: NumberFieldProps<TFieldValues, TName>) {
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
          type="number"
          step={step}
          min={min}
          max={max}
          placeholder={placeholder}
          disabled={ctx.disabled}
          aria-invalid={ctx.ariaInvalid}
          aria-describedby={ctx.ariaDescribedBy}
          className={cn(
            ctx.hasError && 'border-destructive focus-visible:ring-destructive'
          )}
          {...register(name, {
            valueAsNumber: true,
          })}
          {...inputProps}
        />
      )}
    </FieldShell>
  )
}
