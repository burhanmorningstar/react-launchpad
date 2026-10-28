import { useEffect, type ReactNode } from 'react'

import { I18nextProvider } from 'react-i18next'

import i18n, { getLocaleMetadata } from '@/i18n'

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      const meta = getLocaleMetadata(lng)
      document.documentElement.lang = lng
      document.documentElement.dir = meta?.direction || 'ltr'
    }

    handleLanguageChanged(i18n.language)
    i18n.on('languageChanged', handleLanguageChanged)

    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
