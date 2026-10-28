import * as React from 'react'

import { Bold, Heading, Italic, Link, List } from 'lucide-react'

import { Button } from '@/core/ui/components/button'

import { sanitizeHtml } from './sanitize'

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  ariaLabel?: string
  readOnly?: boolean
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  ariaLabel = 'Rich text editor',
  readOnly = false,
  className = '',
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)

  // Sync value to editor element if different
  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const executeCommand = (command: string, arg?: string) => {
    if (readOnly) return
    document.execCommand(command, false, arg)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML)
  }

  return (
    <div
      className={`rounded-md border border-input bg-background shadow-xs ${className}`}
    >
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 border-b border-border p-1 bg-muted/40">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            aria-label="Bold"
            onClick={() => executeCommand('bold')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            aria-label="Italic"
            onClick={() => executeCommand('italic')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            aria-label="Heading"
            onClick={() => executeCommand('formatBlock', '<h3>')}
          >
            <Heading className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            aria-label="Bullet list"
            onClick={() => executeCommand('insertUnorderedList')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            aria-label="Insert link"
            onClick={() => {
              const url = window.prompt('Enter link URL:')
              if (url) {
                const safeUrl = sanitizeHtml(`<a href="${url}"></a>`)
                if (safeUrl.includes('href=')) {
                  executeCommand('createLink', url)
                }
              }
            }}
          >
            <Link className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div
        ref={editorRef}
        role="textbox"
        aria-label={ariaLabel}
        aria-multiline="true"
        aria-readonly={readOnly}
        contentEditable={!readOnly}
        onInput={handleInput}
        className="min-h-[140px] p-3 text-sm focus-visible:outline-hidden prose prose-sm max-w-none dark:prose-invert"
      />
    </div>
  )
}
