import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type UIEvent,
} from 'react'

import { cn } from '@/core/ui/utils'

export interface VirtualListProps<T> {
  items: T[]
  height?: number | string
  itemHeight: number
  overscan?: number
  getItemKey: (item: T, index: number) => string | number
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  emptyMessage?: string
  ariaLabel?: string
}

export function VirtualList<T>({
  items,
  height = 400,
  itemHeight,
  overscan = 3,
  getItemKey,
  renderItem,
  className,
  emptyMessage = 'No items available',
  ariaLabel = 'Virtualized list',
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState<number>(
    typeof height === 'number' ? height : 400
  )

  // Observe container resize
  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setContainerHeight(entry.contentRect.height)
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const el = containerRef.current
      if (!el) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        el.scrollBy({ top: itemHeight, behavior: 'smooth' })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        el.scrollBy({ top: -itemHeight, behavior: 'smooth' })
      } else if (e.key === 'PageDown') {
        e.preventDefault()
        el.scrollBy({ top: containerHeight, behavior: 'smooth' })
      } else if (e.key === 'PageUp') {
        e.preventDefault()
        el.scrollBy({ top: -containerHeight, behavior: 'smooth' })
      }
    },
    [containerHeight, itemHeight]
  )

  const totalHeight = items.length * itemHeight

  // Compute visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex)
  const offsetY = startIndex * itemHeight

  if (items.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-md border p-8 text-sm text-muted-foreground',
          className
        )}
        style={{ height }}
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      role="feed"
      aria-label={ariaLabel}
      tabIndex={0}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative overflow-y-auto rounded-md border focus:outline-none focus:ring-1 focus:ring-ring',
        className
      )}
      style={{ height }}
    >
      <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
          }}
        >
          {visibleItems.map((item, i) => {
            const actualIndex = startIndex + i
            const key = getItemKey(item, actualIndex)
            return (
              <div
                key={key}
                style={{ height: itemHeight }}
                className="box-border"
              >
                {renderItem(item, actualIndex)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
