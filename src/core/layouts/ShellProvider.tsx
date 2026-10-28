import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'

import { useLocation } from 'react-router'

import { createShellStore } from '@/core/store'

import { ShellContext } from './shell-context'

const desktopQuery = '(min-width: 64rem)'
function subscribe(listener: () => void) {
  const media = window.matchMedia(desktopQuery)
  media.addEventListener('change', listener)
  return () => media.removeEventListener('change', listener)
}
const getDesktop = () => window.matchMedia(desktopQuery).matches

export function ShellProvider({
  children,
  defaultDesktopCollapsed = false,
}: {
  children: ReactNode
  defaultDesktopCollapsed?: boolean
}) {
  const [store] = useState(() => createShellStore(defaultDesktopCollapsed))
  const isDesktop = useSyncExternalStore(subscribe, getDesktop, () => false)
  const { key } = useLocation()
  useEffect(() => {
    store.getState().setMobileOpen(false)
  }, [store, key, isDesktop])
  const value = useMemo(() => ({ store, isDesktop }), [store, isDesktop])
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}
