import type { defaultNS, resources } from './index'

export type * from './types.runtime'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: (typeof resources)['en']
  }
}
