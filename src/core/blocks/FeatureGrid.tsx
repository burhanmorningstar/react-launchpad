import type { ReactNode } from 'react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/ui/components/card'
import { cn } from '@/core/ui/utils'

export interface FeatureItem {
  id?: string
  title: ReactNode
  description: ReactNode
  icon?: ReactNode
  action?: ReactNode
}

export interface FeatureGridProps {
  badge?: ReactNode
  title?: ReactNode
  description?: ReactNode
  features: readonly FeatureItem[]
  columns?: 2 | 3 | 4
  className?: string
}

export function FeatureGrid({
  badge,
  title,
  description,
  features,
  columns = 3,
  className,
}: FeatureGridProps) {
  const gridColsClass = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }[columns]

  return (
    <section className={cn('py-16 sm:py-24', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {badge || title || description ? (
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            {badge ? (
              <div className="mb-3 flex justify-center">{badge}</div>
            ) : null}
            {title ? (
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className={cn('grid grid-cols-1 gap-6 lg:gap-8', gridColsClass)}>
          {features.map((feature, index) => (
            <Card
              key={feature.id ?? index}
              className="relative flex flex-col justify-between overflow-hidden border-border/60 bg-card transition-shadow hover:shadow-md"
            >
              <div>
                <CardHeader className="gap-3">
                  {feature.icon ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                  ) : null}
                  <CardTitle className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    {feature.description}
                  </p>
                </CardContent>
              </div>

              {feature.action ? (
                <div className="p-6 pt-0">{feature.action}</div>
              ) : null}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
