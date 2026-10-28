import { useState } from 'react'
import type { ReactNode } from 'react'

import { ChevronDownIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router'

import { Button } from '@/core/ui/components/button'
import { cn } from '@/core/ui/utils'

import { useShell } from './useShell'

import type { NavigationItem } from './types'

const routePath = (href: string) =>
  href.split(/[?#]/)[0].replace(/\/$/, '') || '/'
const matches = (path: string, href: string) => {
  const target = routePath(href)
  return path === target || (target !== '/' && path.startsWith(`${target}/`))
}
function activeItem(
  nav: readonly NavigationItem[],
  pathname: string
): NavigationItem | undefined {
  return nav
    .flatMap((item) =>
      item.disabled
        ? []
        : [item, ...(item.children ? flatten(item.children) : [])]
    )
    .filter((item) => item.href && matches(pathname, item.href))
    .sort((a, b) => routePath(b.href!).length - routePath(a.href!).length)[0]
}
function flatten(nav: readonly NavigationItem[]): NavigationItem[] {
  return nav.flatMap((item) =>
    item.disabled
      ? []
      : [item, ...(item.children ? flatten(item.children) : [])]
  )
}
function contains(items: readonly NavigationItem[], id?: string): boolean {
  return items.some(
    (item) => item.id === id || (item.children && contains(item.children, id))
  )
}

function NavItem({
  item,
  activeId,
  collapsed,
  disabled = false,
}: {
  item: NavigationItem
  activeId?: string
  collapsed: boolean
  disabled?: boolean
}) {
  const { pathname } = useLocation()
  const { setDesktopCollapsed } = useShell()
  const branchActive = Boolean(
    item.children && contains(item.children, activeId)
  )
  const [disclosure, setDisclosure] = useState({
    pathname,
    expanded: branchActive,
  })
  const expanded =
    branchActive && disclosure.pathname !== pathname
      ? true
      : disclosure.expanded
  const inactive = disabled || item.disabled
  const selected = activeId === item.id
  const content = (
    <>
      <span
        className="flex size-5 shrink-0 items-center justify-center [&_svg]:size-5"
        aria-hidden="true"
      >
        {item.icon ?? item.label.charAt(0)}
      </span>
      <span
        className={cn(
          'min-w-0 flex-1 break-words text-start',
          collapsed && 'sr-only'
        )}
      >
        {item.label}
      </span>
    </>
  )
  const style = cn(
    'flex min-h-[var(--control-height)] min-w-0 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
    selected
      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    inactive && 'pointer-events-none opacity-[var(--disabled-opacity)]',
    collapsed && 'justify-center px-2'
  )
  return (
    <li className="min-w-0">
      <div className="flex min-w-0 items-center gap-1">
        {item.href ? (
          inactive ? (
            <span
              role="link"
              aria-disabled="true"
              className={cn(style, 'flex-1')}
            >
              {content}
            </span>
          ) : (
            <Link
              to={item.href}
              title={collapsed ? item.label : undefined}
              aria-current={selected ? 'page' : undefined}
              className={cn(style, 'flex-1')}
            >
              {content}
            </Link>
          )
        ) : item.children ? (
          <Button
            type="button"
            variant="ghost"
            disabled={inactive}
            className={cn(
              style,
              'h-auto w-full justify-start whitespace-normal',
              branchActive && 'bg-sidebar-accent'
            )}
            aria-expanded={expanded}
            onClick={() => {
              if (collapsed) setDesktopCollapsed(false)
              setDisclosure({ pathname, expanded: !expanded })
            }}
          >
            {content}
            {!collapsed && (
              <ChevronDownIcon
                aria-hidden="true"
                className={cn(
                  'ml-auto shrink-0 transition-transform',
                  expanded && 'rotate-180'
                )}
              />
            )}
          </Button>
        ) : (
          <span className={style}>{content}</span>
        )}
        {item.href && item.children && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={inactive}
            aria-label={item.label}
            aria-expanded={expanded}
            onClick={() => {
              if (collapsed) setDesktopCollapsed(false)
              setDisclosure({ pathname, expanded: !expanded })
            }}
          >
            <ChevronDownIcon aria-hidden="true" />
          </Button>
        )}
      </div>
      {item.children && expanded && (
        <ul
          className={cn(
            'mt-1 space-y-1',
            !collapsed && 'ms-5 border-s border-sidebar-border ps-2'
          )}
        >
          {item.children.map((child) => (
            <NavItem
              key={child.id}
              item={child}
              activeId={activeId}
              collapsed={collapsed}
              disabled={inactive}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function AppSidebar({
  nav,
  logo,
  compactLogo,
  footer,
  id,
  label,
  mobile = false,
}: {
  nav: readonly NavigationItem[]
  logo: ReactNode
  compactLogo?: ReactNode
  footer?: ReactNode
  id: string
  label: string
  mobile?: boolean
}) {
  const { pathname } = useLocation()
  const { desktopCollapsed } = useShell()
  const collapsed = !mobile && desktopCollapsed
  const active = activeItem(nav, pathname)
  return (
    <aside
      id={id}
      aria-label={label}
      data-slot="app-sidebar"
      data-collapsed={collapsed}
      className={cn(
        'group/sidebar flex min-h-0 flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground',
        mobile
          ? 'h-full w-full'
          : 'sticky top-0 h-dvh shrink-0 transition-[width] duration-[var(--motion-fast)]'
      )}
      style={
        mobile
          ? undefined
          : {
              width: collapsed
                ? 'var(--shell-sidebar-collapsed-width)'
                : 'var(--shell-sidebar-width)',
            }
      }
    >
      <div
        className={cn(
          'flex h-[var(--shell-header-height)] shrink-0 items-center overflow-hidden border-b border-sidebar-border px-4',
          mobile && 'pe-12',
          collapsed && 'justify-center px-2'
        )}
      >
        {collapsed ? (compactLogo ?? logo) : logo}
      </div>
      <nav
        aria-label={label}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"
      >
        <ul className="space-y-1">
          {nav.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              activeId={active?.id}
              collapsed={collapsed}
            />
          ))}
        </ul>
      </nav>
      {footer && !collapsed && (
        <div className="shrink-0 overflow-hidden border-t border-sidebar-border p-4">
          {footer}
        </div>
      )}
    </aside>
  )
}
