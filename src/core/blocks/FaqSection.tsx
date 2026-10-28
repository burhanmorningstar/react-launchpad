import type { ReactNode } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/core/ui/components/accordion'
import { cn } from '@/core/ui/utils'

export interface FaqItem {
  id: string
  question: ReactNode
  answer: ReactNode
}

export interface FaqSectionProps {
  badge?: ReactNode
  title?: ReactNode
  description?: ReactNode
  items: readonly FaqItem[]
  className?: string
}

export function FaqSection({
  badge,
  title,
  description,
  items,
  className,
}: FaqSectionProps) {
  return (
    <section className={cn('py-16 sm:py-24', className)}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {badge || title || description ? (
          <div className="mb-12 text-center sm:mb-16">
            {badge ? (
              <div className="mb-3 flex justify-center">{badge}</div>
            ) : null}
            {title ? (
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}

        <Accordion type="single" collapsible className="w-full">
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline sm:text-lg">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
