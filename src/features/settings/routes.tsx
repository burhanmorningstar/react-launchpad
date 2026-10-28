import type { FeatureDefinition } from '@/core/routing/types'

const lazy = () =>
  import('./pages/SettingsPage').then(({ SettingsPage }) => ({
    Component: SettingsPage,
  }))

export const feature = {
  id: 'settings',
  example: true,
  menu: [
    { id: 'settings', label: 'navigation.settings', href: '/settings' },
    {
      id: 'admin-settings',
      label: 'navigation.settings',
      href: '/admin/settings',
    },
  ],
  routes: [
    { mount: 'dashboard', route: { path: '/settings', lazy } },
    { mount: 'admin', route: { path: '/admin/settings', lazy } },
  ],
} satisfies FeatureDefinition
