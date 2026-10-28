import type { ReactNode, Ref } from 'react'

import { MenuIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from 'lucide-react'

import { Button } from '@/core/ui/components/button'
import { SheetTrigger } from '@/core/ui/components/sheet'

import { useShell } from './useShell'

import type { ShellLabels } from './types'

export function AppHeader({
  logo,
  title,
  headerActions,
  userMenu,
  labels,
  sidebarId,
  controlRef,
}: {
  logo: ReactNode
  title?: ReactNode
  headerActions?: ReactNode
  userMenu?: ReactNode
  labels: ShellLabels
  sidebarId: string
  controlRef: Ref<HTMLButtonElement>
}) {
  const { isDesktop, desktopCollapsed, setDesktopCollapsed } = useShell()
  const control = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      ref={controlRef}
      aria-label={
        isDesktop
          ? desktopCollapsed
            ? labels.expandSidebar
            : labels.collapseSidebar
          : labels.openNavigation
      }
      {...(isDesktop
        ? { 'aria-controls': sidebarId, 'aria-expanded': !desktopCollapsed }
        : {})}
      onClick={
        isDesktop ? () => setDesktopCollapsed(!desktopCollapsed) : undefined
      }
    >
      {isDesktop ? (
        desktopCollapsed ? (
          <PanelLeftOpenIcon aria-hidden="true" />
        ) : (
          <PanelLeftCloseIcon aria-hidden="true" />
        )
      ) : (
        <MenuIcon aria-hidden="true" />
      )}
    </Button>
  )
  return (
    <header
      data-slot="app-header"
      className="sticky top-0 z-20 flex h-[var(--shell-header-height)] min-w-0 shrink-0 items-center gap-3 border-b bg-background px-[var(--page-gutter)]"
    >
      {isDesktop ? control : <SheetTrigger asChild>{control}</SheetTrigger>}
      <div className="min-w-0 flex-1 truncate">{isDesktop ? title : logo}</div>
      {headerActions && (
        <div className="flex shrink-0 items-center gap-2">{headerActions}</div>
      )}
      {userMenu && (
        <div className="min-w-0 max-w-[40%] shrink-0">{userMenu}</div>
      )}
    </header>
  )
}
