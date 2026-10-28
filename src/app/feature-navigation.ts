import { createContext } from 'react'

import type { FeatureDefinition } from '@/core/routing/types'

/** The app supplies discovered descriptors; core only receives resolved nav data. */
export const FeatureNavigationContext = createContext<
  readonly FeatureDefinition[]
>([])
