import type { RouteObject } from 'react-router'

export interface FeatureRouteContribution {
  route: RouteObject
  /** App-owned layout slot. Omit for a public, unwrapped route. */
  mount?: string
}

export interface FeatureMenuItem {
  id: string
  label: string
  href: string
}

export interface FeatureDefinition {
  id: string
  routes: readonly FeatureRouteContribution[]
  menu?: readonly FeatureMenuItem[]
  /** Allows the app to omit demo contributions without removing product features. */
  example?: boolean
}
