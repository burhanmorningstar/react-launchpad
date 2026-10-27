import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { Toaster } from 'sonner'

import { AuthProvider } from '@/core/auth'
import { useThemeSync } from '@/core/store'
import { useUIStore } from '@/core/store/slices/uiSlice'
import { TooltipProvider } from '@/core/ui/components/tooltip'

import { ErrorBoundary } from './ErrorBoundary'
import { I18nProvider } from './I18nProvider'
import { PageLoader } from './PageLoader'
import { QueryProvider } from './QueryProvider'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  // Keep the existing store as the theme owner until the Task 4 migration.
  useThemeSync()
  const theme = useUIStore((state) => state.theme)

  return (
    <ErrorBoundary>
      <I18nProvider>
        <QueryProvider>
          <AuthProvider>
            <TooltipProvider>
              <Suspense fallback={<PageLoader />}>{children}</Suspense>
              <Toaster theme={theme} position="top-right" richColors />
            </TooltipProvider>
          </AuthProvider>
        </QueryProvider>
      </I18nProvider>
    </ErrorBoundary>
  )
}
