import * as React from 'react'

import { ArrowLeft, ArrowRight } from 'lucide-react'

import { Button } from '@/core/ui/components/button'
import { cn } from '@/core/ui/utils'

interface CarouselContextProps {
  carouselRef: React.RefObject<HTMLDivElement | null>
  orientation: 'horizontal' | 'vertical'
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

export function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }
  return context
}

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
}

export function Carousel({
  orientation = 'horizontal',
  className,
  children,
  ...props
}: CarouselProps) {
  const carouselRef = React.useRef<HTMLDivElement | null>(null)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(true)

  const checkScroll = React.useCallback(() => {
    if (!carouselRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setCanScrollPrev(scrollLeft > 0)
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 1)
  }, [])

  React.useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll])

  const scrollPrev = React.useCallback(() => {
    if (!carouselRef.current) return
    const amount = carouselRef.current.clientWidth
    carouselRef.current.scrollBy({ left: -amount, behavior: 'smooth' })
  }, [])

  const scrollNext = React.useCallback(() => {
    if (!carouselRef.current) return
    const amount = carouselRef.current.clientWidth
    carouselRef.current.scrollBy({ left: amount, behavior: 'smooth' })
  }, [])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        orientation,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        role="region"
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={cn('relative focus:outline-none', className)}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

export function CarouselContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className={cn(
        'flex overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth',
        orientation === 'vertical' && 'flex-col overflow-y-auto',
        className
      )}
      {...props}
    />
  )
}

export function CarouselItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={cn('min-w-0 shrink-0 grow-0 basis-full snap-start', className)}
      {...props}
    />
  )
}

export function CarouselPrevious({
  className,
  variant = 'outline',
  size = 'icon',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full z-10',
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      aria-label="Previous slide"
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

export function CarouselNext({
  className,
  variant = 'outline',
  size = 'icon',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full z-10',
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      aria-label="Next slide"
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}
