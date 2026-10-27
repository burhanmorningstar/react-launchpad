// Adapted from shadcn/ui new-york-v4 (MIT). See docs/guides/primitives.md.
'use client'

import * as React from 'react'

import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/core/ui/utils'

function Progress({
  className,
  value,
  max = 100,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const maximum = Number.isFinite(max) && max > 0 ? max : 100
  const determinate =
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= maximum
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      max={max}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          'h-full flex-1 bg-primary transition-all',
          determinate ? 'w-full' : 'w-1/3 animate-pulse'
        )}
        style={
          !determinate
            ? undefined
            : {
                transform: `translateX(-${100 - (value / maximum) * 100}%)`,
              }
        }
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
