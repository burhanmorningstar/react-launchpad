import type {
  GetLocalesOptions,
  LocaleDirection,
  LocaleMetadata,
  LocalePreferenceParams,
  LocaleStatus,
} from './types.runtime'

export function parseMetadata(path: string, raw: unknown): LocaleMetadata {
  const data = (
    raw && typeof raw === 'object' && 'default' in raw
      ? (raw as { default: unknown }).default
      : raw
  ) as Partial<LocaleMetadata> | null

  if (
    !data ||
    typeof data.code !== 'string' ||
    typeof data.name !== 'string' ||
    !['ltr', 'rtl'].includes(data.direction as string) ||
    !['draft', 'enabled'].includes(data.status as string)
  ) {
    throw new Error(
      `Invalid locale metadata in ${path}: expected code, name, direction ('ltr'|'rtl'), and status ('draft'|'enabled')`
    )
  }

  return {
    code: data.code,
    name: data.name,
    direction: data.direction as LocaleDirection,
    status: data.status as LocaleStatus,
  }
}

export function createLocaleRegistry(metaModules: Record<string, unknown>) {
  const localesMap = new Map<string, LocaleMetadata>()

  for (const [path, raw] of Object.entries(metaModules)) {
    const meta = parseMetadata(path, raw)
    localesMap.set(meta.code, meta)
  }

  function getLocales(options?: GetLocalesOptions): LocaleMetadata[] {
    const all = Array.from(localesMap.values())
    if (options?.includeDrafts) {
      return all
    }
    return all.filter((l) => l.status === 'enabled')
  }

  function getLocaleMetadata(code: string): LocaleMetadata | undefined {
    return localesMap.get(code)
  }

  function isSupportedLocale(
    code: string,
    options?: GetLocalesOptions
  ): boolean {
    const meta = localesMap.get(code)
    if (!meta) return false
    if (options?.includeDrafts) return true
    return meta.status === 'enabled'
  }

  function resolveLocalePreference({
    searchParams,
    stored,
    navigatorLanguages = [],
    defaultLocale = 'en',
  }: LocalePreferenceParams): string {
    // 1. URL parameter preference
    if (searchParams) {
      const urlCandidate =
        searchParams.get('lang') ?? searchParams.get('locale')
      if (urlCandidate && isSupportedLocale(urlCandidate)) {
        return urlCandidate
      }
    }

    // 2. Storage preference
    if (stored && isSupportedLocale(stored)) {
      return stored
    }

    // 3. Browser preference
    for (const lang of navigatorLanguages) {
      if (isSupportedLocale(lang)) {
        return lang
      }
      const baseLang = lang.split('-')[0]
      if (baseLang && isSupportedLocale(baseLang)) {
        return baseLang
      }
    }

    // 4. Default project locale
    if (isSupportedLocale(defaultLocale)) {
      return defaultLocale
    }

    const firstEnabled = getLocales()[0]
    return firstEnabled?.code ?? 'en'
  }

  return {
    getLocales,
    getLocaleMetadata,
    isSupportedLocale,
    resolveLocalePreference,
  }
}

// Default registry discovered via Vite import.meta.glob
const defaultMetaModules = import.meta.glob('./locales/*/_meta.json', {
  eager: true,
})
const defaultRegistry = createLocaleRegistry(defaultMetaModules)

export const getLocales = defaultRegistry.getLocales
export const getLocaleMetadata = defaultRegistry.getLocaleMetadata
export const isSupportedLocale = defaultRegistry.isSupportedLocale
export const resolveLocalePreference = defaultRegistry.resolveLocalePreference
