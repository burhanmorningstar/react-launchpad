import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { projectConfig } from '@/config/project'

import enCommon from './locales/en/common.json'
import enUsers from './locales/en/users.json'
import trCommon from './locales/tr/common.json'
import trUsers from './locales/tr/users.json'

export const defaultNS = 'common'
export const resources = {
  en: {
    common: enCommon,
    users: enUsers,
  },
  tr: {
    common: trCommon,
    users: trUsers,
  },
} as const

i18n.use(initReactI18next).init({
  resources,
  lng: projectConfig.defaultLocale,
  fallbackLng: 'en',
  defaultNS,
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
