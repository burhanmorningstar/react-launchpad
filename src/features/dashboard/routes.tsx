import type { FeatureDefinition } from '@/core/routing/types'

export const feature = {
  id: 'dashboard',
  example: true,
  menu: [
    { id: 'overview', label: 'navigation.dashboard', href: '/dashboard' },
    { id: 'admin-overview', label: 'navigation.dashboard', href: '/admin' },
  ],
  routes: [
    {
      mount: 'dashboard',
      route: {
        path: '/dashboard',
        lazy: () =>
          import('./pages/DashboardPage').then(({ DashboardPage }) => ({
            Component: DashboardPage,
          })),
      },
    },
    {
      mount: 'admin',
      route: {
        path: '/admin',
        lazy: () =>
          import('./pages/AdminDashboardPage').then(
            ({ AdminDashboardPage }) => ({ Component: AdminDashboardPage })
          ),
      },
    },
  ],
} satisfies FeatureDefinition
