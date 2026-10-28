import { createContext } from 'react'

import type { createShellStore } from '@/core/store'

export const ShellContext = createContext<{
  store: ReturnType<typeof createShellStore>
  isDesktop: boolean
} | null>(null)
