import { useContext } from 'react'

import { useStore } from 'zustand'

import { ShellContext } from './shell-context'

export function useShell() {
  const context = useContext(ShellContext)
  if (!context) throw new Error('useShell requires ShellProvider')
  const desktopCollapsed = useStore(context.store, (s) => s.desktopCollapsed)
  const mobileOpen = useStore(context.store, (s) => s.mobileOpen)
  const setDesktopCollapsed = useStore(
    context.store,
    (s) => s.setDesktopCollapsed
  )
  const setMobileOpen = useStore(context.store, (s) => s.setMobileOpen)
  return {
    isDesktop: context.isDesktop,
    desktopCollapsed,
    mobileOpen,
    setDesktopCollapsed,
    setMobileOpen,
  }
}
