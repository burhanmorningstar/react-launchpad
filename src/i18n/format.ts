import i18n from './index'

import type { FormatDateOptions, FormatDateTimeOptions } from './types.runtime'

function getActiveLocale(override?: string): string {
  if (override) return override
  return i18n.language || 'en'
}

/**
 * Formats a calendar date without timezone shift.
 * If given a date-only string (e.g. 'YYYY-MM-DD'), it ensures the displayed day
 * does not shift to the previous or next day in any timezone.
 */
export function formatDateOnly(
  date: string | Date,
  options?: FormatDateOptions,
  locale?: string
): string {
  const activeLocale = getActiveLocale(locale)

  let dateObj: Date
  let formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    ...options,
  }

  if (typeof date === 'string') {
    // Check if it starts with YYYY-MM-DD
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date)
    if (match) {
      const year = Number.parseInt(match[1], 10)
      const month = Number.parseInt(match[2], 10) - 1
      const day = Number.parseInt(match[3], 10)
      // Anchor at UTC noon to avoid any midnight timezone rollbacks
      dateObj = new Date(Date.UTC(year, month, day, 12, 0, 0))
      formatOptions = {
        ...formatOptions,
        timeZone: 'UTC',
      }
    } else {
      dateObj = new Date(date)
    }
  } else {
    dateObj = date
  }

  return new Intl.DateTimeFormat(activeLocale, formatOptions).format(dateObj)
}

/**
 * Formats full timestamp with optional explicit timezone.
 */
export function formatDateTime(
  date: string | Date | number,
  options?: FormatDateTimeOptions,
  locale?: string
): string {
  const activeLocale = getActiveLocale(locale)
  const dateObj = typeof date === 'object' ? date : new Date(date)

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    ...options,
  }

  return new Intl.DateTimeFormat(activeLocale, formatOptions).format(dateObj)
}

/**
 * Formats numbers according to active locale rules (thousands/decimal separators).
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string
): string {
  const activeLocale = getActiveLocale(locale)
  return new Intl.NumberFormat(activeLocale, options).format(value)
}

/**
 * Formats percentages according to active locale rules.
 */
export function formatPercent(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string
): string {
  const activeLocale = getActiveLocale(locale)
  return new Intl.NumberFormat(activeLocale, {
    style: 'percent',
    ...options,
  }).format(value)
}

/**
 * Formats currency according to active locale and target currency code.
 */
export function formatCurrency(
  value: number,
  currency: string,
  options?: Intl.NumberFormatOptions,
  locale?: string
): string {
  const activeLocale = getActiveLocale(locale)
  return new Intl.NumberFormat(activeLocale, {
    style: 'currency',
    currency,
    ...options,
  }).format(value)
}

/**
 * Formats relative time units (e.g. 1 day ago, in 2 hours).
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  options?: Intl.RelativeTimeFormatOptions,
  locale?: string
): string {
  const activeLocale = getActiveLocale(locale)
  return new Intl.RelativeTimeFormat(activeLocale, {
    numeric: 'auto',
    ...options,
  }).format(value, unit)
}
