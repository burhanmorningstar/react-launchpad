import * as React from 'react'

import { cn } from '@/core/ui/utils/index'

export interface InputProps extends React.ComponentProps<'input'> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const id = React.useId()
    const inputId = props.id || id

    if (label) {
      return (
        <div className="space-y-2">
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
          <input
            id={inputId}
            ref={ref}
            type={type}
            data-slot="input"
            aria-invalid={error ? 'true' : undefined}
            className={cn(
              'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-[var(--control-height)] w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-[var(--disabled-opacity)] md:text-sm',
              'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
              className
            )}
            {...props}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )
    }

    return (
      <input
        id={inputId}
        ref={ref}
        type={type}
        data-slot="input"
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-[var(--control-height)] w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-[var(--disabled-opacity)] md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
