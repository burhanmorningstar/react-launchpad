import type { ReactNode } from 'react'

import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/ui/components/select'
import { cn } from '@/core/ui/utils'

import { FieldShell } from '../FieldShell'

import type { BaseFieldProps } from '../types'

export interface SelectOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export interface SelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  options: readonly SelectOption[]
  placeholder?: string
}

export function SelectField<
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
  options,
  placeholder = 'Select an option',
}: SelectFieldProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>()
  const control = explicitControl || formContext?.control

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
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Select
              name={field.name}
              value={field.value || ''}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <SelectTrigger
                id={ctx.id}
                aria-invalid={ctx.ariaInvalid}
                aria-describedby={ctx.ariaDescribedBy}
                className={cn(
                  'w-full',
                  ctx.hasError && 'border-destructive ring-destructive/20'
                )}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      )}
    </FieldShell>
  )
}
