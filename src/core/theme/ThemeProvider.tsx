import { useEffect, useLayoutEffect, useState } from 'react'
import type { ReactNode } from 'react'

import {
  ThemeProvider as NextThemeProvider,
  useTheme as useNextTheme,
} from 'next-themes'

import { ThemeContext } from './context'
import { initializeTheme } from './initialize-theme'

import type { ThemeMode } from './initialize-theme'

const valid = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system'

function ThemeBridge({
  children,
  recovery,
  releaseRecovery,
  initialTheme,
}: {
  children: ReactNode
  recovery: boolean
  releaseRecovery: () => void
  initialTheme: ThemeMode
}) {
  const { theme: selected, systemTheme, setTheme: select } = useNextTheme()
  const theme = recovery ? initialTheme : valid(selected) ? selected : 'system'
  const resolvedTheme =
    theme === 'system' ? (systemTheme === 'dark' ? 'dark' : 'light') : theme

  useLayoutEffect(() => {
    if (recovery) {
      // Repair the library's in-memory preference before lifting the temporary
      // guard. Storage can remain read-only; system changes must keep working.
      select(initialTheme)
      releaseRecovery()
    }
  }, [recovery, initialTheme, select, releaseRecovery])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (
        event.key === 'theme' &&
        event.newValue !== null &&
        !valid(event.newValue)
      ) {
        // Prevent next-themes accepting an arbitrary class from another tab.
        event.stopImmediatePropagation()
        select('system')
        releaseRecovery()
      }
    }
    window.addEventListener('storage', onStorage, true)
    return () => window.removeEventListener('storage', onStorage, true)
  }, [select, releaseRecovery])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme: (next) => {
          if (valid(next)) {
            select(next)
            releaseRecovery()
          }
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() =>
    typeof window === 'undefined'
      ? { theme: 'system' as const, needsRecovery: false }
      : initializeTheme(window, document.documentElement)
  )
  // Recovery is a storage guard, not a second theme preference. next-themes
  // remains the sole owner of the current selection, including memory-only use.
  const [recovery, setRecovery] = useState(initial.needsRecovery)
  return (
    <NextThemeProvider
      attribute="class"
      storageKey="theme"
      defaultTheme={initial.theme}
      forcedTheme={recovery ? initial.theme : undefined}
      enableSystem
      enableColorScheme
      disableTransitionOnChange
    >
      <ThemeBridge
        recovery={recovery}
        initialTheme={initial.theme}
        releaseRecovery={() => setRecovery(false)}
      >
        {children}
      </ThemeBridge>
    </NextThemeProvider>
  )
}
