import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { AuthProvider } from '@/core/auth'
import { ThemeProvider } from '@/core/theme/ThemeProvider'
import { Toaster } from '@/core/ui/components/sonner'
import { TooltipProvider } from '@/core/ui/components/tooltip'

import { ErrorBoundary } from './ErrorBoundary'
import { I18nProvider } from './I18nProvider'
import { PageLoader } from './PageLoader'
import { QueryProvider } from './QueryProvider'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <QueryProvider>
            <AuthProvider>
              <TooltipProvider>
                <Suspense fallback={<PageLoader />}>{children}</Suspense>
                <Toaster position="top-right" richColors />
              </TooltipProvider>
            </AuthProvider>
          </QueryProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
