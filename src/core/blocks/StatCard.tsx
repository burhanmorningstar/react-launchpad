import type { ReactNode } from 'react'

import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/core/ui/components/card'
import { cn } from '@/core/ui/utils'

export interface StatCardChange {
  value: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  label?: string
}

export interface StatCardProps {
  title: ReactNode
  value: ReactNode
  description?: ReactNode
  icon?: ReactNode
  change?: StatCardChange
  actions?: ReactNode
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon,
  change,
  actions,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
        {icon ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {icon}
          </div>
        ) : actions ? (
          <div>{actions}</div>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <div className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {value}
        </div>

        {change || description ? (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {change ? (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-medium',
                  change.trend === 'up' &&
                    'text-emerald-600 dark:text-emerald-400',
                  change.trend === 'down' && 'text-rose-600 dark:text-rose-400',
                  change.trend === 'neutral' && 'text-muted-foreground'
                )}
              >
                {change.trend === 'up' ? (
                  <TrendingUpIcon className="h-3.5 w-3.5" aria-hidden="true" />
                ) : change.trend === 'down' ? (
                  <TrendingDownIcon
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                ) : null}
                {change.value}
              </span>
            ) : null}
            {change?.label ? <span>{change.label}</span> : null}
            {description ? <span>{description}</span> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
