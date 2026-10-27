// Adapted from shadcn/ui new-york-v4 (MIT). See docs/guides/primitives.md.
import { Loader2Icon } from 'lucide-react'

import { cn } from '@/core/ui/utils'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
