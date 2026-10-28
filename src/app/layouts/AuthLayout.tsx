import { Outlet } from 'react-router'

import { ProjectBrand } from './ProjectBrand'

export function AuthLayout() {
  return (
    <main className="flex min-h-dvh min-w-0 flex-col items-center justify-center bg-background-secondary px-[var(--page-gutter)] py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary">
          <ProjectBrand />
        </h1>
      </div>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </main>
  )
}
