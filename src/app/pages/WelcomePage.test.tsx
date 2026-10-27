import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { projectConfig } from '@/config/project'

import { AppProviders } from '../providers'
import { loadFeatureRoutes } from '../router/feature-routes'
import { createRoutes } from '../router/routes'

import type { RouteObject } from 'react-router'

let routes: RouteObject[]
beforeAll(async () => {
  const registered = await loadFeatureRoutes()
  routes = createRoutes(projectConfig, registered.routes)
})

beforeEach(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }))
  localStorage.clear()
})

afterEach(() => vi.unstubAllGlobals())

function openPage(path: string, routeDefinitions = routes) {
  const router = createMemoryRouter(routeDefinitions, {
    initialEntries: [path],
  })
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
  return router
}

describe('backend-free starter', () => {
  it('applies a custom brand and home path with examples disabled', async () => {
    const router = openPage(
      '/',
      createRoutes({
        ...projectConfig,
        name: 'Sample Studio',
        brand: { mark: 'SS', tagline: 'A home for your ideas.' },
        homePath: '/start',
        examplesEnabled: false,
      })
    )
    expect(
      await screen.findByRole('link', { name: 'Sample Studio' })
    ).toBeVisible()
    expect(router.state.location.pathname).toBe('/start')
    expect(
      screen.queryByRole('link', { name: 'Explore example screens' })
    ).not.toBeInTheDocument()
    await act(async () => {
      await router.navigate('/login')
    })
    expect(
      await screen.findByRole('heading', { name: 'Page not found' })
    ).toBeVisible()
    fireEvent.click(screen.getByRole('link', { name: 'Back to home' }))
    expect(
      await screen.findByRole('link', { name: 'Sample Studio' })
    ).toBeVisible()
    router.dispose()
  })

  it('opens a useful welcome page without redirecting to login', async () => {
    const router = openPage('/')
    expect(
      await screen.findByRole('heading', {
        name: 'Your next frontend starts here.',
      })
    ).toBeVisible()
    expect(screen.getByText('No backend required')).toBeVisible()
    expect(router.state.location.pathname).toBe('/')
    expect(
      screen.queryByRole('textbox', { name: /email/i })
    ).not.toBeInTheDocument()
    router.dispose()
  })

  it('shows a deliberate 404 with a working way home', async () => {
    const router = openPage('/missing-page')
    expect(
      await screen.findByRole('heading', { name: 'Page not found' })
    ).toBeVisible()
    fireEvent.click(screen.getByRole('link', { name: 'Back to home' }))
    expect(
      await screen.findByRole('heading', {
        name: 'Your next frontend starts here.',
      })
    ).toBeVisible()
    router.dispose()
  })

  it('contains a render failure and lets the user return home', async () => {
    const expectedError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    function BrokenPage(): never {
      throw new Error('private-render-detail')
    }
    const definitions = routes.map((route) =>
      route.index
        ? route
        : {
            ...route,
            children: [
              ...(route.children ?? []),
              { path: '__broken', element: <BrokenPage /> },
            ],
          }
    )
    try {
      const router = openPage('/__broken', definitions)
      expect(
        await screen.findByRole('heading', { name: 'Something went wrong' })
      ).toBeVisible()
      expect(
        screen.queryByText(/private-render-detail/)
      ).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('link', { name: 'Back to home' }))
      expect(
        await screen.findByRole('heading', {
          name: 'Your next frontend starts here.',
        })
      ).toBeVisible()
      router.dispose()
    } finally {
      expectedError.mockRestore()
    }
  })

  it('keeps the existing protected examples behind login', async () => {
    const router = openPage('/dashboard')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'), {
      timeout: 4000,
    })
    router.dispose()
  })
})
