import type { ReactNode } from 'react'

import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import { FieldLabel } from '@/core/ui/components/field'
import { RadioGroup, RadioGroupItem } from '@/core/ui/components/radio-group'
import { cn } from '@/core/ui/utils'

import { FieldShell } from '../FieldShell'

import type { BaseFieldProps } from '../types'

export interface RadioOption {
  value: string
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
}

export interface RadioFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  options: readonly RadioOption[]
  orientation?: 'vertical' | 'horizontal'
}

export function RadioField<
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
  orientation = 'vertical',
}: RadioFieldProps<TFieldValues, TName>) {
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
            <RadioGroup
              id={ctx.id}
              value={field.value ?? ''}
              onValueChange={field.onChange}
              disabled={ctx.disabled}
              aria-invalid={ctx.ariaInvalid}
              aria-describedby={ctx.ariaDescribedBy}
              className={cn(
                'gap-3 pt-1',
                orientation === 'horizontal'
                  ? 'flex flex-row flex-wrap gap-4'
                  : 'flex flex-col'
              )}
            >
              {options.map((option) => {
                const optionId = `${ctx.id}-${option.value}`
                return (
                  <div key={option.value} className="flex items-start gap-2.5">
                    <RadioGroupItem
                      id={optionId}
                      value={option.value}
                      disabled={option.disabled || ctx.disabled}
                    />
                    <div className="flex flex-col gap-0.5">
                      <FieldLabel
                        htmlFor={optionId}
                        className="cursor-pointer font-normal text-sm"
                      >
                        {option.label}
                      </FieldLabel>
                      {option.description && (
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </RadioGroup>
          )}
        />
      )}
    </FieldShell>
  )
}
