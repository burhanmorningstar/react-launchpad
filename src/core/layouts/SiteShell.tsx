import { useState, type ReactNode } from 'react'

import { MenuIcon } from 'lucide-react'

import { Button } from '@/core/ui/components/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/core/ui/components/sheet'
import { cn } from '@/core/ui/utils'

import type { NavigationItem } from './types'

export interface SiteShellProps {
  logo: ReactNode
  nav?: readonly NavigationItem[]
  actions?: ReactNode
  footer?: ReactNode
  children: ReactNode
  skipToContentLabel?: string
  className?: string
}

export function SiteShell({
  logo,
  nav = [],
  actions,
  footer,
  children,
  skipToContentLabel = 'Skip to main content',
  className,
}: SiteShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col bg-background text-foreground',
        className
      )}
    >
      <a
        href="#site-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-md focus:outline-hidden"
      >
        {skipToContentLabel}
      </a>

      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 md:gap-8">
            <div className="flex items-center gap-2">{logo}</div>

            {nav.length > 0 ? (
              <nav
                aria-label="Main Navigation"
                className="hidden md:flex md:items-center md:gap-6"
              >
                {nav.map((item) => (
                  <a
                    key={item.id}
                    href={item.href ?? '#'}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-foreground',
                      item.disabled
                        ? 'pointer-events-none opacity-50'
                        : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            {actions ? (
              <div className="flex items-center gap-2">{actions}</div>
            ) : null}

            {nav.length > 0 ? (
              <div className="flex md:hidden">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Toggle navigation menu"
                    >
                      <MenuIcon className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        {logo}
                      </SheetTitle>
                      <SheetDescription className="sr-only">
                        Site navigation menu
                      </SheetDescription>
                    </SheetHeader>
                    <nav className="mt-6 flex flex-col gap-3">
                      {nav.map((item) => (
                        <a
                          key={item.id}
                          href={item.href ?? '#'}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            'rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-muted',
                            item.disabled
                              ? 'pointer-events-none opacity-50'
                              : 'text-foreground'
                          )}
                        >
                          {item.label}
                        </a>
                      ))}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main id="site-main-content" className="flex-1">
        {children}
      </main>

      {footer ? (
        <footer className="border-t border-border/40 bg-muted/20">
          {footer}
        </footer>
      ) : null}
    </div>
  )
}
