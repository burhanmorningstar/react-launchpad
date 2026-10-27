import type { FeatureDefinition } from '@/core/routing/types'

export const feature = {
  id: 'auth',
  example: true,
  routes: [
    {
      mount: 'guest',
      route: {
        path: '/login',
        lazy: () =>
          import('./pages/LoginPage').then(({ LoginPage }) => ({
            Component: LoginPage,
          })),
      },
    },
    {
      mount: 'guest',
      route: {
        path: '/register',
        lazy: () =>
          import('./pages/RegisterPage').then(({ RegisterPage }) => ({
            Component: RegisterPage,
          })),
      },
    },
  ],
} satisfies FeatureDefinition
