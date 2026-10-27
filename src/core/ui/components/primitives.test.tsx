import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Button } from './button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './dialog'
import { Progress } from './progress'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from './sheet'
import { Slider } from './slider'

afterEach(() => vi.unstubAllGlobals())

describe('Button contract', () => {
  it('composes a link without adding extra children to Radix Slot', () => {
    render(
      <Button asChild>
        <a href="/details">Read details</a>
      </Button>
    )
    expect(screen.getByRole('link', { name: 'Read details' })).toHaveAttribute(
      'href',
      '/details'
    )
  })

  it('keeps a loading button named, busy and inactive', async () => {
    let actions = 0
    render(
      <Button loading onClick={() => actions++}>
        Save changes
      </Button>
    )
    const button = screen.getByRole('button', { name: 'Save changes' })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(actions).toBe(0)
  })

  it('blocks pointer and keyboard activation on a disabled slotted link', async () => {
    let actions = 0
    render(
      <Button asChild loading>
        <a href="/details" onClick={() => actions++}>
          Read details
        </a>
      </Button>
    )
    const link = screen.getByRole('link', { name: 'Read details' })
    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAttribute('aria-busy', 'true')
    fireEvent.click(link)
    fireEvent.keyDown(link, { key: 'Enter' })
    expect(actions).toBe(0)
  })

  it('preserves an accessible name for icon-only controls', () => {
    render(
      <Button size="icon" aria-label="Open settings">
        <svg aria-hidden="true" />
      </Button>
    )
    expect(screen.getByRole('button', { name: 'Open settings' })).toBeVisible()
  })

  it('prevents activation when explicitly disabled', async () => {
    const action = vi.fn()
    render(
      <Button disabled onClick={action}>
        Publish
      </Button>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }))
    expect(action).not.toHaveBeenCalled()
  })
})

it('exposes the displayed progress value to assistive technology', () => {
  render(<Progress value={67} aria-label="Import progress" />)
  expect(
    screen.getByRole('progressbar', { name: 'Import progress' })
  ).toHaveAttribute('aria-valuenow', '67')
})

it('keeps visual progress consistent with a custom maximum', () => {
  const { container, rerender } = render(
    <Progress value={100} max={200} aria-label="Tasks" />
  )
  expect(screen.getByRole('progressbar', { name: 'Tasks' })).toHaveAttribute(
    'aria-valuemax',
    '200'
  )
  expect(
    container.querySelector('[data-slot="progress-indicator"]')
  ).toHaveStyle({ transform: 'translateX(-50%)' })
  rerender(<Progress value={1} max={1} aria-label="Tasks" />)
  expect(
    container.querySelector('[data-slot="progress-indicator"]')
  ).toHaveStyle({ transform: 'translateX(-0%)' })
})

it('keeps an explicitly tabbable slotted child inactive while loading', () => {
  render(
    <Button asChild loading>
      <a href="/details" tabIndex={0} aria-disabled={false} aria-busy={false}>
        Details
      </a>
    </Button>
  )
  const link = screen.getByRole('link', { name: 'Details' })
  expect(link).toHaveAttribute('tabindex', '-1')
  expect(link).toHaveAttribute('aria-disabled', 'true')
  expect(link).toHaveAttribute('aria-busy', 'true')
})

it('names a slider thumb and supports keyboard adjustment', async () => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
  render(<Slider aria-label="Volume" defaultValue={[40]} step={5} />)
  const slider = screen.getByRole('slider', { name: 'Volume' })
  slider.focus()
  await userEvent.keyboard('{ArrowRight}')
  expect(slider).toHaveAttribute('aria-valuenow', '45')
})

function ModalExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>Update your public name.</DialogDescription>
        <input aria-label="Public name" />
      </DialogContent>
    </Dialog>
  )
}

describe('composable modal primitives', () => {
  it('connects dialog title/description and restores focus after Escape', async () => {
    render(<ModalExample />)
    const trigger = screen.getByRole('button', { name: 'Open dialog' })
    await userEvent.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Edit profile' })
    expect(dialog).toHaveAccessibleDescription('Update your public name.')
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
    expect(trigger).toHaveFocus()
  })

  it('dismisses a dialog from its outside overlay', async () => {
    vi.stubGlobal('PointerEvent', MouseEvent)
    render(<ModalExample />)
    await userEvent.click(screen.getByRole('button', { name: 'Open dialog' }))
    fireEvent.pointerDown(
      document.querySelector('[data-slot="dialog-overlay"]')!,
      { button: 0, ctrlKey: false }
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
  })

  it('keeps sheet Escape and focus return behavior', async () => {
    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open panel</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Panel title</SheetTitle>
          <SheetDescription>Panel details.</SheetDescription>
        </SheetContent>
      </Sheet>
    )
    const trigger = screen.getByRole('button', { name: 'Open panel' })
    await userEvent.click(trigger)
    expect(
      screen.getByRole('dialog', { name: 'Panel title' })
    ).toHaveAccessibleDescription('Panel details.')
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
    expect(trigger).toHaveFocus()
  })
})
