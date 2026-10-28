import * as React from 'react'

import { sanitizeHtml } from './sanitize'

export interface RichTextContentProps {
  content: string
  className?: string
}

export function RichTextContent({
  content,
  className = '',
}: RichTextContentProps) {
  const sanitized = React.useMemo(() => sanitizeHtml(content), [content])

  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
