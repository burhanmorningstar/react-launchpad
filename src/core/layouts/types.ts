import type { ReactNode } from 'react'

export interface NavigationItem {
  id: string
  label: string
  href?: string
  icon?: ReactNode
  children?: readonly NavigationItem[]
  disabled?: boolean
}

export interface ShellLabels {
  navigation: string
  navigationDescription: string
  openNavigation: string
  collapseSidebar: string
  expandSidebar: string
  skipToContent: string
}

export interface AppShellProps {
  nav: readonly NavigationItem[]
  logo: ReactNode
  compactLogo?: ReactNode
  title?: ReactNode
  headerActions?: ReactNode
  userMenu?: ReactNode
  footer?: ReactNode
  children: ReactNode
  labels?: Partial<ShellLabels>
  defaultDesktopCollapsed?: boolean
  className?: string
}
