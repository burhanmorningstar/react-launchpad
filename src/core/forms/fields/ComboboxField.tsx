import { useEffect, useRef, useState, type ReactNode } from 'react'

import { CheckIcon, ChevronsUpDownIcon, Loader2Icon, XIcon } from 'lucide-react'
import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import { Button } from '@/core/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/core/ui/components/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/core/ui/components/popover'
import { cn } from '@/core/ui/utils'

import { FieldShell } from '../FieldShell'

import type { BaseFieldProps } from '../types'

export interface ComboboxOption {
  value: string
  label: ReactNode
  disabled?: boolean
  keywords?: string[]
}

export interface ComboboxFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  options?: readonly ComboboxOption[]
  queryFn?: (query: string, signal?: AbortSignal) => Promise<ComboboxOption[]>
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  clearable?: boolean
  debounceMs?: number
}

export function ComboboxField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control: explicitControl,
  label,
  hint,
  description,
  required,
  disabled,
  className,
  labelClassName,
  hintClassName,
  errorClassName,
  options: staticOptions,
  queryFn,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  clearable = true,
  debounceMs = 250,
}: ComboboxFieldProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>()
  const control = explicitControl || formContext?.control

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [asyncOptions, setAsyncOptions] = useState<ComboboxOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [asyncError, setAsyncError] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  // Handle async query fetching with debounce & stale request abortion
  useEffect(() => {
    if (!queryFn || !open) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    const timer = setTimeout(async () => {
      setIsLoading(true)
      setAsyncError(null)

      try {
        const results = await queryFn(searchQuery, controller.signal)
        if (!controller.signal.aborted) {
          setAsyncOptions(results)
          setIsLoading(false)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setAsyncError(
            err instanceof Error ? err.message : 'Error fetching options'
          )
          setIsLoading(false)
        }
      }
    }, debounceMs)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [searchQuery, queryFn, open, debounceMs])

  const displayedOptions = queryFn ? asyncOptions : staticOptions || []

  return (
    <FieldShell
      name={name}
      label={label}
      hint={hint}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
      labelClassName={labelClassName}
      hintClassName={hintClassName}
      errorClassName={errorClassName}
    >
      {(ctx) => (
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const selectedOption = displayedOptions.find(
              (opt) => opt.value === field.value
            )
            const displayLabel = selectedOption
              ? selectedOption.label
              : field.value || placeholder

            const handleClear = (e: React.MouseEvent) => {
              e.stopPropagation()
              field.onChange('')
            }

            return (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id={ctx.id}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-invalid={ctx.ariaInvalid}
                    aria-describedby={ctx.ariaDescribedBy}
                    disabled={ctx.disabled}
                    className={cn(
                      'w-full justify-between font-normal',
                      !field.value && 'text-muted-foreground',
                      ctx.hasError && 'border-destructive ring-destructive/20'
                    )}
                  >
                    <span className="truncate">{displayLabel}</span>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      {clearable && field.value && !ctx.disabled && (
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label="Clear selection"
                          className="rounded-sm p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                          onClick={handleClear}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              field.onChange('')
                            }
                          }}
                        >
                          <XIcon className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0"
                  align="start"
                >
                  <Command shouldFilter={!queryFn}>
                    <CommandInput
                      placeholder={searchPlaceholder}
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      {isLoading && (
                        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground gap-2">
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                          <span>Searching...</span>
                        </div>
                      )}
                      {!isLoading && asyncError && (
                        <div className="p-4 text-center text-sm text-destructive">
                          {asyncError}
                        </div>
                      )}
                      {!isLoading && !asyncError && (
                        <>
                          <CommandEmpty>{emptyMessage}</CommandEmpty>
                          <CommandGroup>
                            {displayedOptions.map((option) => (
                              <CommandItem
                                key={option.value}
                                value={
                                  typeof option.label === 'string'
                                    ? option.label
                                    : option.value
                                }
                                disabled={option.disabled}
                                onSelect={() => {
                                  field.onChange(
                                    option.value === field.value
                                      ? ''
                                      : option.value
                                  )
                                  setOpen(false)
                                }}
                              >
                                <CheckIcon
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value === option.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {option.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )
          }}
        />
      )}
    </FieldShell>
  )
}
