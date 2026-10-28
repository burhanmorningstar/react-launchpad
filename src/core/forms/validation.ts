import type { TFunction } from 'i18next'

/**
 * Encodes a localization key and optional interpolation parameters
 * into a structured message string for Zod / RHF.
 */
export function vMsg(key: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) {
    return key
  }
  return JSON.stringify({ _vKey: key, ...params })
}

export type TranslationFunction =
  | TFunction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((key: string, options?: any) => string)

/**
 * Translates a validation message at render time using the active locale.
 */
export function formatValidationMessage(
  rawMessage: string | undefined,
  t: TranslationFunction
): string {
  if (!rawMessage) return ''

  if (rawMessage.startsWith('{"_vKey":')) {
    try {
      const parsed = JSON.parse(rawMessage)
      const { _vKey, ...params } = parsed
      return (t as (k: string, p?: unknown) => string)(_vKey, params)
    } catch {
      // Fallback to raw if JSON parse fails
      return rawMessage
    }
  }

  // Handle direct translation keys like 'validation:required' or 'validation.email'
  if (
    rawMessage.startsWith('validation:') ||
    rawMessage.startsWith('common:')
  ) {
    return (t as (k: string) => string)(rawMessage)
  }

  return rawMessage
}
