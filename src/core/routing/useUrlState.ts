import { useCallback, useMemo } from 'react'

import { useSearchParams } from 'react-router'

import {
  parseSearchParams,
  serializeSearchParams,
  type InferQueryState,
  type QuerySchema,
  type SerializeOptions,
} from './queryState'

export interface ResetOnUpdateConfig<TSchema extends QuerySchema> {
  triggerKeys: (keyof TSchema)[]
  resetKeys: (keyof TSchema)[]
}

export interface UseUrlStateOptions<
  TSchema extends QuerySchema,
> extends SerializeOptions {
  navigateMode?: 'replace' | 'push'
  resetOnUpdate?: ResetOnUpdateConfig<TSchema>
}

export interface SetUrlStateOptions<TSchema extends QuerySchema> {
  navigateMode?: 'replace' | 'push'
  resetKeys?: (keyof TSchema)[]
}

export type UseUrlStateResult<TSchema extends QuerySchema> = [
  state: InferQueryState<TSchema>,
  setParams: (
    updater:
      | Partial<InferQueryState<TSchema>>
      | ((prev: InferQueryState<TSchema>) => Partial<InferQueryState<TSchema>>),
    options?: SetUrlStateOptions<TSchema>
  ) => void,
  resetParams: (keys?: (keyof TSchema)[]) => void,
] & {
  state: InferQueryState<TSchema>
  setParams: (
    updater:
      | Partial<InferQueryState<TSchema>>
      | ((prev: InferQueryState<TSchema>) => Partial<InferQueryState<TSchema>>),
    options?: SetUrlStateOptions<TSchema>
  ) => void
  resetParams: (keys?: (keyof TSchema)[]) => void
}

/**
 * Type-safe URL query parameter hook for table filters, pagination, search and tab states.
 * Preserves unknown query keys from other widgets and prevents render/effect loops.
 */
export function useUrlState<TSchema extends QuerySchema>(
  schema: TSchema,
  options: UseUrlStateOptions<TSchema> = {}
): UseUrlStateResult<TSchema> {
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    navigateMode: defaultMode = 'replace',
    preserveUnknown = true,
    removeDefaults = true,
    resetOnUpdate,
  } = options

  // Stabilize search string key so parsed memo only recomputes when search params change
  const searchString = searchParams.toString()

  const state = useMemo(() => {
    return parseSearchParams(searchParams, schema)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchString, schema])

  const setParams = useCallback(
    (
      updater:
        | Partial<InferQueryState<TSchema>>
        | ((
            prev: InferQueryState<TSchema>
          ) => Partial<InferQueryState<TSchema>>),
      updateOptions: SetUrlStateOptions<TSchema> = {}
    ) => {
      const mode = updateOptions.navigateMode ?? defaultMode
      const currentState = parseSearchParams(searchParams, schema)
      const updates =
        typeof updater === 'function' ? updater(currentState) : updater

      // Build target state starting with current state
      const nextState: Partial<InferQueryState<TSchema>> = {
        ...currentState,
        ...updates,
      }

      // Check if resetOnUpdate triggers match
      const resetKeysToApply = new Set<keyof TSchema>()
      if (updateOptions.resetKeys) {
        updateOptions.resetKeys.forEach((k) => resetKeysToApply.add(k))
      }

      if (resetOnUpdate) {
        const hasTrigger = resetOnUpdate.triggerKeys.some(
          (triggerKey) =>
            triggerKey in updates &&
            updates[triggerKey] !== currentState[triggerKey]
        )
        if (hasTrigger) {
          resetOnUpdate.resetKeys.forEach((rk) => resetKeysToApply.add(rk))
        }
      }

      // Apply resets
      for (const resetKey of resetKeysToApply) {
        if (!(resetKey in updates)) {
          nextState[resetKey] = schema[resetKey as string]?.defaultValue
        }
      }

      const nextSearchParams = serializeSearchParams(
        nextState,
        schema,
        searchParams,
        { preserveUnknown, removeDefaults }
      )

      setSearchParams(nextSearchParams, { replace: mode === 'replace' })
    },
    [
      defaultMode,
      preserveUnknown,
      removeDefaults,
      resetOnUpdate,
      schema,
      searchParams,
      setSearchParams,
    ]
  )

  const resetParams = useCallback(
    (keys?: (keyof TSchema)[]) => {
      if (!keys || keys.length === 0) {
        // Reset all schema keys to defaults
        const defaults: Partial<InferQueryState<TSchema>> = {}
        for (const [key, parser] of Object.entries(schema)) {
          defaults[key as keyof TSchema] = parser.defaultValue
        }
        setParams(defaults)
      } else {
        const resets: Partial<InferQueryState<TSchema>> = {}
        for (const key of keys) {
          if (key in schema) {
            resets[key] = schema[key as string]?.defaultValue
          }
        }
        setParams(resets)
      }
    },
    [schema, setParams]
  )

  const result = useMemo(() => {
    const tuple = [state, setParams, resetParams] as UseUrlStateResult<TSchema>
    tuple.state = state
    tuple.setParams = setParams
    tuple.resetParams = resetParams
    return tuple
  }, [state, setParams, resetParams])

  return result
}
