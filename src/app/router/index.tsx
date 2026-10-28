import { use } from 'react'

import { createBrowserRouter, RouterProvider } from 'react-router'

import { projectConfig } from '@/config/project'

import { FeatureNavigationContext } from '../feature-navigation'
import { loadFeatureRoutes } from './feature-routes'
import { createRoutes } from './routes'

const routerPromise = loadFeatureRoutes(undefined, {
  examplesEnabled: projectConfig.examplesEnabled,
  reservedPaths: ['/', projectConfig.homePath, '/*'],
}).then(async ({ routes, features }) => {
  const router = createBrowserRouter(createRoutes(projectConfig, routes))
  // A lazy initial match can settle before a suspended RouterProvider commits
  // its subscription. Mount it with the ready snapshot to avoid losing that
  // first update (and leaving a direct /login visit on the loading screen).
  if (!router.state.initialized) {
    await new Promise<void>((resolve) => {
      const unsubscribe = router.subscribe((state) => {
        if (state.initialized) {
          unsubscribe()
          resolve()
        }
      })
    })
  }
  return { router, features }
})

export function AppRouter() {
  const { router, features } = use(routerPromise)
  return (
    <FeatureNavigationContext.Provider value={features}>
      <RouterProvider router={router} />
    </FeatureNavigationContext.Provider>
  )
}
