import { describe, expect, it } from 'vitest'

import {
  parseSearchParams,
  queryParsers,
  serializeSearchParams,
  type QuerySchema,
} from './queryState'

describe('queryState', () => {
  describe('individual parsers', () => {
    it('handles string parser with defaults, empty string and Turkish characters', () => {
      const stringParser = queryParsers.string('default-val')

      expect(stringParser.parse('hello')).toBe('hello')
      expect(stringParser.parse('')).toBe('')
      expect(stringParser.parse(undefined)).toBe('default-val')
      expect(stringParser.parse('şehir seçimi ve Türkçe karakterler')).toBe(
        'şehir seçimi ve Türkçe karakterler'
      )

      expect(stringParser.serialize('hello')).toBe('hello')
      expect(stringParser.serialize('default-val')).toBeUndefined()
    })

    it('handles number parser with validation, clamping, integers and invalid input', () => {
      const pageParser = queryParsers.number({
        defaultValue: 1,
        min: 1,
        max: 100,
        integer: true,
      })

      expect(pageParser.parse('5')).toBe(5)
      expect(pageParser.parse('invalid')).toBe(1)
      expect(pageParser.parse('NaN')).toBe(1)
      expect(pageParser.parse('9999')).toBe(100) // Clamped to max
      expect(pageParser.parse('-10')).toBe(1) // Clamped to min
      expect(pageParser.parse('3.7')).toBe(3) // Truncated to integer
      expect(pageParser.parse(undefined)).toBe(1)

      expect(pageParser.serialize(5)).toBe('5')
      expect(pageParser.serialize(1)).toBeUndefined()
    })

    it('handles boolean parser', () => {
      const boolParser = queryParsers.boolean(false)

      expect(boolParser.parse('true')).toBe(true)
      expect(boolParser.parse('1')).toBe(true)
      expect(boolParser.parse('false')).toBe(false)
      expect(boolParser.parse('0')).toBe(false)
      expect(boolParser.parse('unknown')).toBe(false)
      expect(boolParser.parse(undefined)).toBe(false)

      expect(boolParser.serialize(true)).toBe('true')
      expect(boolParser.serialize(false)).toBeUndefined()
    })

    it('handles enum parser and rejects invalid or unknown values', () => {
      const statusParser = queryParsers.enum(
        ['pending', 'active', 'archived'] as const,
        'active'
      )

      expect(statusParser.parse('pending')).toBe('pending')
      expect(statusParser.parse('active')).toBe('active')
      expect(statusParser.parse('corrupt_status')).toBe('active')
      expect(statusParser.parse(undefined)).toBe('active')

      expect(statusParser.serialize('pending')).toBe('pending')
      expect(statusParser.serialize('active')).toBeUndefined()
    })

    it('handles date parser with invalid date fallback', () => {
      const dateParser = queryParsers.date({ defaultValue: null })

      const parsed = dateParser.parse('2026-10-28T12:00:00.000Z')
      expect(parsed).toBeInstanceOf(Date)
      expect(parsed?.toISOString()).toBe('2026-10-28T12:00:00.000Z')

      expect(dateParser.parse('invalid-date')).toBeNull()
      expect(dateParser.parse(undefined)).toBeNull()

      const now = new Date('2026-10-28T00:00:00.000Z')
      expect(dateParser.serialize(now)).toBe('2026-10-28T00:00:00.000Z')
      expect(dateParser.serialize(null)).toBeUndefined()
    })

    it('handles array parser with separator and repeated params', () => {
      const tagsParser = queryParsers.array(queryParsers.string(), {
        separator: ',',
        defaultValue: [],
      })

      expect(tagsParser.parse('react,typescript,vite')).toEqual([
        'react',
        'typescript',
        'vite',
      ])
      expect(tagsParser.parse(['react', 'tailwind'])).toEqual([
        'react',
        'tailwind',
      ])
      expect(tagsParser.parse('')).toEqual([])
      expect(tagsParser.parse(undefined)).toEqual([])

      expect(tagsParser.serialize(['a', 'b'])).toBe('a,b')
      expect(tagsParser.serialize([])).toBeUndefined()
    })
  })

  describe('parseSearchParams and serializeSearchParams', () => {
    const tableSchema: QuerySchema = {
      q: queryParsers.string(''),
      page: queryParsers.number({ defaultValue: 1, min: 1, max: 100 }),
      pageSize: queryParsers.number({ defaultValue: 10, min: 5, max: 100 }),
      status: queryParsers.enum(['all', 'active', 'inactive'] as const, 'all'),
      tags: queryParsers.array(queryParsers.string(), { defaultValue: [] }),
    }

    it('normalizes corrupt, out-of-range, and empty parameters safely', () => {
      const search = new URLSearchParams(
        'q=t%C3%BCrk%C3%A7e%20arama&page=not-a-number&pageSize=99999&status=invalid_enum'
      )

      const parsed = parseSearchParams(search, tableSchema)

      expect(parsed).toEqual({
        q: 'türkçe arama',
        page: 1, // Normalized from NaN
        pageSize: 100, // Clamped from 99999 to max 100
        status: 'all', // Normalized from invalid enum
        tags: [],
      })
    })

    it('preserves unknown query keys from other widgets by default', () => {
      const current = new URLSearchParams(
        'tab=security&theme=dark&page=2&q=existing'
      )

      const serialized = serializeSearchParams(
        { page: 3, q: 'updated' },
        tableSchema,
        current,
        { preserveUnknown: true }
      )

      expect(serialized.get('tab')).toBe('security')
      expect(serialized.get('theme')).toBe('dark')
      expect(serialized.get('page')).toBe('3')
      expect(serialized.get('q')).toBe('updated')
    })

    it('omits defaults from URL to keep clean search strings', () => {
      const current = new URLSearchParams('page=2&pageSize=10&status=active')

      // Changing page back to 1 (default) and status back to all (default)
      const serialized = serializeSearchParams(
        { page: 1, status: 'all' },
        tableSchema,
        current
      )

      expect(serialized.has('page')).toBe(false) // Default 1 is removed
      expect(serialized.has('status')).toBe(false) // Default all is removed
      expect(serialized.has('pageSize')).toBe(false) // Default 10 was present, but stripped because equal to default
    })

    it('can drop unknown keys if preserveUnknown is set to false', () => {
      const current = new URLSearchParams('unrelated=123&q=test')

      const serialized = serializeSearchParams(
        { q: 'new-query' },
        tableSchema,
        current,
        { preserveUnknown: false }
      )

      expect(serialized.has('unrelated')).toBe(false)
      expect(serialized.get('q')).toBe('new-query')
    })
  })
})
