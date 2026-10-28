import { useState } from 'react'

import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react'
import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import { Badge } from '@/core/ui/components/badge'
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

export interface MultiSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface MultiSelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  options: readonly MultiSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  maxDisplay?: number
}

export function MultiSelectField<
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
  options,
  placeholder = 'Select items...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No options found.',
  maxDisplay = 3,
}: MultiSelectFieldProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>()
  const control = explicitControl || formContext?.control

  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

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
            const selectedValues: string[] = Array.isArray(field.value)
              ? field.value
              : []

            const toggleOption = (val: string) => {
              const next = selectedValues.includes(val)
                ? selectedValues.filter((v) => v !== val)
                : [...selectedValues, val]
              field.onChange(next)
            }

            const removeOption = (val: string, e?: React.MouseEvent) => {
              if (e) e.stopPropagation()
              field.onChange(selectedValues.filter((v) => v !== val))
            }

            const visibleValues = selectedValues.slice(0, maxDisplay)
            const remainingCount = selectedValues.length - maxDisplay

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
                      'w-full min-h-9 h-auto justify-between font-normal py-1.5 px-3 flex items-center',
                      selectedValues.length === 0 && 'text-muted-foreground',
                      ctx.hasError && 'border-destructive ring-destructive/20'
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
                      {selectedValues.length === 0 && (
                        <span>{placeholder}</span>
                      )}
                      {visibleValues.map((val) => {
                        const opt = options.find((o) => o.value === val)
                        const labelText = opt ? opt.label : val
                        return (
                          <Badge
                            key={val}
                            variant="secondary"
                            className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-normal"
                          >
                            <span>{labelText}</span>
                            {!ctx.disabled && (
                              <span
                                role="button"
                                tabIndex={0}
                                aria-label={`Remove ${labelText}`}
                                className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                                onClick={(e) => removeOption(val, e)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    removeOption(val)
                                  }
                                }}
                              >
                                <XIcon className="h-3 w-3" />
                              </span>
                            )}
                          </Badge>
                        )
                      })}
                      {remainingCount > 0 && (
                        <Badge
                          variant="outline"
                          className="text-xs px-1.5 py-0.5 font-normal"
                        >
                          +{remainingCount} more
                        </Badge>
                      )}
                    </div>
                    <ChevronsUpDownIcon className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder={searchPlaceholder}
                      value={searchValue}
                      onValueChange={setSearchValue}
                      onKeyDown={(e) => {
                        if (
                          e.key === 'Backspace' &&
                          !searchValue &&
                          selectedValues.length > 0
                        ) {
                          removeOption(
                            selectedValues[selectedValues.length - 1]
                          )
                        }
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>{emptyMessage}</CommandEmpty>
                      <CommandGroup>
                        {options.map((option) => {
                          const isSelected = selectedValues.includes(
                            option.value
                          )
                          return (
                            <CommandItem
                              key={option.value}
                              value={option.label}
                              disabled={option.disabled}
                              onSelect={() => toggleOption(option.value)}
                            >
                              <div
                                className={cn(
                                  'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                  isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'opacity-50 [&_svg]:invisible'
                                )}
                              >
                                <CheckIcon className="h-3.5 w-3.5" />
                              </div>
                              <span>{option.label}</span>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
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
