import type {
  FeatureDefinition,
  FeatureMenuItem,
  FeatureRouteContribution,
} from '@/core/routing'

export type { FeatureDefinition, FeatureMenuItem, FeatureRouteContribution }

export interface NavigationLink {
  id: string
  label: string
  href: string
  icon?: string
  badge?: string | number
  children?: NavigationLink[]
}

export interface RouteNavigationState {
  from?: {
    pathname: string
    search?: string
    hash?: string
  }
}
