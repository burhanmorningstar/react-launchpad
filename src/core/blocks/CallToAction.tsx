import type { ReactNode } from 'react'

import { Card } from '@/core/ui/components/card'
import { cn } from '@/core/ui/utils'

export interface CallToActionProps {
  badge?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions: ReactNode
  variant?: 'simple' | 'card' | 'split'
  className?: string
}

export function CallToAction({
  badge,
  title,
  description,
  actions,
  variant = 'card',
  className,
}: CallToActionProps) {
  if (variant === 'split') {
    return (
      <section className={cn('py-16 sm:py-24', className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="flex flex-col gap-4 lg:col-span-8">
              {badge ? <div>{badge}</div> : null}
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h2>
              {description ? (
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                  {description}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:col-span-4 lg:justify-end">
              {actions}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'simple') {
    return (
      <section className={cn('py-16 sm:py-24', className)}>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          {badge ? (
            <div className="mb-4 flex justify-center">{badge}</div>
          ) : null}
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              {description}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {actions}
          </div>
        </div>
      </section>
    )
  }

  // variant === 'card'
  return (
    <section className={cn('py-12 sm:py-16', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden border-border/80 bg-gradient-to-b from-muted/50 to-muted/20 p-8 sm:p-12 lg:p-16">
          <div className="mx-auto max-w-3xl text-center">
            {badge ? (
              <div className="mb-4 flex justify-center">{badge}</div>
            ) : null}
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h2>
            {description ? (
              <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                {description}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {actions}
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
