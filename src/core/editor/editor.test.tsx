import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { RichTextContent } from './RichTextContent'
import { RichTextEditor } from './RichTextEditor'
import { sanitizeHtml } from './sanitize'

describe('RichTextEditor & Sanitizer', () => {
  describe('sanitizeHtml', () => {
    it('strips dangerous scripts, onerror attributes and javascript URLs', () => {
      const malicious = `
        <p>Safe paragraph</p>
        <script>alert("hack")</script>
        <img src="valid.png" onerror="alert('xss')" />
        <a href="javascript:alert('pwned')">Click here</a>
        <iframe src="http://evil.com"></iframe>
      `

      const clean = sanitizeHtml(malicious)

      expect(clean).toContain('<p>Safe paragraph</p>')
      expect(clean).not.toContain('<script>')
      expect(clean).not.toContain('alert(')
      expect(clean).not.toContain('onerror')
      expect(clean).not.toContain('javascript:')
      expect(clean).not.toContain('<iframe')
    })

    it('preserves safe formatting tags, links, and bold text', () => {
      const safe =
        '<p>Hello <strong>World</strong>, visit <a href="https://example.com">Example</a></p>'
      const clean = sanitizeHtml(safe)

      expect(clean).toContain('<strong>World</strong>')
      expect(clean).toContain('href="https://example.com"')
    })
  })

  describe('RichTextContent', () => {
    it('renders sanitized HTML safely', () => {
      render(
        <RichTextContent content="<p>Welcome to <em>Launchpad</em></p><script>evil()</script>" />
      )

      expect(screen.getByText('Welcome to')).toBeInTheDocument()
      expect(screen.getByText('Launchpad')).toBeInTheDocument()
      expect(document.querySelector('script')).toBeNull()
    })
  })

  describe('RichTextEditor', () => {
    it('renders toolbar buttons and handles text formatting and input', () => {
      const onChange = vi.fn()
      render(
        <RichTextEditor
          value="<p>Initial text</p>"
          onChange={onChange}
          ariaLabel="Article content editor"
        />
      )

      expect(
        screen.getByLabelText('Article content editor')
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /italic/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /heading/i })
      ).toBeInTheDocument()

      const editorArea = screen.getByLabelText('Article content editor')
      fireEvent.input(editorArea, {
        target: { innerHTML: '<p>Updated content</p>' },
      })

      expect(onChange).toHaveBeenCalledWith('<p>Updated content</p>')
    })

    it('disables editing when readOnly is set', () => {
      render(
        <RichTextEditor
          value="<p>Read only content</p>"
          readOnly={true}
          onChange={() => {}}
        />
      )

      const editorArea = screen.getByRole('textbox')
      expect(editorArea).toHaveAttribute('contentEditable', 'false')
    })
  })
})
