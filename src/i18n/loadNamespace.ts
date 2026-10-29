import type { i18n as I18nInstance } from 'i18next'

export type NamespaceModuleLoader = () => Promise<{
  default: Record<string, unknown>
}>

export function createNamespaceLoader(
  loaders: Record<string, NamespaceModuleLoader>,
  i18nInstance?: I18nInstance
) {
  const inFlight = new Map<string, Promise<Record<string, unknown>>>()
  const loadedCache = new Map<string, Record<string, unknown>>()

  async function loadNamespace(
    locale: string,
    namespace: string
  ): Promise<Record<string, unknown>> {
    const cacheKey = `${locale}:${namespace}`

    if (loadedCache.has(cacheKey)) {
      return loadedCache.get(cacheKey)!
    }

    if (inFlight.has(cacheKey)) {
      return inFlight.get(cacheKey)!
    }

    const promise = (async () => {
      const directKey = `./locales/${locale}/${namespace}.json`
      const fallbackKey = `./locales/en/${namespace}.json`

      let loader = loaders[directKey]
      let resolvedLocale = locale

      if (!loader && locale !== 'en') {
        loader = loaders[fallbackKey]
        resolvedLocale = 'en'
      }

      if (!loader) {
        throw new Error(
          `Namespace "${namespace}" not found for locale "${locale}" (fallback "en" also unavailable)`
        )
      }

      const module = await loader()
      const data = module.default

      loadedCache.set(cacheKey, data)

      if (i18nInstance) {
        i18nInstance.addResourceBundle(
          resolvedLocale,
          namespace,
          data,
          true,
          true
        )
        if (resolvedLocale !== locale) {
          // Add to requested locale as fallback so useTranslation finds it
          i18nInstance.addResourceBundle(locale, namespace, data, true, true)
        }
      }

      return data
    })().finally(() => {
      inFlight.delete(cacheKey)
    })

    inFlight.set(cacheKey, promise)
    return promise
  }

  return {
    loadNamespace,
    loadedCache,
  }
}

// Default loader scanning all locale JSONs via Vite import.meta.glob
const defaultLoaders = import.meta.glob('./locales/*/*.json') as Record<
  string,
  NamespaceModuleLoader
>

export function getAvailableNamespaces(): string[] {
  const nsSet = new Set<string>()
  for (const p of Object.keys(defaultLoaders)) {
    const match = /\/([^/]+)\.json$/.exec(p)
    if (match && !match[1].startsWith('_')) {
      nsSet.add(match[1])
    }
  }
  return Array.from(nsSet)
}

let defaultNamespaceLoader = createNamespaceLoader(defaultLoaders)

export function setI18nInstanceForLoader(i18n: I18nInstance) {
  defaultNamespaceLoader = createNamespaceLoader(defaultLoaders, i18n)
}

export function loadNamespace(locale: string, namespace: string) {
  return defaultNamespaceLoader.loadNamespace(locale, namespace)
}
