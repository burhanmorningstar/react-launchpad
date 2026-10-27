import { createContext } from 'react'

import type { ThemeMode } from './initialize-theme'

export interface ThemeContextValue {
  theme: ThemeMode
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
)
