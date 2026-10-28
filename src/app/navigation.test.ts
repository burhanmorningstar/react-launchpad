import { describe, expect, it, vi } from 'vitest'

import type { FeatureDefinition } from '@/core/routing/types'
import { feature as dashboard } from '@/features/dashboard/routes'
import { feature as settings } from '@/features/settings/routes'
import { feature as users } from '@/features/users/routes'

import { getAppNavigation } from './navigation'

describe('app navigation permissions', () => {
  const existingFeatures = [dashboard, users, settings]
  const translate = (key: string) => `translated:${key}`
  it('filters admin destinations in the app and translates plain core labels', () => {
    expect(
      getAppNavigation('admin', 'user', translate, existingFeatures)
    ).toEqual([])
    expect(
      getAppNavigation('admin', undefined, translate, existingFeatures)
    ).toEqual([])
    expect(
      getAppNavigation('admin', 'admin', translate, existingFeatures).map(
        (item) => item.href
      )
    ).toEqual(['/admin', '/admin/users', '/admin/settings'])
    expect(
      getAppNavigation('dashboard', 'user', translate, existingFeatures)[0]
        .label
    ).toBe('translated:navigation.dashboard')
  })

  it('consumes discovered menu contributions without a central list edit or eager page loading', () => {
    const lazy = vi.fn(async () => ({ Component: () => null }))
    const features: FeatureDefinition[] = [
      {
        id: 'reports',
        routes: [{ mount: 'admin', route: { path: '/admin/reports', lazy } }],
        menu: [{ id: 'report-list', label: 'Reports', href: '/admin/reports' }],
      },
    ]
    expect(getAppNavigation('admin', 'admin', translate, features)).toEqual([
      expect.objectContaining({
        id: 'reports:report-list',
        label: 'translated:Reports',
        href: '/admin/reports',
      }),
    ])
    expect(getAppNavigation('admin', 'user', translate, features)).toEqual([])
    expect(getAppNavigation('dashboard', 'admin', translate, features)).toEqual(
      []
    )
    expect(lazy).not.toHaveBeenCalled()
  })
})
