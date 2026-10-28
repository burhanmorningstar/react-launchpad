import { useCallback, useMemo, useState } from 'react'

export interface UseDisclosureOptions {
  onOpen?: () => void
  onClose?: () => void
}

export interface DisclosureActions {
  open: () => void
  close: () => void
  toggle: () => void
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void
}

export type UseDisclosureResult = [boolean, DisclosureActions] & {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void
}

/**
 * Manages open/close disclosure state for dialogs, drawers, dropdowns and accordions.
 */
export function useDisclosure(
  initialState = false,
  options: UseDisclosureOptions = {}
): UseDisclosureResult {
  const { onOpen, onClose } = options
  const [isOpen, setIsOpen] = useState(initialState)

  const open = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) onOpen?.()
      return true
    })
  }, [onOpen])

  const close = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) onClose?.()
      return false
    })
  }, [onClose])

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) onOpen?.()
      else onClose?.()
      return !prev
    })
  }, [onOpen, onClose])

  const setOpen = useCallback(
    (action: boolean | ((prev: boolean) => boolean)) => {
      setIsOpen((prev) => {
        const next = typeof action === 'function' ? action(prev) : action
        if (!prev && next) onOpen?.()
        if (prev && !next) onClose?.()
        return next
      })
    },
    [onOpen, onClose]
  )

  const result = useMemo(() => {
    const actions: DisclosureActions = { open, close, toggle, setOpen }
    const tuple = [isOpen, actions] as UseDisclosureResult
    tuple.isOpen = isOpen
    tuple.open = open
    tuple.close = close
    tuple.toggle = toggle
    tuple.setOpen = setOpen
    return tuple
  }, [isOpen, open, close, toggle, setOpen])

  return result
}
