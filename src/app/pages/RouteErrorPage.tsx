import { Link } from 'react-router'

import { projectConfig } from '@/config/project'
import { Button, buttonVariants } from '@/core/ui/components/button'

export function RouteErrorPage({
  homePath = projectConfig.homePath,
}: {
  homePath?: string
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">
        An unexpected error occurred
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="max-w-md text-muted-foreground">
        You can return to the starting page or reload and try again.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to={homePath} className={buttonVariants()}>
          Back to home
        </Link>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </div>
    </main>
  )
}
