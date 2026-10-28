import { useEffect } from 'react'

import { useBlocker } from 'react-router'

export interface UseUnsavedChangesOptions {
  isDirty: boolean
  isSubmitting?: boolean
  enabled?: boolean
  message?: string
  autoConfirm?: boolean
}

export interface UseUnsavedChangesReturn {
  shouldBlock: boolean
  blocker?: ReturnType<typeof useBlocker>
}

export function useUnsavedChanges({
  isDirty,
  isSubmitting = false,
  enabled = true,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  autoConfirm = true,
}: UseUnsavedChangesOptions): UseUnsavedChangesReturn {
  const shouldBlock = Boolean(enabled && isDirty && !isSubmitting)

  // 1. Browser window beforeunload listener (reloads, tab close, external navigation)
  useEffect(() => {
    if (!shouldBlock) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = message
      return message
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [shouldBlock, message])

  // 2. React Router blocker (SPA internal transitions)
  let blocker: ReturnType<typeof useBlocker> | undefined
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    blocker = useBlocker(
      ({ currentLocation, nextLocation }) =>
        shouldBlock && currentLocation.pathname !== nextLocation.pathname
    )
  } catch {
    // Graceful fallback when outside a Data Router context (e.g. standalone test/story)
    blocker = undefined
  }

  useEffect(() => {
    if (!autoConfirm || !blocker) return

    if (blocker.state === 'blocked') {
      const confirmed = window.confirm(message)
      if (confirmed) {
        blocker.proceed()
      } else {
        blocker.reset()
      }
    }
  }, [blocker, message, autoConfirm])

  return {
    shouldBlock,
    blocker,
  }
}
