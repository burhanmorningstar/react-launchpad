import type { ReactNode } from 'react'

import { cn } from '@/core/ui/utils'

export interface FooterLink {
  label: ReactNode
  href: string
  external?: boolean
}

export interface FooterColumn {
  title: ReactNode
  links: readonly FooterLink[]
}

export interface SiteFooterProps {
  brand?: ReactNode
  description?: ReactNode
  columns?: readonly FooterColumn[]
  socials?: ReactNode
  bottom?: ReactNode
  copyright?: ReactNode
  className?: string
}

export function SiteFooter({
  brand,
  description,
  columns = [],
  socials,
  bottom,
  copyright,
  className,
}: SiteFooterProps) {
  return (
    <footer
      className={cn(
        'border-t border-border/40 bg-muted/20 py-12 sm:py-16',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {brand || description || socials ? (
            <div className="flex flex-col gap-4 lg:col-span-4">
              {brand ? (
                <div className="flex items-center gap-2">{brand}</div>
              ) : null}
              {description ? (
                <p className="max-w-sm text-sm text-muted-foreground">
                  {description}
                </p>
              ) : null}
              {socials ? (
                <div className="flex items-center gap-3 pt-2">{socials}</div>
              ) : null}
            </div>
          ) : null}

          {columns.length > 0 ? (
            <div
              className={cn(
                'grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4',
                brand || description || socials
                  ? 'lg:col-span-8'
                  : 'lg:col-span-12'
              )}
            >
              {columns.map((column, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold tracking-wider text-foreground">
                    {column.title}
                  </h3>
                  <ul className="flex flex-col gap-2.5">
                    {column.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                          {...(link.external
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {bottom || copyright ? (
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 sm:flex-row">
            {copyright ? (
              <p className="text-xs text-muted-foreground">{copyright}</p>
            ) : null}
            {bottom ? (
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {bottom}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </footer>
  )
}
