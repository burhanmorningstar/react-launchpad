import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ThemeSwitcher, ThemeToggle } from '@/core/ui/components/theme-switcher'

import { ThemeProvider } from './ThemeProvider'
import { useTheme } from './useTheme'

let media: MediaQueryList
let listeners: Set<(event: MediaQueryListEvent) => void>

beforeEach(() => {
  localStorage.clear()
  document.documentElement.className = ''
  listeners = new Set()
  media = {
    matches: true,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: (listener) => {
      if (listener) listeners.add(listener)
    },
    removeListener: (listener) => {
      if (listener) listeners.delete(listener)
    },
    addEventListener: (_type: string, listener: EventListener) =>
      listeners.add(listener as (event: MediaQueryListEvent) => void),
    removeEventListener: (_type: string, listener: EventListener) =>
      listeners.delete(listener as (event: MediaQueryListEvent) => void),
    dispatchEvent: () => true,
  } as MediaQueryList
  vi.stubGlobal('matchMedia', () => media)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function Controls() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  return (
    <>
      <output>
        {theme}/{resolvedTheme}
      </output>
      <button onClick={() => setTheme('light')}>Choose light</button>
      <button onClick={() => setTheme('dark')}>Choose dark</button>
      <button onClick={() => setTheme('system')}>Use system</button>
    </>
  )
}

function mount() {
  return render(
    <ThemeProvider>
      <Controls />
    </ThemeProvider>
  )
}

describe('single theme owner', () => {
  it('keeps both switcher and toggle on the same theme selection', async () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
        <ThemeToggle />
      </ThemeProvider>
    )
    fireEvent.click(
      await screen.findByRole('button', { name: 'Switch to light mode' })
    )
    expect(
      screen.getByRole('button', { name: 'Set theme to Light' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement).toHaveClass('light')
    fireEvent.click(screen.getByRole('button', { name: 'Set theme to System' }))
    expect(
      await screen.findByRole('button', { name: 'Switch to light mode' })
    ).toBeVisible()
    expect(document.documentElement).toHaveClass('dark')
  })

  it('supports the labelled theme dropdown', async () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher variant="dropdown" />
      </ThemeProvider>
    )
    fireEvent.change(screen.getByRole('combobox', { name: 'Color theme' }), {
      target: { value: 'light' },
    })
    expect(document.documentElement).toHaveClass('light')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('follows the system and responds to a system change', async () => {
    mount()
    expect(await screen.findByText('system/dark')).toBeVisible()
    expect(document.documentElement).toHaveClass('dark')
    act(() => {
      Object.defineProperty(media, 'matches', {
        value: false,
        configurable: true,
      })
      for (const listener of listeners)
        listener({ matches: false } as MediaQueryListEvent)
    })
    expect(await screen.findByText('system/light')).toBeVisible()
    expect(document.documentElement).toHaveClass('light')
  })

  it('remembers an explicit selection and restores it on remount', async () => {
    const view = mount()
    fireEvent.click(screen.getByRole('button', { name: 'Choose light' }))
    expect(await screen.findByText('light/light')).toBeVisible()
    expect(localStorage.getItem('theme')).toBe('light')
    view.unmount()
    mount()
    expect(await screen.findByText('light/light')).toBeVisible()
    expect(document.documentElement).toHaveClass('light')
  })

  it('recovers an invalid saved theme to the system', async () => {
    localStorage.setItem('theme', 'invalid-value')
    mount()
    expect(await screen.findByText('system/dark')).toBeVisible()
    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement).not.toHaveClass('invalid-value')
  })

  it('migrates the previous saved preference without keeping a second store', async () => {
    localStorage.setItem(
      'ui-storage',
      JSON.stringify({ state: { theme: 'light' }, version: 0 })
    )
    mount()
    expect(await screen.findByText('light/light')).toBeVisible()
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('works when storage access is denied and still permits an in-memory choice', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Denied', 'SecurityError')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Denied', 'SecurityError')
    })
    mount()
    expect(await screen.findByText('system/dark')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Choose light' }))
    expect(await screen.findByText('light/light')).toBeVisible()
    expect(document.documentElement).toHaveClass('light')
  })

  it('recovers invalid read-only storage and remains interactive', async () => {
    localStorage.setItem('theme', 'invalid-value')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError')
    })
    mount()
    expect(await screen.findByText('system/dark')).toBeVisible()
    expect(document.documentElement).toHaveClass('dark')
    fireEvent.click(screen.getByRole('button', { name: 'Choose light' }))
    expect(await screen.findByText('light/light')).toBeVisible()
    expect(document.documentElement).toHaveClass('light')
  })

  it('handles valid and invalid cross-tab preference changes', async () => {
    mount()
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'theme', newValue: 'light' })
      )
    })
    expect(await screen.findByText('light/light')).toBeVisible()
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'theme', newValue: 'invalid-value' })
      )
    })
    await waitFor(() => expect(document.documentElement).toHaveClass('dark'))
    expect(await screen.findByText('system/dark')).toBeVisible()
  })

  it('follows system changes during recovery from invalid read-only storage', async () => {
    localStorage.setItem('theme', 'invalid-value')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError')
    })
    mount()
    expect(document.documentElement).toHaveClass('dark')
    act(() => {
      Object.defineProperty(media, 'matches', {
        value: false,
        configurable: true,
      })
      for (const listener of listeners)
        listener({ matches: false } as MediaQueryListEvent)
    })
    expect(await screen.findByText('system/light')).toBeVisible()
    expect(document.documentElement).toHaveClass('light')
  })
})
