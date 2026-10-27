import { lazy } from 'react'

import { ROUTES } from '@/config'
import type { FeatureRouteContribution } from '@/core/routing/types'

import { AuthGuard } from './guards/AuthGuard'
import { GuestGuard } from './guards/GuestGuard'
import { RoleGuard } from './guards/RoleGuard'

import type { RouteObject } from 'react-router'

const AdminLayout = lazy(() =>
  import('../layouts/AdminLayout').then((m) => ({ default: m.AdminLayout }))
)
const AuthLayout = lazy(() =>
  import('../layouts/AuthLayout').then((m) => ({ default: m.AuthLayout }))
)
const DashboardLayout = lazy(() =>
  import('../layouts/DashboardLayout').then((m) => ({
    default: m.DashboardLayout,
  }))
)

// Product/session decisions belong to the app, never to the core contract.
export function composeFeatureRoutes(
  contributions: readonly FeatureRouteContribution[]
): RouteObject[] {
  const mounts = {
    guest: (
      <GuestGuard>
        <AuthLayout />
      </GuestGuard>
    ),
    dashboard: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    admin: (
      <RoleGuard allowedRoles={['admin']} fallbackPath={ROUTES.DASHBOARD}>
        <AdminLayout />
      </RoleGuard>
    ),
  }
  for (const { mount } of contributions) {
    if (mount && !Object.hasOwn(mounts, mount))
      throw new Error(`Unknown feature route mount '${mount}'`)
  }
  return [
    ...contributions.filter(({ mount }) => !mount).map(({ route }) => route),
    ...Object.entries(mounts).flatMap(([mount, element]) => {
      const children = contributions
        .filter((item) => item.mount === mount)
        .map(({ route }) => route)
      return children.length ? [{ element, children }] : []
    }),
  ]
}
