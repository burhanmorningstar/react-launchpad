import type { ReactNode } from 'react'

import { cn } from '@/core/ui/utils'

export interface HeroSectionProps {
  badge?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  visual?: ReactNode
  align?: 'left' | 'center'
  className?: string
}

export function HeroSection({
  badge,
  title,
  description,
  actions,
  visual,
  align = 'center',
  className,
}: HeroSectionProps) {
  const isCentered = align === 'center' && !visual

  return (
    <section
      className={cn(
        'relative overflow-hidden py-16 sm:py-24 lg:py-32',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'flex flex-col gap-12',
            visual ? 'lg:grid lg:grid-cols-12 lg:items-center lg:gap-8' : ''
          )}
        >
          <div
            className={cn(
              'flex flex-col gap-6',
              visual
                ? 'lg:col-span-7'
                : isCentered
                  ? 'mx-auto max-w-3xl text-center'
                  : 'max-w-3xl'
            )}
          >
            {badge ? (
              <div
                className={cn(
                  'flex',
                  isCentered ? 'justify-center' : 'justify-start'
                )}
              >
                {badge}
              </div>
            ) : null}

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            {description ? (
              <p className="text-lg text-muted-foreground sm:text-xl">
                {description}
              </p>
            ) : null}

            {actions ? (
              <div
                className={cn(
                  'flex flex-wrap items-center gap-4 pt-2',
                  isCentered ? 'justify-center' : 'justify-start'
                )}
              >
                {actions}
              </div>
            ) : null}
          </div>

          {visual ? (
            <div className="relative flex items-center justify-center lg:col-span-5">
              <div className="w-full overflow-hidden rounded-xl border border-border/50 bg-muted/30 shadow-2xl">
                {visual}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
