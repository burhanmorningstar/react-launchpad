import { Link } from 'react-router'

import { projectConfig } from '@/config/project'

export function ProjectBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to={projectConfig.homePath}
      aria-label={projectConfig.name}
      className="flex min-w-0 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
      >
        {projectConfig.brand.mark}
      </span>
      {!compact && (
        <span className="truncate text-base font-semibold">
          {projectConfig.name}
        </span>
      )}
    </Link>
  )
}
