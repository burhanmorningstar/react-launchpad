import { Navigate } from 'react-router'

import { projectConfig } from '@/config/project'
import type { ProjectConfig } from '@/config/project'
import type { FeatureRouteContribution } from '@/core/routing/types'

import { composeFeatureRoutes } from './feature-layouts'
import { RootLayout } from '../layouts/RootLayout'
import { NotFoundPage } from '../pages/NotFoundPage'
import { RouteErrorPage } from '../pages/RouteErrorPage'
import { WelcomePage } from '../pages/WelcomePage'
import { PageLoader } from '../providers/PageLoader'

import type { RouteObject } from 'react-router'

export function createRoutes(
  config: ProjectConfig = projectConfig,
  contributions: readonly FeatureRouteContribution[] = []
): RouteObject[] {
  return [
    {
      path: '/',
      element: <RootLayout />,
      hydrateFallbackElement: <PageLoader />,
      errorElement: <RouteErrorPage homePath={config.homePath} />,
      children: [
        ...(config.homePath === '/'
          ? [{ index: true as const, element: <WelcomePage config={config} /> }]
          : [
              {
                index: true as const,
                element: <Navigate to={config.homePath} replace />,
              },
              {
                path: config.homePath.slice(1),
                element: <WelcomePage config={config} />,
              },
            ]),
        ...composeFeatureRoutes(contributions),
        { path: '*', element: <NotFoundPage homePath={config.homePath} /> },
      ],
    },
  ]
}
