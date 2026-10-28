import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { projectConfig } from '@/config/project'

import { setI18nInstanceForLoader } from './loadNamespace'
import enCommon from './locales/en/common.json'
import enExamples from './locales/en/examples.json'
import enUsers from './locales/en/users.json'
import enValidation from './locales/en/validation.json'
import trCommon from './locales/tr/common.json'
import trExamples from './locales/tr/examples.json'
import trUsers from './locales/tr/users.json'
import trValidation from './locales/tr/validation.json'
import { getLocaleMetadata, resolveLocalePreference } from './registry'

export const defaultNS = 'common'

export const resources = {
  en: {
    common: enCommon,
    examples: enExamples,
    users: enUsers,
    validation: enValidation,
  },
  tr: {
    common: trCommon,
    examples: trExamples,
    users: trUsers,
    validation: trValidation,
  },
} as const

// Resolve initial locale preference safely
let initialLocale = projectConfig.defaultLocale
if (typeof window !== 'undefined') {
  let stored: string | null = null
  try {
    stored = window.localStorage.getItem('preferred-locale')
  } catch {
    // Gracefully handle denied or restricted storage access
  }

  initialLocale = resolveLocalePreference({
    searchParams: new URLSearchParams(window.location.search),
    stored,
    navigatorLanguages: window.navigator.languages ?? [
      window.navigator.language,
    ],
    defaultLocale: projectConfig.defaultLocale,
  })
}

i18n.use(initReactI18next).init({
  resources,
  lng: initialLocale,
  fallbackLng: 'en',
  defaultNS,
  interpolation: {
    escapeValue: false,
  },
})

// Synchronize document lang & dir attributes with active locale
function updateDocumentLocale(lng: string) {
  if (typeof document !== 'undefined') {
    const meta = getLocaleMetadata(lng)
    document.documentElement.lang = lng
    document.documentElement.dir = meta?.direction || 'ltr'
  }
}

updateDocumentLocale(initialLocale)

i18n.on('languageChanged', (lng) => {
  updateDocumentLocale(lng)
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('preferred-locale', lng)
    } catch {
      // Storage failure is non-fatal
    }
  }
})

setI18nInstanceForLoader(i18n)

export default i18n
export * from './types.runtime'
export * from './registry'
export * from './loadNamespace'
export * from './format'
