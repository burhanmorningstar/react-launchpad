import { userEvent, within } from 'storybook/test'

import { Button } from '@/core/ui/components/button'
import { Input } from '@/core/ui/components/input'
import { ThemeSwitcher } from '@/core/ui/components/theme-switcher'

import { ThemeProvider } from './ThemeProvider'
import { useTheme } from './useTheme'

import type { Meta, StoryObj } from '@storybook/react-vite'

function ThemeSample() {
  const { resolvedTheme } = useTheme()
  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">
              One theme, every surface.
            </h1>
            <p className="mt-2 text-muted-foreground">
              Current appearance: {resolvedTheme}
            </p>
          </div>
          <ThemeSwitcher />
        </header>
        <section className="space-y-5 rounded-xl border bg-card p-6 text-card-foreground shadow-md">
          <h2 className="text-xl font-semibold">Controls and focus</h2>
          <p className="text-muted-foreground">
            Local typography, shared color tokens, and a readable keyboard focus
            ring.
          </p>
          <Input label="Project name" placeholder="A name with room to grow" />
          <div className="flex flex-wrap gap-3">
            <Button>Primary action</Button>
            <Button variant="secondary">Secondary action</Button>
            <Button variant="outline">Outline action</Button>
            <Button disabled>Unavailable</Button>
          </div>
        </section>
        <section
          aria-label="Semantic status colors"
          className="grid gap-3 sm:grid-cols-2"
        >
          <p className="rounded-lg bg-success p-4 text-success-foreground">
            Success: Changes saved.
          </p>
          <p className="rounded-lg bg-warning p-4 text-warning-foreground">
            Warning: Review before continuing.
          </p>
          <p className="rounded-lg bg-destructive p-4 text-destructive-foreground">
            Error: Check the highlighted field.
          </p>
          <p className="rounded-lg bg-info p-4 text-info-foreground">
            Info: Your draft stays local.
          </p>
        </section>
        <p className="text-muted-foreground">
          Long text:
          this-is-an-intentionally-long-project-name-that-should-wrap-instead-of-pushing-the-page-outside-the-viewport.
        </p>
      </div>
    </main>
  )
}

const meta = {
  title: 'Foundation/Theme',
  component: ThemeSample,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ThemeSample>

export default meta
type Story = StoryObj<typeof meta>
export const Light: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Set theme to Light' })
    )
  },
}
export const Dark: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Set theme to Dark' })
    )
  },
}
export const System: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Set theme to System' })
    )
  },
}
