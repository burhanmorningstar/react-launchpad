import { useState } from 'react'

import { CalendarIcon, XIcon } from 'lucide-react'
import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import { Button } from '@/core/ui/components/button'
import { Calendar } from '@/core/ui/components/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/core/ui/components/popover'
import { cn } from '@/core/ui/utils'
import { formatDateOnly } from '@/i18n'

import { FieldShell } from '../FieldShell'

import type { BaseFieldProps } from '../types'

export interface DateFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  valueMode?: 'date-only' | 'iso' | 'date'
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  clearable?: boolean
}

export function DateField<
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
  valueMode = 'date-only',
  placeholder = 'Pick a date',
  minDate,
  maxDate,
  clearable = true,
}: DateFieldProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>()
  const control = explicitControl || formContext?.control

  const [open, setOpen] = useState(false)

  // Converts a stored value to Date object for the Calendar
  const parseToDate = (val: unknown): Date | undefined => {
    if (!val) return undefined
    if (val instanceof Date) return isNaN(val.getTime()) ? undefined : val
    if (typeof val === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const [year, month, day] = val.split('-').map(Number)
        return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
      }
      const d = new Date(val)
      return isNaN(d.getTime()) ? undefined : d
    }
    return undefined
  }

  // Serializes selected Date according to valueMode
  const serializeDate = (date: Date | undefined): string | Date | undefined => {
    if (!date) return undefined
    if (valueMode === 'date') return date
    if (valueMode === 'iso') return date.toISOString()
    // date-only: YYYY-MM-DD using local year/month/day
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

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
            const dateValue = parseToDate(field.value)
            const displayLabel = dateValue
              ? formatDateOnly(dateValue)
              : placeholder

            const handleClear = (e: React.MouseEvent) => {
              e.preventDefault()
              e.stopPropagation()
              field.onChange('')
            }

            return (
              <div className="relative flex items-center w-full">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id={ctx.id}
                      type="button"
                      variant="outline"
                      aria-invalid={ctx.ariaInvalid}
                      aria-describedby={ctx.ariaDescribedBy}
                      disabled={ctx.disabled}
                      className={cn(
                        'w-full justify-start font-normal text-left',
                        clearable && dateValue && 'pr-8',
                        !dateValue && 'text-muted-foreground',
                        ctx.hasError && 'border-destructive ring-destructive/20'
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
                        <span className="truncate">{displayLabel}</span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateValue}
                      onSelect={(selected) => {
                        field.onChange(serializeDate(selected))
                        setOpen(false)
                      }}
                      disabled={(date) => {
                        if (minDate && date < minDate) return true
                        if (maxDate && date > maxDate) return true
                        return false
                      }}
                    />
                  </PopoverContent>
                </Popover>

                {clearable && dateValue && !ctx.disabled && (
                  <button
                    type="button"
                    aria-label="Clear date"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground z-10"
                    onClick={handleClear}
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )
          }}
        />
      )}
    </FieldShell>
  )
}
