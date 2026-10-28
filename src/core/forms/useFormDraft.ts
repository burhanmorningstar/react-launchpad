import { useEffect, useRef, useState, useCallback } from 'react'

import type { FieldValues, UseFormReturn } from 'react-hook-form'

export interface DraftEnvelope<TData = unknown> {
  version: string | number
  savedAt: number
  data: TData
}

export interface UseFormDraftOptions<
  TFieldValues extends FieldValues = FieldValues,
> {
  form: UseFormReturn<TFieldValues>
  storageKey: string
  version?: string | number
  allowedFields?: readonly (keyof TFieldValues)[]
  debounceMs?: number
  storage?: Storage
  enabled?: boolean
  autoRestore?: boolean
}

export interface UseFormDraftReturn {
  hasDraft: boolean
  lastSavedAt: number | null
  restoreDraft: () => boolean
  clearDraft: () => void
}

const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /cvv/i,
  /card/i,
  /pin/i,
]

function isSensitiveField(key: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))
}

function sanitizeValues<TFieldValues extends FieldValues>(
  values: TFieldValues,
  allowedFields?: readonly (keyof TFieldValues)[]
): Partial<TFieldValues> {
  const sanitized: Partial<TFieldValues> = {}

  for (const [key, val] of Object.entries(values)) {
    // 1. Check if field is sensitive
    if (isSensitiveField(key)) {
      continue
    }

    // 2. Filter out File or non-serializable objects
    if (typeof window !== 'undefined') {
      if (
        val instanceof File ||
        (typeof FileList !== 'undefined' && val instanceof FileList)
      ) {
        continue
      }
    }

    // 3. Check allowedFields list if specified
    if (allowedFields && !allowedFields.includes(key as keyof TFieldValues)) {
      continue
    }

    sanitized[key as keyof TFieldValues] = val
  }

  return sanitized
}

export function useFormDraft<TFieldValues extends FieldValues = FieldValues>({
  form,
  storageKey,
  version = 1,
  allowedFields,
  debounceMs = 300,
  storage = typeof window !== 'undefined'
    ? window.sessionStorage
    : (undefined as unknown as Storage),
  enabled = true,
  autoRestore = false,
}: UseFormDraftOptions<TFieldValues>): UseFormDraftReturn {
  const [hasDraft, setHasDraft] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const draftDataRef = useRef<Partial<TFieldValues> | null>(null)

  // 1. Read existing draft on mount
  useEffect(() => {
    if (!enabled || !storage) return

    try {
      const raw = storage.getItem(storageKey)
      if (!raw) {
        setHasDraft(false)
        return
      }

      const envelope: DraftEnvelope<Partial<TFieldValues>> = JSON.parse(raw)
      if (envelope.version !== version) {
        // Invalidate mismatched version
        storage.removeItem(storageKey)
        setHasDraft(false)
        return
      }

      draftDataRef.current = envelope.data
      setLastSavedAt(envelope.savedAt)
      setHasDraft(true)

      if (autoRestore && envelope.data) {
        form.reset({
          ...form.getValues(),
          ...envelope.data,
        })
      }
    } catch {
      // Corrupt JSON or storage unavailable: clear and ignore
      try {
        storage.removeItem(storageKey)
      } catch {
        // Storage access may be blocked
      }
      setHasDraft(false)
    }
  }, [enabled, storageKey, storage, version, autoRestore, form])

  // 2. Watch form changes and persist debounced
  useEffect(() => {
    if (!enabled || !storage) return

    let timer: ReturnType<typeof setTimeout> | null = null

    const subscription = form.watch((values) => {
      if (!form.formState.isDirty) return

      if (timer) clearTimeout(timer)

      timer = setTimeout(() => {
        try {
          const sanitized = sanitizeValues(
            values as TFieldValues,
            allowedFields
          )
          const envelope: DraftEnvelope<Partial<TFieldValues>> = {
            version,
            savedAt: Date.now(),
            data: sanitized,
          }
          storage.setItem(storageKey, JSON.stringify(envelope))
          draftDataRef.current = sanitized
          setLastSavedAt(envelope.savedAt)
          setHasDraft(true)
        } catch {
          // QuotaExceededError or private browsing restriction: fail gracefully
        }
      }, debounceMs)
    })

    return () => {
      subscription.unsubscribe()
      if (timer) clearTimeout(timer)
    }
  }, [form, enabled, storage, storageKey, version, allowedFields, debounceMs])

  const restoreDraft = useCallback((): boolean => {
    if (!draftDataRef.current) return false
    form.reset({
      ...form.getValues(),
      ...draftDataRef.current,
    })
    return true
  }, [form])

  const clearDraft = useCallback((): void => {
    try {
      storage?.removeItem(storageKey)
    } catch {
      // Storage access may be blocked
    }
    draftDataRef.current = null
    setHasDraft(false)
    setLastSavedAt(null)
  }, [storage, storageKey])

  return {
    hasDraft,
    lastSavedAt,
    restoreDraft,
    clearDraft,
  }
}
