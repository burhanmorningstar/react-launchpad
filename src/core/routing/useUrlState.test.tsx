import { useEffect, useState } from 'react'

import { act, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { queryParsers, type QuerySchema } from './queryState'
import { useUrlState, type UseUrlStateResult } from './useUrlState'

describe('useUrlState', () => {
  const schema: QuerySchema = {
    q: queryParsers.string(''),
    page: queryParsers.number({ defaultValue: 1, min: 1, max: 100 }),
    status: queryParsers.enum(['all', 'active', 'archived'] as const, 'all'),
  }

  function renderWithHook(
    initialUrl = '/list',
    options?: Parameters<typeof useUrlState<typeof schema>>[1]
  ) {
    let capturedHook: UseUrlStateResult<typeof schema> | null = null

    function TestHarness() {
      const hook = useUrlState(schema, options)

      useEffect(() => {
        capturedHook = hook
      }, [hook])

      return (
        <div>
          <span data-testid="q">{hook.state.q}</span>
          <span data-testid="page">{hook.state.page}</span>
          <span data-testid="status">{hook.state.status}</span>
        </div>
      )
    }

    const router = createMemoryRouter(
      [
        {
          path: '/list',
          element: <TestHarness />,
        },
      ],
      { initialEntries: [initialUrl] }
    )

    render(<RouterProvider router={router} />)

    return {
      getHook: () => capturedHook,
      router,
    }
  }

  it('initializes from URL query and normalizes invalid values', async () => {
    renderWithHook('/list?q=shoes&page=invalid&status=archived')

    expect(screen.getByTestId('q').textContent).toBe('shoes')
    expect(screen.getByTestId('page').textContent).toBe('1') // Normalized from invalid
    expect(screen.getByTestId('status').textContent).toBe('archived')
  })

  it('updates state and modifies the URL search string', async () => {
    const { getHook, router } = renderWithHook('/list')

    expect(screen.getByTestId('q').textContent).toBe('')

    act(() => {
      getHook()?.setParams({ q: 'react', page: 2 })
    })

    expect(screen.getByTestId('q').textContent).toBe('react')
    expect(screen.getByTestId('page').textContent).toBe('2')
    expect(router.state.location.search).toContain('q=react')
    expect(router.state.location.search).toContain('page=2')
  })

  it('resets page to 1 automatically when watched filter changes via resetOnUpdate', async () => {
    const { getHook } = renderWithHook('/list?page=5', {
      resetOnUpdate: {
        triggerKeys: ['q', 'status'],
        resetKeys: ['page'],
      },
    })

    expect(screen.getByTestId('page').textContent).toBe('5')

    act(() => {
      getHook()?.setParams({ q: 'new query' })
    })

    expect(screen.getByTestId('q').textContent).toBe('new query')
    expect(screen.getByTestId('page').textContent).toBe('1') // Page was automatically reset to 1
  })

  it('preserves unknown query keys from other components or tabs', async () => {
    const { getHook, router } = renderWithHook(
      '/list?tab=settings&theme=dark&page=3'
    )

    act(() => {
      getHook()?.setParams({ page: 4 })
    })

    expect(router.state.location.search).toContain('tab=settings')
    expect(router.state.location.search).toContain('theme=dark')
    expect(router.state.location.search).toContain('page=4')
  })

  it('supports functional updater and resetParams', async () => {
    const { getHook } = renderWithHook('/list?q=initial&page=2')

    act(() => {
      getHook()?.setParams((prev) => ({ page: prev.page + 1 }))
    })
    expect(screen.getByTestId('page').textContent).toBe('3')

    act(() => {
      getHook()?.resetParams(['q'])
    })
    expect(screen.getByTestId('q').textContent).toBe('')
    expect(screen.getByTestId('page').textContent).toBe('3')

    act(() => {
      getHook()?.resetParams() // Reset all
    })
    expect(screen.getByTestId('page').textContent).toBe('1')
  })

  it('does not cause infinite effect loops', async () => {
    let effectTriggerCount = 0

    function LoopTester() {
      const { state, setParams } = useUrlState(schema)
      const [, setDummy] = useState(0)

      useEffect(() => {
        effectTriggerCount++
        if (effectTriggerCount > 5) {
          throw new Error('Infinite effect loop detected!')
        }
      }, [state])

      return (
        <button
          onClick={() => {
            setParams({ q: 'test' })
            setDummy((d) => d + 1)
          }}
        >
          Click
        </button>
      )
    }

    const router = createMemoryRouter(
      [{ path: '/test', element: <LoopTester /> }],
      { initialEntries: ['/test'] }
    )

    render(<RouterProvider router={router} />)
    expect(effectTriggerCount).toBe(1) // Initial mount only
  })

  it('supports browser back/forward history navigation', async () => {
    const { getHook, router } = renderWithHook('/list?page=1')

    act(() => {
      getHook()?.setParams({ page: 2 }, { navigateMode: 'push' })
    })
    expect(screen.getByTestId('page').textContent).toBe('2')

    act(() => {
      router.navigate(-1)
    })
    expect(screen.getByTestId('page').textContent).toBe('1')
  })
})
