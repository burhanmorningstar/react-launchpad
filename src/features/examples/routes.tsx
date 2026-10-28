import type { FeatureDefinition } from '@/core/routing/types'

export const feature = {
  id: 'examples',
  example: true,
  menu: [
    { id: 'examples-overview', label: 'Examples', href: '/examples' },
    { id: 'examples-forms', label: 'Forms', href: '/examples/forms' },
    { id: 'examples-tables', label: 'Tables', href: '/examples/tables' },
    { id: 'examples-files', label: 'Files', href: '/examples/files' },
    { id: 'examples-content', label: 'Content', href: '/examples/content' },
  ],
  routes: [
    {
      mount: 'dashboard',
      route: {
        path: '/examples',
        lazy: () =>
          import('./pages/OverviewPage').then(({ default: OverviewPage }) => ({
            Component: OverviewPage,
          })),
      },
    },
    {
      mount: 'dashboard',
      route: {
        path: '/examples/forms',
        lazy: () =>
          import('./pages/FormsPage').then(({ default: FormsPage }) => ({
            Component: FormsPage,
          })),
      },
    },
    {
      mount: 'dashboard',
      route: {
        path: '/examples/tables',
        lazy: () =>
          import('./pages/TablesPage').then(({ default: TablesPage }) => ({
            Component: TablesPage,
          })),
      },
    },
    {
      mount: 'dashboard',
      route: {
        path: '/examples/files',
        lazy: () =>
          import('./pages/FilesPage').then(({ default: FilesPage }) => ({
            Component: FilesPage,
          })),
      },
    },
    {
      mount: 'dashboard',
      route: {
        path: '/examples/content',
        lazy: () =>
          import('./pages/ContentPage').then(({ default: ContentPage }) => ({
            Component: ContentPage,
          })),
      },
    },
  ],
} satisfies FeatureDefinition
