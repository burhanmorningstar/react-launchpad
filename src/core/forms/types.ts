import type { ReactNode } from 'react'

import type {
  Control,
  FieldPath,
  FieldValues,
  UseFormProps,
} from 'react-hook-form'
import type { z } from 'zod'

export interface ValidationMessage {
  key: string
  params?: Record<string, unknown>
}

export interface BaseFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName
  control?: Control<TFieldValues>
  label?: ReactNode
  hint?: ReactNode
  description?: ReactNode
  required?: boolean
  disabled?: boolean
  className?: string
  labelClassName?: string
  hintClassName?: string
  errorClassName?: string
}

export interface UseAppFormOptions<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> extends Omit<UseFormProps<TFieldValues, TContext>, 'resolver'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema?: z.ZodType<TFieldValues, any, any>
}
