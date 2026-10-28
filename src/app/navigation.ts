import { createElement } from 'react'

import { LayoutDashboardIcon, SettingsIcon, UsersIcon } from 'lucide-react'
import { matchRoutes } from 'react-router'

import { ROUTES } from '@/config'
import type { UserRole } from '@/core/auth/types'
import type { NavigationItem } from '@/core/layouts/types'
import type { FeatureDefinition } from '@/core/routing/types'

export type NavigationArea = 'dashboard' | 'admin'
// Optional app presentation overrides; new feature menus need no entry here.
const icons: Record<string, typeof LayoutDashboardIcon> = {
  [ROUTES.DASHBOARD]: LayoutDashboardIcon,
  [ROUTES.ADMIN_DASHBOARD]: LayoutDashboardIcon,
  [ROUTES.ADMIN_USERS]: UsersIcon,
  [ROUTES.SETTINGS]: SettingsIcon,
  [ROUTES.ADMIN_SETTINGS]: SettingsIcon,
}
const fallbacks: Record<string, string> = {
  'navigation.dashboard': 'Dashboard',
  'navigation.users': 'Users',
  'navigation.settings': 'Settings',
}

/** Resolve app-owned layout permissions without importing any page modules. */
export function getAppNavigation(
  area: NavigationArea,
  role: UserRole | undefined,
  translate: (key: string, fallback: string) => string,
  features: readonly FeatureDefinition[] = []
): NavigationItem[] {
  if (!role || (area === 'admin' && role !== 'admin')) return []
  return features.flatMap((feature) =>
    (feature.menu ?? [])
      .filter((item) =>
        feature.routes.some(
          ({ mount, route }) =>
            mount === area &&
            matchRoutes([route], item.href.split(/[?#]/)[0]) !== null
        )
      )
      .map((item) => ({
        id: feature.id + ':' + item.id,
        label: translate(item.label, fallbacks[item.label] ?? item.label),
        href: item.href,
        icon: icons[item.href] ? createElement(icons[item.href]) : undefined,
      }))
  )
}
