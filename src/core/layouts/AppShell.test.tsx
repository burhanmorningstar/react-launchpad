import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AppShell } from './AppShell'

import type { NavigationItem } from './types'

let desktop = true
const listeners = new Set<() => void>()
beforeEach(() => {
  desktop = true
  listeners.clear()
  vi.stubGlobal('matchMedia', () => ({
    matches: desktop,
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  }))
})
afterEach(() => vi.unstubAllGlobals())
const nav: NavigationItem[] = [
  { id: 'home', label: 'Overview', href: '/workspace' },
  {
    id: 'manage',
    label: 'Management',
    children: [
      { id: 'users', label: 'Users', href: '/workspace/users' },
      { id: 'settings', label: 'Settings', href: '/workspace/settings' },
    ],
  },
  {
    id: 'disabled',
    label: 'Unavailable',
    href: '/unavailable',
    disabled: true,
  },
]
function Fixture() {
  return (
    <AppShell
      nav={nav}
      logo={<a href="/">Custom workspace</a>}
      headerActions={<button>Help</button>}
      userMenu={<button>Account</button>}
      footer={<p>Workspace footer</p>}
    >
      <Routes>
        <Route path="*" element={<h1>Workspace page</h1>} />
      </Routes>
    </AppShell>
  )
}
function open(path = '/workspace/users/42') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Fixture />
    </MemoryRouter>
  )
}
async function resize(value: boolean) {
  await act(async () => {
    desktop = value
    listeners.forEach((fn) => fn())
  })
}

describe('AppShell', () => {
  it('selects the most specific route, expands its nested group and preserves slots', () => {
    open()
    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: 'Overview' })).not.toHaveAttribute(
      'aria-current'
    )
    expect(screen.getByRole('button', { name: 'Management' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    expect(screen.getByRole('button', { name: 'Account' })).toBeVisible()
    expect(screen.getByText('Workspace footer')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Unavailable' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('toggles a nested group and desktop collapse independently', async () => {
    open()
    await userEvent.click(screen.getByRole('button', { name: 'Management' }))
    expect(
      screen.queryByRole('link', { name: 'Users' })
    ).not.toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'Collapse sidebar' })
    )
    expect(
      screen.getByRole('button', { name: 'Expand sidebar' })
    ).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('complementary')).toHaveAttribute(
      'data-collapsed',
      'true'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Management' }))
    expect(screen.getByRole('link', { name: 'Users' })).toBeVisible()
  })

  it('starts closed on mobile and restores focus after Escape', async () => {
    desktop = false
    open()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    const trigger = screen.getByRole('button', { name: 'Open navigation' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByRole('dialog', { name: 'Navigation' })
    ).toHaveAccessibleDescription('Choose a page.')
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
    expect(trigger).toHaveFocus()
  })

  it('closes mobile navigation on route changes and keeps desktop preference across breakpoints', async () => {
    open()
    await userEvent.click(
      screen.getByRole('button', { name: 'Collapse sidebar' })
    )
    await resize(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'Open navigation' })
    )
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('link', { name: 'Settings' })
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Open navigation' })
    )
    await resize(true)
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toHaveFocus()
    await resize(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await resize(true)
    expect(screen.getByRole('complementary')).toHaveAttribute(
      'data-collapsed',
      'true'
    )
  })

  it('moves the skip link to the main landmark', async () => {
    open()
    await userEvent.click(screen.getByRole('link', { name: 'Skip to content' }))
    expect(screen.getByRole('main')).toHaveFocus()
  })

  it('removes collapsed footer actions from the keyboard path', async () => {
    render(
      <MemoryRouter>
        <AppShell
          nav={nav}
          logo="Workspace"
          footer={<button>Footer action</button>}
        >
          Content
        </AppShell>
      </MemoryRouter>
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Collapse sidebar' })
    )
    expect(
      screen.queryByRole('button', { name: 'Footer action' })
    ).not.toBeInTheDocument()
  })

  it('keeps state private to each shell instance', async () => {
    render(
      <MemoryRouter>
        <Fixture />
        <Fixture />
      </MemoryRouter>
    )
    const sidebars = screen.getAllByRole('complementary')
    await userEvent.click(
      screen.getAllByRole('button', { name: 'Collapse sidebar' })[0]
    )
    expect(sidebars[0]).toHaveAttribute('data-collapsed', 'true')
    expect(sidebars[1]).toHaveAttribute('data-collapsed', 'false')
  })

  it('ranks active route paths without counting query strings', () => {
    render(
      <MemoryRouter initialEntries={['/workspace/users/42']}>
        <AppShell
          logo="Workspace"
          nav={[
            {
              id: 'overview',
              label: 'Overview',
              href: '/workspace?filter=a-very-long-filter-value',
            },
            { id: 'users', label: 'Users', href: '/workspace/users' },
          ]}
        >
          Content
        </AppShell>
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: 'Overview' })).not.toHaveAttribute(
      'aria-current'
    )
  })

  it('keeps focus on a visible control when a focused desktop sidebar disappears', async () => {
    open()
    screen.getByRole('link', { name: 'Users' }).focus()
    await resize(false)
    expect(
      screen.getByRole('button', { name: 'Open navigation' })
    ).toHaveFocus()
  })
})
