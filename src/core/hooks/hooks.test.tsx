import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useClipboard } from './useClipboard'
import { useDebouncedValue } from './useDebouncedValue'
import { useDisclosure } from './useDisclosure'
import { useMediaQuery } from './useMediaQuery'

describe('core hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('useDebouncedValue', () => {
    it('debounces value updates according to delay', () => {
      const { result, rerender } = renderHook(
        ({ val, delay }) => useDebouncedValue(val, delay),
        { initialProps: { val: 'initial', delay: 300 } }
      )

      expect(result.current).toBe('initial')

      rerender({ val: 'updated-1', delay: 300 })
      expect(result.current).toBe('initial') // Still initial before timer

      act(() => {
        vi.advanceTimersByTime(200)
      })
      rerender({ val: 'updated-2', delay: 300 })
      expect(result.current).toBe('initial') // Timer reset by second change

      act(() => {
        vi.advanceTimersByTime(300)
      })
      expect(result.current).toBe('updated-2')
    })

    it('cleans up timer on unmount and prevents state update after unmount', () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')
      const { unmount, rerender } = renderHook(
        ({ val }) => useDebouncedValue(val, 300),
        { initialProps: { val: 'test' } }
      )

      rerender({ val: 'new-val' })
      unmount()

      expect(clearTimeoutSpy).toHaveBeenCalled()
      // Should not throw or warn about unmounted state updates
      expect(() => vi.advanceTimersByTime(400)).not.toThrow()
    })
  })

  describe('useMediaQuery', () => {
    it('returns match status and updates when matchMedia triggers change event', () => {
      let changeListener: ((e: MediaQueryListEvent) => void) | null = null
      let matches = true

      const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
        get matches() {
          return matches
        },
        media: query,
        addEventListener: vi.fn(
          (event: string, cb: (e: MediaQueryListEvent) => void) => {
            if (event === 'change') changeListener = cb
          }
        ),
        removeEventListener: vi.fn(),
      }))

      vi.stubGlobal('matchMedia', mockMatchMedia)

      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
      expect(result.current).toBe(true)

      // Simulate media query change
      act(() => {
        matches = false
        changeListener?.({ matches: false } as MediaQueryListEvent)
      })

      expect(result.current).toBe(false)
    })

    it('handles legacy addListener and removes listener on unmount', () => {
      const removeListenerSpy = vi.fn()
      const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addListener: vi.fn(),
        removeListener: removeListenerSpy,
      }))
      vi.stubGlobal('matchMedia', mockMatchMedia)

      const { unmount } = renderHook(() => useMediaQuery('(max-width: 600px)'))
      unmount()

      expect(removeListenerSpy).toHaveBeenCalled()
    })

    it('handles absence of matchMedia API safely without crashing', () => {
      vi.stubGlobal('matchMedia', undefined)

      const { result } = renderHook(() =>
        useMediaQuery('(min-width: 1024px)', { defaultValue: false })
      )
      expect(result.current).toBe(false)
    })
  })

  describe('useDisclosure', () => {
    it('manages open, close and toggle state with callbacks', () => {
      const onOpen = vi.fn()
      const onClose = vi.fn()

      const { result } = renderHook(() =>
        useDisclosure(false, { onOpen, onClose })
      )

      expect(result.current.isOpen).toBe(false)

      act(() => {
        result.current.open()
      })
      expect(result.current.isOpen).toBe(true)
      expect(onOpen).toHaveBeenCalledTimes(1)

      act(() => {
        result.current.close()
      })
      expect(result.current.isOpen).toBe(false)
      expect(onClose).toHaveBeenCalledTimes(1)

      act(() => {
        result.current.toggle()
      })
      expect(result.current.isOpen).toBe(true)
    })

    it('supports array destructuring syntax', () => {
      const { result } = renderHook(() => useDisclosure(true))
      const [isOpen, controls] = result.current

      expect(isOpen).toBe(true)

      act(() => {
        controls.close()
      })
      expect(result.current[0]).toBe(false)
    })
  })

  describe('useClipboard', () => {
    it('copies text and automatically resets copied state after timeout', async () => {
      const writeTextSpy = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', {
        clipboard: {
          writeText: writeTextSpy,
        },
      })

      const { result } = renderHook(() => useClipboard({ timeout: 1500 }))

      expect(result.current.copied).toBe(false)
      expect(result.current.error).toBeNull()

      let success: boolean | undefined
      await act(async () => {
        success = await result.current.copy('Antigravity React Launchpad')
      })

      expect(success).toBe(true)
      expect(writeTextSpy).toHaveBeenCalledWith('Antigravity React Launchpad')
      expect(result.current.copied).toBe(true)

      // Advance timer by 1500ms
      act(() => {
        vi.advanceTimersByTime(1500)
      })

      expect(result.current.copied).toBe(false)
    })

    it('handles clipboard permission rejection safely', async () => {
      const permissionError = new Error('NotAllowedError: Permission denied')
      vi.stubGlobal('navigator', {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(permissionError),
        },
      })

      const { result } = renderHook(() => useClipboard())

      let success: boolean | undefined
      await act(async () => {
        success = await result.current.copy('Secret Token')
      })

      expect(success).toBe(false)
      expect(result.current.copied).toBe(false)
      expect(result.current.error).toBe(permissionError)
    })

    it('handles missing clipboard API gracefully', async () => {
      vi.stubGlobal('navigator', {})

      const { result } = renderHook(() => useClipboard())

      let success: boolean | undefined
      await act(async () => {
        success = await result.current.copy('Fallback text')
      })

      expect(success).toBe(false)
      expect(result.current.copied).toBe(false)
      expect(result.current.error).toBeInstanceOf(Error)
    })

    it('cleans up timeout on unmount', async () => {
      vi.stubGlobal('navigator', {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      })

      const { result, unmount } = renderHook(() =>
        useClipboard({ timeout: 2000 })
      )

      await act(async () => {
        await result.current.copy('Text')
      })

      expect(result.current.copied).toBe(true)
      unmount()

      expect(() => vi.advanceTimersByTime(2500)).not.toThrow()
    })
  })
})
