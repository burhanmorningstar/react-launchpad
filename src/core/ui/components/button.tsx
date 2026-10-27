import * as React from 'react'

import { Slot, Slottable } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/core/ui/utils/index'

import { Spinner } from './spinner'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-[var(--disabled-opacity)] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-[var(--control-height)] px-4 py-2 has-[>svg]:px-3',
        sm: 'h-[var(--control-height-sm)] rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-[var(--control-height-lg)] rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-[var(--control-height)]',
        'icon-sm': 'size-[var(--control-height-sm)]',
        'icon-lg': 'size-[var(--control-height-lg)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  const inactive = disabled || loading
  const block: React.MouseEventHandler<HTMLElement> = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }
  const child =
    asChild &&
    inactive &&
    React.isValidElement<React.HTMLAttributes<HTMLElement>>(children)
      ? React.cloneElement(children, {
          tabIndex: -1,
          'aria-disabled': true,
          'aria-busy': loading || children.props['aria-busy'],
          onClickCapture: block,
          onKeyDownCapture: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              event.stopPropagation()
            }
          },
        })
      : children

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      {...props}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={asChild ? undefined : inactive}
      aria-disabled={asChild && inactive ? true : props['aria-disabled']}
      aria-busy={loading || undefined}
      tabIndex={asChild && inactive ? -1 : props.tabIndex}
      onClick={(event) => {
        if (inactive) block(event)
        else props.onClick?.(event)
      }}
    >
      {loading && <Spinner aria-hidden="true" role="presentation" />}
      <Slottable>{child}</Slottable>
    </Comp>
  )
}

export { Button, buttonVariants }
