import { createStore } from 'zustand/vanilla'

export interface ShellState {
  desktopCollapsed: boolean
  mobileOpen: boolean
  setDesktopCollapsed: (collapsed: boolean) => void
  setMobileOpen: (open: boolean) => void
}

/** Each shell owns an instance; mobile visibility is never a desktop preference. */
export function createShellStore(desktopCollapsed = false) {
  return createStore<ShellState>()((set) => ({
    desktopCollapsed,
    mobileOpen: false,
    setDesktopCollapsed: (collapsed) => set({ desktopCollapsed: collapsed }),
    setMobileOpen: (open) => set({ mobileOpen: open }),
  }))
}
