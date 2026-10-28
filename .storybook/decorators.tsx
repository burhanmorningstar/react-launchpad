import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'

import i18n from '../src/i18n'

import type { Decorator } from '@storybook/react-vite'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

export const withGlobalProviders: Decorator = (Story, context) => {
  const theme = context.globals.theme || 'light'
  const locale = context.globals.locale || 'en'
  const direction = context.globals.direction || 'ltr'

  React.useEffect(() => {
    // 1. Theme sync
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // 2. Direction sync
    root.setAttribute('dir', direction)

    // 3. Locale sync
    root.setAttribute('lang', locale)
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale)
    }
  }, [theme, locale, direction])

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <div
          dir={direction}
          className="min-h-full font-sans antialiased text-foreground bg-background"
        >
          <Story />
        </div>
      </MemoryRouter>
    </QueryClientProvider>
  )
}
