import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CallToAction } from './CallToAction'
import { PageHeader } from './PageHeader'
import { SiteFooter } from './SiteFooter'

describe('PageHeader', () => {
  it('renders title with default h1 heading hierarchy', () => {
    render(<PageHeader title="Users Management" />)

    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Users Management',
    })
    expect(heading).toBeInTheDocument()
  })

  it('supports custom heading levels for detail and nested views', () => {
    render(<PageHeader title="Section Title" headingLevel={2} />)

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Section Title',
    })
    expect(heading).toBeInTheDocument()
  })

  it('renders description, breadcrumbs, and metadata slots', () => {
    render(
      <PageHeader
        breadcrumbs={<nav aria-label="Breadcrumb">Home / Users</nav>}
        title="Users"
        description="Manage organization members and permissions"
        meta={<span data-testid="status-badge">Active</span>}
      />
    )

    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Manage organization members and permissions')
    ).toBeInTheDocument()
    expect(screen.getByTestId('status-badge')).toBeInTheDocument()
  })

  it('renders action buttons in a responsive layout container without overflow', () => {
    render(
      <PageHeader
        title="Projects"
        actions={
          <>
            <button type="button">Export</button>
            <button type="button">Create Project</button>
          </>
        }
      />
    )

    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create Project' })
    ).toBeInTheDocument()
  })
})

describe('SiteFooter link attributes', () => {
  it('adds rel="noopener noreferrer" and target="_blank" to external links', () => {
    render(
      <SiteFooter
        columns={[
          {
            title: 'Resources',
            links: [
              { label: 'Documentation', href: '/docs' },
              {
                label: 'GitHub Repository',
                href: 'https://github.com/example/repo',
                external: true,
              },
            ],
          },
        ]}
      />
    )

    const internalLink = screen.getByRole('link', { name: 'Documentation' })
    expect(internalLink).toHaveAttribute('href', '/docs')
    expect(internalLink).not.toHaveAttribute('target')

    const externalLink = screen.getByRole('link', { name: 'GitHub Repository' })
    expect(externalLink).toHaveAttribute(
      'href',
      'https://github.com/example/repo'
    )
    expect(externalLink).toHaveAttribute('target', '_blank')
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

describe('CallToAction', () => {
  it('renders long descriptions and titles with proper heading hierarchy', () => {
    const longDesc =
      'Experience our enterprise-ready frontend application launchpad designed to accelerate development while ensuring peak accessibility, performance, and internationalization standards.'

    render(
      <CallToAction
        title="Ready to transform your development workflow today?"
        description={longDesc}
        actions={<button type="button">Get Started Now</button>}
      />
    )

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Ready to transform your development workflow today?',
      })
    ).toBeInTheDocument()
    expect(screen.getByText(longDesc)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Get Started Now' })
    ).toBeInTheDocument()
  })
})
