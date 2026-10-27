import { Link } from 'react-router'

import { projectConfig } from '@/config/project'
import { buttonVariants } from '@/core/ui/components/button'

export function NotFoundPage({
  homePath = projectConfig.homePath,
}: {
  homePath?: string
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-4xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        This page may have moved, or the address may be incorrect.
      </p>
      <Link to={homePath} className={buttonVariants()}>
        Back to home
      </Link>
    </main>
  )
}
