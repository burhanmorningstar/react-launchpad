import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CommandPalette, type CommandPaletteItem } from './CommandPalette'

describe('CommandPalette', () => {
  const sampleItems: CommandPaletteItem[] = [
    {
      id: 'dash',
      title: 'Go to Dashboard',
      group: 'Navigation',
      onSelect: vi.fn(),
    },
    {
      id: 'settings',
      title: 'Account Settings',
      group: 'Navigation',
      onSelect: vi.fn(),
    },
    {
      id: 'danger',
      title: 'Delete Project',
      group: 'Actions',
      disabled: true,
      onSelect: vi.fn(),
    },
  ]

  it('renders commands grouped with search input when open', () => {
    render(<CommandPalette open={true} items={sampleItems} />)

    expect(
      screen.getByPlaceholderText(/type a command or search/i)
    ).toBeInTheDocument()
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Account Settings')).toBeInTheDocument()
    expect(screen.getByText('Delete Project')).toBeInTheDocument()
  })

  it('executes onSelect callback when item is chosen and ignores disabled items', () => {
    render(<CommandPalette open={true} items={sampleItems} />)

    // Click active item
    fireEvent.click(screen.getByText('Go to Dashboard'))
    expect(sampleItems[0]?.onSelect).toHaveBeenCalled()

    // Disabled item should not trigger
    const disabledItem = screen
      .getByText('Delete Project')
      .closest('[data-slot="command-item"]')
    if (disabledItem) {
      fireEvent.click(disabledItem)
      expect(sampleItems[2]?.onSelect).not.toHaveBeenCalled()
    }
  })

  it('listens to global Cmd+K or Ctrl+K shortcut to toggle visibility', () => {
    const onOpenChange = vi.fn()
    render(
      <CommandPalette
        open={false}
        onOpenChange={onOpenChange}
        items={sampleItems}
        enableGlobalShortcut
      />
    )

    // Simulate Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(onOpenChange).toHaveBeenCalledWith(true)

    // Simulate Meta+K
    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })
})
