import { render } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'

import { PageMeta } from './PageMeta'

describe('PageMeta', () => {
  beforeEach(() => {
    document.title = 'Default App'
    const existingDesc = document.querySelector('meta[name="description"]')
    if (existingDesc) existingDesc.remove()
    const existingCanonical = document.querySelector('link[rel="canonical"]')
    if (existingCanonical) existingCanonical.remove()
  })

  it('updates document title and restores previous title on unmount', () => {
    document.title = 'Initial Title'

    const { unmount } = render(<PageMeta title="Dashboard Overview" />)
    expect(document.title).toBe('Dashboard Overview')

    unmount()
    expect(document.title).toBe('Initial Title')
  })

  it('updates meta description and restores previous or removes on unmount', () => {
    const { unmount } = render(
      <PageMeta description="Comprehensive analytics and metrics" />
    )

    const meta = document.querySelector('meta[name="description"]')
    expect(meta).not.toBeNull()
    expect(meta?.getAttribute('content')).toBe(
      'Comprehensive analytics and metrics'
    )

    unmount()
    expect(document.querySelector('meta[name="description"]')).toBeNull()
  })

  it('preserves existing meta description on unmount if one existed prior to mount', () => {
    const priorMeta = document.createElement('meta')
    priorMeta.setAttribute('name', 'description')
    priorMeta.setAttribute('content', 'Original description')
    document.head.appendChild(priorMeta)

    const { unmount } = render(<PageMeta description="New page description" />)
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute('content')
    ).toBe('New page description')

    unmount()
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute('content')
    ).toBe('Original description')
  })

  it('updates canonical link and cleans up on unmount', () => {
    const { unmount } = render(
      <PageMeta canonical="https://example.com/pricing" />
    )

    const canonical = document.querySelector('link[rel="canonical"]')
    expect(canonical).not.toBeNull()
    expect(canonical?.getAttribute('href')).toBe('https://example.com/pricing')

    unmount()
    expect(document.querySelector('link[rel="canonical"]')).toBeNull()
  })

  it('reacts dynamically to prop changes', () => {
    const { rerender } = render(
      <PageMeta title="Step 1" description="First step" />
    )
    expect(document.title).toBe('Step 1')
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute('content')
    ).toBe('First step')

    rerender(<PageMeta title="Step 2" description="Second step" />)
    expect(document.title).toBe('Step 2')
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute('content')
    ).toBe('Second step')
  })
})
