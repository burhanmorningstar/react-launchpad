import { useContext } from 'react'

import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router'

import { ROUTES } from '@/config'
import { useAuth } from '@/core/auth'
import { AppShell } from '@/core/layouts/AppShell'
import { Button } from '@/core/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/ui/components/dropdown-menu'
import { ThemeToggle } from '@/core/ui/components/theme-switcher'

import { ProjectBrand } from './ProjectBrand'
import { FeatureNavigationContext } from '../feature-navigation'
import { getAppNavigation } from '../navigation'

import type { NavigationArea } from '../navigation'

export function ApplicationLayout({ area }: { area: NavigationArea }) {
  const { t } = useTranslation()
  const { logout, user } = useAuth()
  const features = useContext(FeatureNavigationContext)
  const nav = getAppNavigation(
    area,
    user?.role,
    (key, fallback) => t(key, fallback),
    features
  )
  return (
    <AppShell
      nav={nav}
      logo={<ProjectBrand />}
      compactLogo={<ProjectBrand compact />}
      title={
        area === 'admin'
          ? t('navigation.administration', 'Administration')
          : t('navigation.workspace', 'Workspace')
      }
      headerActions={<ThemeToggle />}
      userMenu={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t('navigation.account', 'Account')}
            >
              <span aria-hidden="true">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p>{user?.name}</p>
              <p className="max-w-64 truncate text-xs font-normal text-muted-foreground">
                {user?.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                to={area === 'admin' ? ROUTES.ADMIN_SETTINGS : ROUTES.SETTINGS}
              >
                {t('navigation.settings', 'Settings')}
              </Link>
            </DropdownMenuItem>
            {area === 'dashboard' && user?.role === 'admin' && (
              <DropdownMenuItem asChild>
                <Link to={ROUTES.ADMIN_DASHBOARD}>
                  {t('navigation.administration', 'Administration')}
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={logout}>
              {t('navigation.logout', 'Logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
      footer={
        <span className="text-xs text-muted-foreground">
          {area === 'admin'
            ? t('navigation.administration', 'Administration')
            : t('navigation.workspace', 'Workspace')}
        </span>
      }
      labels={{
        navigation: t('navigation.menu', 'Navigation'),
        navigationDescription: t(
          'navigation.menuDescription',
          'Choose a page.'
        ),
        openNavigation: t('navigation.openMenu', 'Open navigation'),
        collapseSidebar: t('navigation.collapse', 'Collapse sidebar'),
        expandSidebar: t('navigation.expand', 'Expand sidebar'),
        skipToContent: t('navigation.skip', 'Skip to content'),
      }}
    >
      <Outlet />
    </AppShell>
  )
}
