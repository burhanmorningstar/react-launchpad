import type { FeatureDefinition } from '@/core/routing/types'

const lazy = () =>
  import('./pages/SettingsPage').then(({ SettingsPage }) => ({
    Component: SettingsPage,
  }))

export const feature = {
  id: 'settings',
  example: true,
  routes: [
    { mount: 'dashboard', route: { path: '/settings', lazy } },
    { mount: 'admin', route: { path: '/admin/settings', lazy } },
  ],
} satisfies FeatureDefinition
