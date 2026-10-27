import { Navigate } from 'react-router'

import { projectConfig } from '@/config/project'
import type { ProjectConfig } from '@/config/project'

import { exampleRoutes } from './example-routes'
import { RootLayout } from '../layouts/RootLayout'
import { NotFoundPage } from '../pages/NotFoundPage'
import { RouteErrorPage } from '../pages/RouteErrorPage'
import { WelcomePage } from '../pages/WelcomePage'

import type { RouteObject } from 'react-router'

export function createRoutes(
  config: ProjectConfig = projectConfig
): RouteObject[] {
  return [
    {
      path: '/',
      element: <RootLayout />,
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
        ...(config.examplesEnabled ? exampleRoutes : []),
        { path: '*', element: <NotFoundPage homePath={config.homePath} /> },
      ],
    },
  ]
}

export const routes = createRoutes()
