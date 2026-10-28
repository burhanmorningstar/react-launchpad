import type { ReactNode } from 'react'

import {
  useFieldArray,
  useFormContext,
  type ArrayPath,
  type Control,
  type FieldArrayWithId,
  type FieldValues,
  type UseFieldArrayReturn,
} from 'react-hook-form'

export interface AppFieldArrayHelpers<
  TFieldValues extends FieldValues = FieldValues,
  TArrayName extends ArrayPath<TFieldValues> = ArrayPath<TFieldValues>,
> {
  fields: FieldArrayWithId<TFieldValues, TArrayName, 'id'>[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  append: (value: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prepend: (value: any) => void
  remove: (index?: number | number[]) => void
  swap: (indexA: number, indexB: number) => void
  move: (from: number, to: number) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert: (index: number, value: any) => void
  raw: UseFieldArrayReturn<TFieldValues, TArrayName, 'id'>
}

export function useAppFieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TArrayName extends ArrayPath<TFieldValues> = ArrayPath<TFieldValues>,
>(
  name: TArrayName,
  explicitControl?: Control<TFieldValues>
): AppFieldArrayHelpers<TFieldValues, TArrayName> {
  const formContext = useFormContext<TFieldValues>()
  const control = explicitControl || formContext?.control

  if (!control) {
    throw new Error(
      'useAppFieldArray must be used within a FormProvider or with an explicit control prop.'
    )
  }

  const fieldArray = useFieldArray<TFieldValues, TArrayName, 'id'>({
    control,
    name,
    keyName: 'id',
  })

  return {
    fields: fieldArray.fields,
    append: fieldArray.append,
    prepend: fieldArray.prepend,
    remove: fieldArray.remove,
    swap: fieldArray.swap,
    move: fieldArray.move,
    insert: fieldArray.insert,
    raw: fieldArray,
  }
}

export interface FieldArrayProps<
  TFieldValues extends FieldValues = FieldValues,
  TArrayName extends ArrayPath<TFieldValues> = ArrayPath<TFieldValues>,
> {
  name: TArrayName
  control?: Control<TFieldValues>
  children: (
    helpers: AppFieldArrayHelpers<TFieldValues, TArrayName>
  ) => ReactNode
}

export function FieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TArrayName extends ArrayPath<TFieldValues> = ArrayPath<TFieldValues>,
>({ name, control, children }: FieldArrayProps<TFieldValues, TArrayName>) {
  const helpers = useAppFieldArray<TFieldValues, TArrayName>(name, control)
  return <>{children(helpers)}</>
}
