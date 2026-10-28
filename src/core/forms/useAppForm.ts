import { zodResolver } from '@hookform/resolvers/zod'
import {
  useForm,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
} from 'react-hook-form'

import type { UseAppFormOptions } from './types'

export function useAppForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>(
  options: UseAppFormOptions<TFieldValues, TContext> = {}
): UseFormReturn<TFieldValues, TContext> {
  const {
    schema,
    mode = 'onSubmit',
    reValidateMode = 'onChange',
    ...rest
  } = options

  const resolver = schema
    ? (zodResolver(
        schema as unknown as Parameters<typeof zodResolver>[0]
      ) as Resolver<TFieldValues, TContext>)
    : undefined

  return useForm<TFieldValues, TContext>({
    mode,
    reValidateMode,
    resolver,
    ...rest,
  })
}
