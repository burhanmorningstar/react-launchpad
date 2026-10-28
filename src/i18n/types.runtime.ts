export type LocaleDirection = 'ltr' | 'rtl'
export type LocaleStatus = 'draft' | 'enabled'

export interface LocaleMetadata {
  code: string
  name: string
  direction: LocaleDirection
  status: LocaleStatus
}

export interface GetLocalesOptions {
  includeDrafts?: boolean
}

export interface LocalePreferenceParams {
  searchParams?: URLSearchParams
  stored?: string | null
  navigatorLanguages?: readonly string[]
  defaultLocale?: string
}

export interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  timeZone?: string
}

export interface FormatDateTimeOptions extends Intl.DateTimeFormatOptions {
  timeZone?: string
}
