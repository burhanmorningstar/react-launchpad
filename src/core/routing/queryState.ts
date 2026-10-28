export interface QueryParamParser<T> {
  parse: (raw: string | string[] | undefined) => T
  serialize: (value: T) => string | string[] | undefined
  defaultValue: T
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QuerySchema = Record<string, QueryParamParser<any>>

export type InferQueryState<TSchema extends QuerySchema> = {
  [K in keyof TSchema]: TSchema[K] extends QueryParamParser<infer T> ? T : never
}

export interface NumberParserOptions {
  defaultValue?: number
  min?: number
  max?: number
  integer?: boolean
  clamp?: boolean
}

export interface DateParserOptions {
  defaultValue?: Date | null
  format?: 'iso' | 'date-only'
}

export interface ArrayParserOptions<T> {
  defaultValue?: T[]
  separator?: string
}

export interface ParseOptions {
  preserveUnknown?: boolean
}

export interface SerializeOptions {
  preserveUnknown?: boolean
  removeDefaults?: boolean
}

export const queryParsers = {
  string(defaultValue = ''): QueryParamParser<string> {
    return {
      defaultValue,
      parse(raw) {
        if (raw === undefined || raw === null) return defaultValue
        if (Array.isArray(raw)) return raw[0] ?? defaultValue
        return raw
      },
      serialize(value) {
        if (value === defaultValue) return undefined
        return value
      },
    }
  },

  number(options: NumberParserOptions = {}): QueryParamParser<number> {
    const {
      defaultValue = 0,
      min,
      max,
      integer = false,
      clamp = true,
    } = options

    return {
      defaultValue,
      parse(raw) {
        if (raw === undefined || raw === null || raw === '') return defaultValue
        const str = Array.isArray(raw) ? raw[0] : raw
        const parsed = Number(str)

        if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
          return defaultValue
        }

        let num = parsed
        if (integer) {
          num = Math.trunc(num)
        }

        if (clamp) {
          if (min !== undefined && num < min) num = min
          if (max !== undefined && num > max) num = max
        } else {
          if (min !== undefined && num < min) return defaultValue
          if (max !== undefined && num > max) return defaultValue
        }

        return num
      },
      serialize(value) {
        if (value === defaultValue) return undefined
        return String(value)
      },
    }
  },

  boolean(defaultValue = false): QueryParamParser<boolean> {
    return {
      defaultValue,
      parse(raw) {
        if (raw === undefined || raw === null || raw === '') return defaultValue
        const str = (Array.isArray(raw) ? raw[0] : raw).toLowerCase().trim()
        if (str === 'true' || str === '1') return true
        if (str === 'false' || str === '0') return false
        return defaultValue
      },
      serialize(value) {
        if (value === defaultValue) return undefined
        return value ? 'true' : 'false'
      },
    }
  },

  enum<T extends string>(
    allowedValues: readonly T[],
    defaultValue: T
  ): QueryParamParser<T> {
    const set = new Set<string>(allowedValues)
    return {
      defaultValue,
      parse(raw) {
        if (raw === undefined || raw === null) return defaultValue
        const str = Array.isArray(raw) ? raw[0] : raw
        if (set.has(str)) return str as T
        return defaultValue
      },
      serialize(value) {
        if (value === defaultValue) return undefined
        return String(value)
      },
    }
  },

  date(options: DateParserOptions = {}): QueryParamParser<Date | null> {
    const { defaultValue = null } = options

    return {
      defaultValue,
      parse(raw) {
        if (!raw) return defaultValue
        const str = Array.isArray(raw) ? raw[0] : raw
        const date = new Date(str)
        if (Number.isNaN(date.getTime())) {
          return defaultValue
        }
        return date
      },
      serialize(value) {
        if (!value || value === defaultValue) return undefined
        return value.toISOString()
      },
    }
  },

  array<T>(
    itemParser: QueryParamParser<T>,
    options: ArrayParserOptions<T> = {}
  ): QueryParamParser<T[]> {
    const { defaultValue = [], separator = ',' } = options

    return {
      defaultValue,
      parse(raw) {
        if (!raw) return defaultValue
        const items = Array.isArray(raw)
          ? raw
          : raw.split(separator).filter((item) => item.length > 0)

        const parsed = items.map((item) => itemParser.parse(item))
        return parsed
      },
      serialize(value) {
        if (!value || value.length === 0 || value === defaultValue) {
          return undefined
        }
        const serializedItems = value
          .map((item) => itemParser.serialize(item) ?? String(item))
          .filter(Boolean)

        if (serializedItems.length === 0) return undefined
        return serializedItems.join(separator)
      },
    }
  },

  json<T>(defaultValue: T): QueryParamParser<T> {
    return {
      defaultValue,
      parse(raw) {
        if (!raw) return defaultValue
        const str = Array.isArray(raw) ? raw[0] : raw
        try {
          return JSON.parse(str) as T
        } catch {
          return defaultValue
        }
      },
      serialize(value) {
        if (value === defaultValue) return undefined
        try {
          return JSON.stringify(value)
        } catch {
          return undefined
        }
      },
    }
  },
}

/**
 * Parses URLSearchParams according to a given QuerySchema.
 */
export function parseSearchParams<TSchema extends QuerySchema>(
  searchParams: URLSearchParams,
  schema: TSchema
): InferQueryState<TSchema> {
  const result: Record<string, unknown> = {}

  for (const [key, parser] of Object.entries(schema)) {
    const all = searchParams.getAll(key)
    const raw = all.length === 0 ? undefined : all.length === 1 ? all[0] : all
    result[key] = parser.parse(raw)
  }

  return result as InferQueryState<TSchema>
}

/**
 * Serializes state updates back into a URLSearchParams instance, preserving unknown
 * keys from other widgets and stripping out default values by default.
 */
export function serializeSearchParams<TSchema extends QuerySchema>(
  state: Partial<InferQueryState<TSchema>>,
  schema: TSchema,
  currentSearchParams?: URLSearchParams,
  options: SerializeOptions = {}
): URLSearchParams {
  const { preserveUnknown = true, removeDefaults = true } = options
  const nextParams = new URLSearchParams()

  // 1. If preserveUnknown is true, copy all non-schema keys from currentSearchParams
  if (preserveUnknown && currentSearchParams) {
    for (const [key, value] of currentSearchParams.entries()) {
      if (!(key in schema)) {
        nextParams.append(key, value)
      }
    }
  }

  // 2. Compute the merged state for all schema keys
  for (const [key, parser] of Object.entries(schema)) {
    const value = key in state ? state[key] : parser.defaultValue

    // If removeDefaults is true and value equals defaultValue, omit it
    if (
      removeDefaults &&
      (value === parser.defaultValue || value === undefined)
    ) {
      continue
    }

    const serialized = parser.serialize(value)
    if (serialized !== undefined && serialized !== null && serialized !== '') {
      if (Array.isArray(serialized)) {
        for (const item of serialized) {
          nextParams.append(key, item)
        }
      } else {
        nextParams.set(key, serialized)
      }
    }
  }

  return nextParams
}
