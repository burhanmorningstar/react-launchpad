import { useEffect, useRef } from 'react'

export interface PageMetaProps {
  title?: string
  description?: string
  canonical?: string
}

export function PageMeta({ title, description, canonical }: PageMetaProps) {
  const previousTitleRef = useRef<string | null>(null)
  const previousDescRef = useRef<{ content: string; created: boolean } | null>(
    null
  )
  const previousCanonicalRef = useRef<{
    href: string
    created: boolean
  } | null>(null)

  useEffect(() => {
    if (title !== undefined) {
      if (previousTitleRef.current === null) {
        previousTitleRef.current = document.title
      }
      document.title = title
    }

    return () => {
      if (previousTitleRef.current !== null) {
        document.title = previousTitleRef.current
        previousTitleRef.current = null
      }
    }
  }, [title])

  useEffect(() => {
    if (description !== undefined) {
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
        if (previousDescRef.current === null) {
          previousDescRef.current = { content: '', created: true }
        }
      } else if (previousDescRef.current === null) {
        previousDescRef.current = {
          content: meta.getAttribute('content') ?? '',
          created: false,
        }
      }
      meta.setAttribute('content', description)
    }

    return () => {
      if (previousDescRef.current !== null) {
        const meta = document.querySelector('meta[name="description"]')
        if (meta) {
          if (previousDescRef.current.created) {
            meta.remove()
          } else {
            meta.setAttribute('content', previousDescRef.current.content)
          }
        }
        previousDescRef.current = null
      }
    }
  }, [description])

  useEffect(() => {
    if (canonical !== undefined) {
      let link = document.querySelector('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        document.head.appendChild(link)
        if (previousCanonicalRef.current === null) {
          previousCanonicalRef.current = { href: '', created: true }
        }
      } else if (previousCanonicalRef.current === null) {
        previousCanonicalRef.current = {
          href: link.getAttribute('href') ?? '',
          created: false,
        }
      }
      link.setAttribute('href', canonical)
    }

    return () => {
      if (previousCanonicalRef.current !== null) {
        const link = document.querySelector('link[rel="canonical"]')
        if (link) {
          if (previousCanonicalRef.current.created) {
            link.remove()
          } else {
            link.setAttribute('href', previousCanonicalRef.current.href)
          }
        }
        previousCanonicalRef.current = null
      }
    }
  }, [canonical])

  return null
}
