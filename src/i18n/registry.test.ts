import { describe, expect, it } from 'vitest'

import { createNamespaceLoader } from './loadNamespace'
import { createLocaleRegistry, getLocaleMetadata, getLocales } from './registry'

describe('i18n registry', () => {
  it('discovers locales from metadata files', () => {
    const locales = getLocales()
    expect(locales.length).toBeGreaterThanOrEqual(2)

    const en = getLocaleMetadata('en')
    expect(en).toBeDefined()
    expect(en?.code).toBe('en')
    expect(en?.name).toBe('English')
    expect(en?.direction).toBe('ltr')
    expect(en?.status).toBe('enabled')

    const tr = getLocaleMetadata('tr')
    expect(tr).toBeDefined()
    expect(tr?.code).toBe('tr')
    expect(tr?.name).toBe('Türkçe')
    expect(tr?.direction).toBe('ltr')
    expect(tr?.status).toBe('enabled')
  })

  it('filters drafts by default and includes them when requested', () => {
    const mockMetaFiles = {
      './locales/en/_meta.json': {
        code: 'en',
        name: 'English',
        direction: 'ltr',
        status: 'enabled',
      },
      './locales/tr/_meta.json': {
        code: 'tr',
        name: 'Türkçe',
        direction: 'ltr',
        status: 'enabled',
      },
      './locales/ar/_meta.json': {
        code: 'ar',
        name: 'العربية',
        direction: 'rtl',
        status: 'draft',
      },
    }

    const registry = createLocaleRegistry(mockMetaFiles)
    expect(registry.getLocales().map((l) => l.code)).toEqual(['en', 'tr'])
    expect(
      registry.getLocales({ includeDrafts: true }).map((l) => l.code)
    ).toEqual(['en', 'tr', 'ar'])
    expect(registry.isSupportedLocale('ar')).toBe(false)
    expect(registry.isSupportedLocale('ar', { includeDrafts: true })).toBe(true)
  })

  it('throws an informative error if metadata format is invalid', () => {
    const brokenMetaFiles = {
      './locales/xx/_meta.json': { code: 'xx', invalid: true },
    }

    expect(() => createLocaleRegistry(brokenMetaFiles)).toThrow(
      /Invalid locale metadata/i
    )
  })

  it('resolves locale preferences with URL > Storage > Navigator > Default order', () => {
    const registry = createLocaleRegistry({
      './locales/en/_meta.json': {
        code: 'en',
        name: 'English',
        direction: 'ltr',
        status: 'enabled',
      },
      './locales/tr/_meta.json': {
        code: 'tr',
        name: 'Türkçe',
        direction: 'ltr',
        status: 'enabled',
      },
    })

    // 1. URL search param wins
    const urlResult = registry.resolveLocalePreference({
      searchParams: new URLSearchParams('lang=tr'),
      stored: 'en',
      navigatorLanguages: ['en-US'],
      defaultLocale: 'en',
    })
    expect(urlResult).toBe('tr')

    // 2. Storage wins when URL is missing
    const storageResult = registry.resolveLocalePreference({
      searchParams: new URLSearchParams(''),
      stored: 'tr',
      navigatorLanguages: ['en-US'],
      defaultLocale: 'en',
    })
    expect(storageResult).toBe('tr')

    // 3. Navigator wins when storage and URL are missing
    const navResult = registry.resolveLocalePreference({
      stored: null,
      navigatorLanguages: ['tr-TR', 'en-US'],
      defaultLocale: 'en',
    })
    expect(navResult).toBe('tr')

    // 4. Default locale when nothing matches
    const defaultResult = registry.resolveLocalePreference({
      stored: null,
      navigatorLanguages: ['fr-FR'],
      defaultLocale: 'en',
    })
    expect(defaultResult).toBe('en')
  })
})

describe('loadNamespace', () => {
  it('deduplicates simultaneous in-flight requests for the same locale and namespace', async () => {
    let fetchCount = 0
    const mockLoaders: Record<
      string,
      () => Promise<{ default: Record<string, unknown> }>
    > = {
      './locales/en/common.json': async () => {
        fetchCount++
        await new Promise((r) => setTimeout(r, 20))
        return { default: { app: { name: 'Launchpad' } } }
      },
    }

    const loader = createNamespaceLoader(mockLoaders)

    // Call twice concurrently
    const [p1, p2] = await Promise.all([
      loader.loadNamespace('en', 'common'),
      loader.loadNamespace('en', 'common'),
    ])

    expect(fetchCount).toBe(1)
    expect(p1).toEqual({ app: { name: 'Launchpad' } })
    expect(p2).toEqual({ app: { name: 'Launchpad' } })
  })

  it('falls back to canonical en namespace when requested locale namespace does not exist', async () => {
    const mockLoaders: Record<
      string,
      () => Promise<{ default: Record<string, unknown> }>
    > = {
      './locales/en/feature.json': async () => ({
        default: { hello: 'Hello' },
      }),
    }

    const loader = createNamespaceLoader(mockLoaders)
    const result = await loader.loadNamespace('tr', 'feature')
    expect(result).toEqual({ hello: 'Hello' })
  })
})
