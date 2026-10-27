import { lazy } from 'react'

import { ROUTES } from '@/config'

import { AuthGuard } from './guards/AuthGuard'
import { GuestGuard } from './guards/GuestGuard'
import { RoleGuard } from './guards/RoleGuard'

import type { RouteObject } from 'react-router'

// Lazy load pages
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
const LoginPage = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.LoginPage }))
)
const RegisterPage = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.RegisterPage }))
)
const DashboardPage = lazy(() =>
  import('@/features/dashboard').then((m) => ({ default: m.DashboardPage }))
)
const AdminDashboardPage = lazy(() =>
  import('@/features/dashboard').then((m) => ({
    default: m.AdminDashboardPage,
  }))
)
const SettingsPage = lazy(() =>
  import('@/features/settings').then((m) => ({ default: m.SettingsPage }))
)
const UsersPage = lazy(() =>
  import('@/features/users').then((m) => ({ default: m.UsersPage }))
)

// Kept together until the examples move to their dedicated feature in Task 17.
export const exampleRoutes: RouteObject[] = [
  // Auth routes (guest only)
  {
    element: (
      <GuestGuard>
        <AuthLayout />
      </GuestGuard>
    ),
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },

  // User protected routes
  {
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },

  // Admin protected routes
  {
    path: 'admin',
    element: (
      <RoleGuard allowedRoles={['admin']} fallbackPath={ROUTES.DASHBOARD}>
        <AdminLayout />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]
