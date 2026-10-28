import { useId, useLayoutEffect, useRef } from 'react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/core/ui/components/sheet'
import { cn } from '@/core/ui/utils'

import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import { ShellProvider } from './ShellProvider'
import { useShell } from './useShell'

import type { AppShellProps, ShellLabels } from './types'

const defaultLabels: ShellLabels = {
  navigation: 'Navigation',
  navigationDescription: 'Choose a page.',
  openNavigation: 'Open navigation',
  collapseSidebar: 'Collapse sidebar',
  expandSidebar: 'Expand sidebar',
  skipToContent: 'Skip to content',
}

function ShellFrame({
  nav,
  logo,
  compactLogo,
  title,
  headerActions,
  userMenu,
  footer,
  children,
  labels: overrides,
  className,
}: AppShellProps) {
  const { isDesktop, mobileOpen, setMobileOpen } = useShell()
  const controlRef = useRef<HTMLButtonElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const lastFocused = useRef<HTMLElement | null>(null)
  useLayoutEffect(() => {
    if (
      lastFocused.current &&
      !lastFocused.current.isConnected &&
      document.activeElement === document.body
    )
      controlRef.current?.focus()
  }, [isDesktop])
  const id = useId()
  const sidebarId = `shell-nav-${id}`
  const mainId = `shell-main-${id}`
  const labels = { ...defaultLabels, ...overrides }
  const sidebarProps = {
    nav,
    logo,
    compactLogo,
    footer,
    id: sidebarId,
    label: labels.navigation,
  }
  return (
    <Sheet open={!isDesktop && mobileOpen} onOpenChange={setMobileOpen}>
      <div
        data-slot="app-shell"
        onFocusCapture={(event) => {
          lastFocused.current = event.target as HTMLElement
        }}
        className={cn(
          'flex min-h-dvh min-w-0 bg-background text-foreground',
          className
        )}
      >
        <a
          href={`#${mainId}`}
          className="sr-only focus:fixed focus:start-4 focus:top-2 focus:z-[100] rounded-md bg-background px-4 py-2 text-foreground shadow-lg focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring"
          onClick={(event) => {
            event.preventDefault()
            mainRef.current?.focus()
          }}
        >
          {labels.skipToContent}
        </a>
        {isDesktop && <AppSidebar {...sidebarProps} />}
        <div className="flex min-w-[var(--shell-content-min-width)] flex-1 flex-col">
          <AppHeader
            {...{
              logo,
              title,
              headerActions,
              userMenu,
              labels,
              sidebarId,
              controlRef,
            }}
          />
          <main
            id={mainId}
            ref={mainRef}
            tabIndex={-1}
            className="min-w-0 flex-1 p-[var(--page-gutter)] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            {children}
          </main>
        </div>
        {!isDesktop && (
          <SheetContent
            side="left"
            className="w-[min(var(--shell-sidebar-width),calc(100vw-2rem))] max-w-none gap-0 p-0 data-[state=open]:duration-[var(--motion-normal)] data-[state=closed]:duration-[var(--motion-fast)]"
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              controlRef.current?.focus()
            }}
          >
            <SheetTitle className="sr-only">{labels.navigation}</SheetTitle>
            <SheetDescription className="sr-only">
              {labels.navigationDescription}
            </SheetDescription>
            <AppSidebar {...sidebarProps} mobile />
          </SheetContent>
        )}
      </div>
    </Sheet>
  )
}

export function AppShell(props: AppShellProps) {
  return (
    <ShellProvider defaultDesktopCollapsed={props.defaultDesktopCollapsed}>
      <ShellFrame {...props} />
    </ShellProvider>
  )
}
