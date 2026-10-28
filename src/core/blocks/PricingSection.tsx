import type { ReactNode } from 'react'

import { CheckIcon } from 'lucide-react'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/core/ui/components/card'
import { cn } from '@/core/ui/utils'

export interface PricingTier {
  id: string
  name: ReactNode
  price: ReactNode
  interval?: ReactNode
  description?: ReactNode
  features: readonly ReactNode[]
  highlighted?: boolean
  badge?: ReactNode
  action: ReactNode
}

export interface PricingSectionProps {
  badge?: ReactNode
  title?: ReactNode
  description?: ReactNode
  billingToggle?: ReactNode
  tiers: readonly PricingTier[]
  className?: string
}

export function PricingSection({
  badge,
  title,
  description,
  billingToggle,
  tiers,
  className,
}: PricingSectionProps) {
  return (
    <section className={cn('py-16 sm:py-24', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {badge || title || description || billingToggle ? (
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
            {billingToggle ? (
              <div className="mt-6 flex justify-center">{billingToggle}</div>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              className={cn(
                'relative flex flex-col justify-between transition-shadow',
                tier.highlighted
                  ? 'border-2 border-primary shadow-lg ring-1 ring-primary/20'
                  : 'border-border/60 hover:shadow-md'
              )}
            >
              {tier.badge ? (
                <div className="absolute -top-3.5 right-6">{tier.badge}</div>
              ) : null}

              <div>
                <CardHeader className="gap-2">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {tier.name}
                  </h3>
                  {tier.description ? (
                    <p className="text-sm text-muted-foreground">
                      {tier.description}
                    </p>
                  ) : null}

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">
                      {tier.price}
                    </span>
                    {tier.interval ? (
                      <span className="text-sm text-muted-foreground">
                        {tier.interval}
                      </span>
                    ) : null}
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  <div className="border-t border-border/50 pt-4">
                    <ul className="flex flex-col gap-3">
                      {tier.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-start gap-2.5 text-sm text-muted-foreground"
                        >
                          <CheckIcon
                            className="h-4 w-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-4">
                <div className="w-full">{tier.action}</div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
