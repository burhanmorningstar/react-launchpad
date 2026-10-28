import { LayoutDashboardIcon, SettingsIcon, UsersIcon } from 'lucide-react'
import { Link, MemoryRouter, useLocation } from 'react-router'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { ThemeProvider } from '@/core/theme/ThemeProvider'
import { Button } from '@/core/ui/components/button'
import { ThemeToggle } from '@/core/ui/components/theme-switcher'

import { AppShell } from './AppShell'

import type { NavigationItem } from './types'
import type { Meta, StoryObj } from '@storybook/react-vite'

const nav: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/workspace',
    icon: <LayoutDashboardIcon />,
  },
  {
    id: 'management',
    label: 'Management',
    children: [
      {
        id: 'users',
        label: 'Users',
        href: '/workspace/users',
        icon: <UsersIcon />,
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/workspace/settings',
        icon: <SettingsIcon />,
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports (unavailable)',
    href: '/reports',
    disabled: true,
  },
]
const longNav: NavigationItem[] = [
  ...nav,
  {
    id: 'long',
    label:
      'A very long navigation group name that should wrap without widening the shell',
    children: [
      {
        id: 'long-child',
        label:
          'VeryLongUnbrokenNavigationLabelForTestingResponsiveWrappingAndKeyboardAccess',
        href: '/workspace/long',
      },
      {
        id: 'level-2',
        label: 'Nested reporting',
        children: [
          {
            id: 'level-3',
            label: 'Quarterly analysis',
            href: '/workspace/quarterly',
          },
        ],
      },
    ],
  },
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `extra-${i}`,
    label: `Additional workspace section ${i + 1}`,
    href: `/workspace/section-${i}`,
  })),
]

function Sample({
  compact = false,
  long = false,
  alternate = false,
}: {
  compact?: boolean
  long?: boolean
  alternate?: boolean
}) {
  const location = useLocation()
  const brand = alternate ? 'Canopy Operations' : 'Orbit Laboratory'
  return (
    <AppShell
      nav={long ? longNav : nav}
      defaultDesktopCollapsed={compact}
      logo={
        <Link
          to="/workspace"
          className="flex min-w-0 items-center gap-3 font-semibold"
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"
            aria-hidden="true"
          >
            {brand.charAt(0)}
          </span>
          <span className="truncate">{brand}</span>
        </Link>
      }
      compactLogo={
        <Link to="/workspace" aria-label={brand} className="font-bold">
          {brand.charAt(0)}
        </Link>
      }
      title={alternate ? 'Operations workspace' : 'Team workspace'}
      headerActions={<ThemeToggle />}
      userMenu={
        <Button size="icon" variant="outline" aria-label="Account">
          <span aria-hidden="true">AL</span>
        </Button>
      }
      footer={
        <p className="text-xs text-muted-foreground">
          {brand} · Local workspace
        </p>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Workspace / People</p>
          <h1 className="text-2xl font-bold">People and permissions</h1>
          <p className="break-words text-muted-foreground">
            Current route: {location.pathname}
          </p>
        </div>
        <section
          aria-labelledby="members-title"
          className="rounded-lg border bg-card p-6 text-card-foreground"
        >
          <h2 id="members-title" className="mb-4 text-lg font-semibold">
            Team members
          </h2>
          <ul className="space-y-4">
            {['Ada Lovelace', 'Grace Hopper', 'Margaret Hamilton'].map(
              (name) => (
                <li key={name} className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium"
                    aria-hidden="true"
                  >
                    {name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </span>
                  <span className="min-w-0 break-words">{name}</span>
                </li>
              )
            )}
          </ul>
        </section>
        <p className="text-sm text-muted-foreground">
          Navigation and account content are supplied through slots. This
          example makes no API requests.
        </p>
        <Button disabled>Invite member (unavailable)</Button>
      </div>
    </AppShell>
  )
}

const meta = {
  title: 'Layouts/AppShell',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <MemoryRouter initialEntries={['/workspace/users/42']}>
          <Story />
        </MemoryRouter>
      </ThemeProvider>
    ),
  ],
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Workspace: Story = {
  render: () => <Sample />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    const collapse = c.queryByRole('button', { name: 'Collapse sidebar' })
    if (collapse) {
      await userEvent.click(collapse)
      await expect(
        c.getByRole('button', { name: 'Expand sidebar' })
      ).toHaveAttribute('aria-expanded', 'false')
      await userEvent.click(c.getByRole('button', { name: 'Expand sidebar' }))
      await waitFor(() =>
        expect(c.getByRole('link', { name: 'Users' })).toHaveAttribute(
          'aria-current',
          'page'
        )
      )
    }
  },
}
export const Collapsed: Story = { render: () => <Sample compact /> }
export const AnotherProduct: Story = { render: () => <Sample alternate /> }
export const LongNavigation: Story = { render: () => <Sample long /> }
