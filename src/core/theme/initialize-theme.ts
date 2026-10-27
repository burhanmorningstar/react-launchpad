export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeEnvironment {
  readonly localStorage: {
    getItem(key: string): string | null
    setItem(key: string, value: string): void
  }
  matchMedia(query: string): { matches: boolean }
}

interface ThemeRoot {
  classList: {
    remove(...tokens: string[]): void
    add(...tokens: string[]): void
  }
  style: { colorScheme: string }
}

/** Self-contained so Vite can also inline this exact function before first paint. */
export function initializeTheme(
  environment: ThemeEnvironment,
  root?: ThemeRoot
) {
  let theme: ThemeMode = 'system'
  let needsRecovery = false
  try {
    const saved = environment.localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark' || saved === 'system')
      theme = saved
    else {
      if (saved === null) {
        try {
          const legacy: unknown = JSON.parse(
            environment.localStorage.getItem('ui-storage') ?? 'null'
          )
          if (
            legacy &&
            typeof legacy === 'object' &&
            'state' in legacy &&
            legacy.state &&
            typeof legacy.state === 'object' &&
            'theme' in legacy.state &&
            (legacy.state.theme === 'light' ||
              legacy.state.theme === 'dark' ||
              legacy.state.theme === 'system')
          )
            theme = legacy.state.theme
        } catch {
          /* Malformed old storage is optional configuration. */
        }
      }
      try {
        environment.localStorage.setItem('theme', theme)
      } catch {
        needsRecovery = saved !== null
      }
    }
  } catch {
    /* Storage may be disabled entirely; use the system. */
  }
  let resolved: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light'
  if (theme === 'system') {
    try {
      resolved = environment.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    } catch {
      /* System preference unavailable; retain the light fallback. */
    }
  }
  if (root) {
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
    root.style.colorScheme = resolved
  }
  return { theme, needsRecovery }
}
