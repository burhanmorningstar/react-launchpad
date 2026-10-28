import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseClipboardOptions {
  timeout?: number
}

export interface UseClipboardResult {
  copied: boolean
  error: Error | null
  copy: (text: string) => Promise<boolean>
  reset: () => void
}

/**
 * Copies text to the clipboard with modern Async Clipboard API and legacy fallback.
 * Automatically clears copied state after timeout and cleans up on unmount.
 */
export function useClipboard(
  options: UseClipboardOptions = {}
): UseClipboardResult {
  const { timeout = 2000 } = options
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [clearTimer])

  const reset = useCallback(() => {
    clearTimer()
    setCopied(false)
    setError(null)
  }, [clearTimer])

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      clearTimer()

      if (
        typeof navigator === 'undefined' ||
        !navigator.clipboard ||
        typeof navigator.clipboard.writeText !== 'function'
      ) {
        // Fallback for browsers without Clipboard API
        try {
          if (typeof document !== 'undefined') {
            const textarea = document.createElement('textarea')
            textarea.value = text
            textarea.style.position = 'fixed'
            textarea.style.left = '-9999px'
            document.body.appendChild(textarea)
            textarea.focus()
            textarea.select()
            const successful = document.execCommand('copy')
            document.body.removeChild(textarea)
            if (successful) {
              setCopied(true)
              setError(null)
              timeoutRef.current = setTimeout(() => {
                setCopied(false)
              }, timeout)
              return true
            }
          }
        } catch {
          // Ignore fallback error and report error below
        }

        const err = new Error('Clipboard API is not available')
        setError(err)
        setCopied(false)
        return false
      }

      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setError(null)

        timeoutRef.current = setTimeout(() => {
          setCopied(false)
        }, timeout)

        return true
      } catch (err) {
        const errorInstance =
          err instanceof Error ? err : new Error('Failed to copy to clipboard')
        setError(errorInstance)
        setCopied(false)
        return false
      }
    },
    [clearTimer, timeout]
  )

  return { copied, error, copy, reset }
}
