import { Link } from 'react-router'

import { projectConfig } from '@/config/project'
import type { ProjectConfig } from '@/config/project'
import { buttonVariants } from '@/core/ui/components/button'

export function WelcomePage({
  config = projectConfig,
}: {
  config?: ProjectConfig
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 sm:px-10">
      <header className="flex items-center justify-between gap-4 border-b py-6">
        <Link
          to={config.homePath}
          className="flex items-center gap-3 font-semibold"
        >
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm text-primary-foreground"
          >
            {config.brand.mark}
          </span>
          {config.name}
        </Link>
        <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
          Ready to make yours
        </span>
      </header>
      <main
        id="main-content"
        className="flex flex-1 flex-col justify-center py-16 sm:py-24"
      >
        <p className="mb-6 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          No backend required
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-7xl">
          Your next frontend starts here.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          {config.brand.tagline} Your frontend is running. No account, API key,
          or environment file needed.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#make-it-yours" className={buttonVariants()}>
            Make it yours
          </a>
          {config.examplesEnabled && (
            <Link
              to="/login"
              className={buttonVariants({ variant: 'outline' })}
            >
              Explore example screens
            </Link>
          )}
        </div>
        <section
          id="make-it-yours"
          aria-labelledby="customize-title"
          className="mt-20 grid gap-8 border-t pt-8 sm:grid-cols-3"
        >
          <div>
            <h2 id="customize-title" className="font-semibold">
              01 / Set your identity
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Choose your name, brand, and starting page in{' '}
              <code className="break-all">src/config/project.ts</code>.
            </p>
          </div>
          <div>
            <h2 className="font-semibold">02 / Build your first screen</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Start with the shared components and add your product in{' '}
              <code>src/features</code>.
            </p>
          </div>
          <div>
            <h2 className="font-semibold">03 / Connect when ready</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Keep building locally. Add a public API URL when your product
              needs one. Example screens may require a configured API.
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 text-sm text-muted-foreground">
        {config.name} · Built to be your starting point.
      </footer>
    </div>
  )
}
