import { useState, type InputHTMLAttributes } from 'react'

import { EyeIcon, EyeOffIcon } from 'lucide-react'
import {
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import { Button } from '@/core/ui/components/button'
import { Input } from '@/core/ui/components/input'
import { cn } from '@/core/ui/utils'

import { FieldShell } from '../FieldShell'

import type { BaseFieldProps } from '../types'

export interface PasswordFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
  extends
    BaseFieldProps<TFieldValues, TName>,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'name' | 'type' | 'disabled' | 'required'
    > {}

export function PasswordField<
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
  ...inputProps
}: PasswordFieldProps<TFieldValues, TName>) {
  const [showPassword, setShowPassword] = useState(false)
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
        <div className="relative">
          <Input
            id={ctx.id}
            type={showPassword ? 'text' : 'password'}
            placeholder={placeholder}
            disabled={ctx.disabled}
            aria-invalid={ctx.ariaInvalid}
            aria-describedby={ctx.ariaDescribedBy}
            className={cn(
              'pr-10',
              ctx.hasError &&
                'border-destructive focus-visible:ring-destructive'
            )}
            {...register(name)}
            {...inputProps}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
            ) : (
              <EyeIcon className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      )}
    </FieldShell>
  )
}
