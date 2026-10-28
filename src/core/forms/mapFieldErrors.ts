import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form'

export interface ServerErrorPayload {
  fieldErrors?: Record<string, string | readonly string[]>
  message?: string
}

/**
 * Maps normalized backend/API error payloads to React Hook Form field errors.
 * Known field paths are dispatched to their respective inputs, while unknown
 * or general payload errors are attached to the form's root error slot.
 */
export function mapFieldErrors<TFieldValues extends FieldValues = FieldValues>(
  form: UseFormReturn<TFieldValues>,
  serverErrors: ServerErrorPayload,
  knownFields?: readonly (FieldPath<TFieldValues> | string)[]
): void {
  if (!serverErrors) return

  const knownSet = knownFields ? new Set(knownFields as string[]) : null

  if (serverErrors.fieldErrors) {
    for (const [field, rawErr] of Object.entries(serverErrors.fieldErrors)) {
      const message = Array.isArray(rawErr) ? rawErr[0] : rawErr
      if (!message) continue

      if (!knownSet || knownSet.has(field)) {
        form.setError(field as FieldPath<TFieldValues>, {
          type: 'server',
          message,
        })
      } else {
        // Unknown field error mapped to form root
        form.setError(
          'root.serverError' as unknown as FieldPath<TFieldValues>,
          {
            type: 'server',
            message,
          }
        )
      }
    }
  }

  if (serverErrors.message) {
    form.setError('root.serverError' as unknown as FieldPath<TFieldValues>, {
      type: 'server',
      message: serverErrors.message,
    })
  }
}
