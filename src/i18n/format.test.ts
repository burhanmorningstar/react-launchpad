import { describe, expect, it } from 'vitest'

import {
  formatCurrency,
  formatDateOnly,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from './format'

describe('i18n formatting', () => {
  describe('formatDateOnly', () => {
    it('does not shift calendar date across timezones for ISO date strings', () => {
      // YYYY-MM-DD string representation should strictly retain 2026-05-01 regardless of local timezone
      const formattedEn = formatDateOnly(
        '2026-05-01',
        { timeZone: 'America/New_York' },
        'en-US'
      )
      expect(formattedEn).toContain('5/1/2026')

      const formattedTr = formatDateOnly(
        '2026-05-01',
        { timeZone: 'Asia/Tokyo' },
        'tr-TR'
      )
      expect(formattedTr).toContain('1.05.2026')
    })

    it('formats Date objects cleanly', () => {
      const date = new Date(Date.UTC(2026, 9, 28))
      const formatted = formatDateOnly(date, { timeZone: 'UTC' }, 'en-US')
      expect(formatted).toBe('10/28/2026')
    })
  })

  describe('formatDateTime', () => {
    it('formats full timestamps with explicit timezone', () => {
      const timestamp = new Date('2026-10-28T12:00:00Z')
      const formattedUtc = formatDateTime(
        timestamp,
        { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false },
        'en-GB'
      )
      expect(formattedUtc).toContain('12:00')
    })
  })

  describe('formatNumber and formatPercent', () => {
    it('formats numbers according to locale conventions', () => {
      expect(formatNumber(1234567.89, {}, 'en-US')).toBe('1,234,567.89')
      // In Turkish, thousand separator is dot and decimal separator is comma
      const trNumber = formatNumber(1234567.89, {}, 'tr-TR')
      expect(trNumber).toContain('1.234.567,89')
    })

    it('formats percentages correctly', () => {
      expect(formatPercent(0.255, { minimumFractionDigits: 1 }, 'en-US')).toBe(
        '25.5%'
      )
      const trPercent = formatPercent(
        0.255,
        { minimumFractionDigits: 1 },
        'tr-TR'
      )
      expect(trPercent).toContain('25,5')
    })
  })

  describe('formatCurrency', () => {
    it('formats currency according to active locale and currency code', () => {
      const enUsd = formatCurrency(49.99, 'USD', {}, 'en-US')
      expect(enUsd).toBe('$49.99')

      const trTry = formatCurrency(1250, 'TRY', {}, 'tr-TR')
      expect(trTry).toMatch(/₺|TL/)
      expect(trTry).toContain('1.250')
    })
  })

  describe('formatRelativeTime', () => {
    it('formats relative units in English and Turkish', () => {
      expect(formatRelativeTime(-1, 'day', { numeric: 'always' }, 'en')).toBe(
        '1 day ago'
      )
      expect(formatRelativeTime(-1, 'day', { numeric: 'always' }, 'tr')).toBe(
        '1 gün önce'
      )
      expect(formatRelativeTime(-1, 'day', { numeric: 'auto' }, 'en')).toBe(
        'yesterday'
      )
      expect(formatRelativeTime(-1, 'day', { numeric: 'auto' }, 'tr')).toBe(
        'dün'
      )
      expect(formatRelativeTime(2, 'hour', {}, 'en')).toBe('in 2 hours')
      expect(formatRelativeTime(2, 'hour', {}, 'tr')).toBe('2 saat sonra')
    })
  })
})
