import { createElement } from 'react'

import { act, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { projectConfig } from '@/config/project'
import type { FeatureDefinition } from '@/core/routing/types'

import { loadFeatureRoutes } from './feature-routes'
import { createRoutes } from './routes'

const moduleOf = (feature: FeatureDefinition) => async () => ({ feature })
const featureWithPath = (id: string, path: string): FeatureDefinition => ({
  id,
  routes: [{ route: { path } }],
})

describe('feature registration', () => {
  it('works with no feature files', async () => {
    expect(await loadFeatureRoutes({})).toEqual({
      features: [],
      routes: [],
      menu: [],
    })
  })

  it('reports duplicate feature ids with both source files', async () => {
    await expect(
      loadFeatureRoutes({
        'a/routes.tsx': moduleOf(featureWithPath('same', '/a')),
        'b/routes.tsx': moduleOf(featureWithPath('same', '/b')),
      })
    ).rejects.toThrow(/duplicate feature id.*same.*a\/routes.*b\/routes/i)
  })

  it.each([
    ['/reports', '/reports'],
    ['/Reports/', '/reports'],
    ['/users/:id', '/users/:userId'],
  ])('rejects conflicting paths %s and %s', async (first, second) => {
    await expect(
      loadFeatureRoutes({
        a: moduleOf(featureWithPath('one', first)),
        b: moduleOf(featureWithPath('two', second)),
      })
    ).rejects.toThrow(/duplicate route path/i)
  })

  it('detects nested paths and duplicate route ids', async () => {
    const nested: FeatureDefinition = {
      id: 'nested',
      routes: [
        {
          route: {
            path: '/team',
            children: [{ path: 'members', id: 'members' }],
          },
        },
      ],
    }
    await expect(
      loadFeatureRoutes({
        a: moduleOf(nested),
        b: moduleOf(featureWithPath('other', '/team/members')),
      })
    ).rejects.toThrow(/duplicate route path/i)
    await expect(
      loadFeatureRoutes({
        a: moduleOf(nested),
        b: moduleOf({
          id: 'other',
          routes: [{ route: { path: '/other', id: 'members' } }],
        }),
      })
    ).rejects.toThrow(/duplicate route id/i)
  })

  it('allows a parent and its index while reserving the starter home', async () => {
    await expect(
      loadFeatureRoutes({
        a: moduleOf({
          id: 'team',
          routes: [{ route: { path: '/team', children: [{ index: true }] } }],
        }),
      })
    ).resolves.toBeDefined()
    await expect(
      loadFeatureRoutes({ a: moduleOf(featureWithPath('home', '/')) })
    ).rejects.toThrow(/reserved route path/i)
  })

  it('omits optional examples without dropping product features', async () => {
    const example: FeatureDefinition = {
      ...featureWithPath('example', '/example'),
      example: true,
    }
    const result = await loadFeatureRoutes(
      {
        example: moduleOf(example),
        product: moduleOf(featureWithPath('product', '/product')),
      },
      { examplesEnabled: false }
    )
    expect(result.features.map((feature) => feature.id)).toEqual(['product'])
  })

  it('does not import page modules until the matching route is visited', async () => {
    let pageLoads = 0
    const feature: FeatureDefinition = {
      id: 'catalog',
      routes: [
        {
          route: {
            path: '/catalog',
            lazy: async () => {
              pageLoads++
              return {
                Component: () => createElement('h1', null, 'Catalog page'),
              }
            },
          },
        },
      ],
      menu: [{ id: 'catalog', label: 'Catalog', href: '/catalog' }],
    }
    const registered = await loadFeatureRoutes({
      'catalog/routes.tsx': moduleOf(feature),
    })
    const router = createMemoryRouter(
      createRoutes(projectConfig, registered.routes),
      { initialEntries: ['/'] }
    )
    try {
      render(createElement(RouterProvider, { router }))
      await screen.findByRole('heading', {
        name: 'Your next frontend starts here.',
      })
      expect(pageLoads).toBe(0)
      expect(registered.menu).toEqual([
        { id: 'catalog', label: 'Catalog', href: '/catalog' },
      ])
      await act(async () => {
        await router.navigate('/catalog')
      })
      expect(
        await screen.findByRole('heading', { name: 'Catalog page' })
      ).toBeVisible()
      expect(pageLoads).toBe(1)
    } finally {
      router.dispose()
    }
  })
})
