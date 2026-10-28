import type { FeatureDefinition } from '@/core/routing/types'

export const feature = {
  id: 'users',
  example: true,
  menu: [{ id: 'users', label: 'navigation.users', href: '/admin/users' }],
  routes: [
    {
      mount: 'admin',
      route: {
        path: '/admin/users',
        lazy: () =>
          import('./pages/UsersPage').then(({ default: UsersPage }) => ({
            Component: UsersPage,
          })),
      },
    },
  ],
} satisfies FeatureDefinition
