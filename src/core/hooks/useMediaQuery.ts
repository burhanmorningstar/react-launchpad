import { useCallback, useSyncExternalStore } from 'react'

export interface UseMediaQueryOptions {
  defaultValue?: boolean
}

/**
 * Responsive media query hook with SSR safety and external store subscription.
 */
export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {}
): boolean {
  const { defaultValue = false } = options

  const subscribe = useCallback(
    (callback: () => void) => {
      if (
        typeof window === 'undefined' ||
        typeof window.matchMedia !== 'function'
      ) {
        return () => {}
      }

      const mediaQueryList = window.matchMedia(query)

      if (typeof mediaQueryList.addEventListener === 'function') {
        mediaQueryList.addEventListener('change', callback)
        return () => {
          mediaQueryList.removeEventListener('change', callback)
        }
      }

      if (typeof mediaQueryList.addListener === 'function') {
        mediaQueryList.addListener(callback)
        return () => {
          mediaQueryList.removeListener(callback)
        }
      }

      return () => {}
    },
    [query]
  )

  const getSnapshot = useCallback(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return defaultValue
    }
    return window.matchMedia(query).matches
  }, [query, defaultValue])

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
