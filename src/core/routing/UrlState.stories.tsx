import { useState } from 'react'

import { MemoryRouter } from 'react-router'

import { useClipboard, useDebouncedValue, useDisclosure } from '@/core/hooks'
import { queryParsers, useUrlState } from '@/core/routing'
import { Button } from '@/core/ui/components/button'
import { Input } from '@/core/ui/components/input'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Core/Routing/UrlState',
  decorators: [
    (Story) => (
      <MemoryRouter
        initialEntries={['/demo?q=antigravity&page=1&status=active']}
      >
        <div className="p-6 max-w-xl mx-auto space-y-6">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
}

export default meta

const filterSchema = {
  q: queryParsers.string(''),
  page: queryParsers.number({ defaultValue: 1, min: 1, max: 100 }),
  status: queryParsers.enum(['all', 'active', 'archived'] as const, 'all'),
}

function UrlFilterDemo() {
  const { state, setParams, resetParams } = useUrlState(filterSchema, {
    resetOnUpdate: {
      triggerKeys: ['q', 'status'],
      resetKeys: ['page'],
    },
  })

  const [searchInput, setSearchInput] = useState(state.q)
  const debouncedSearch = useDebouncedValue(searchInput, 300)

  const { copied, copy } = useClipboard({ timeout: 2000 })
  const disclosure = useDisclosure(false)

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-card text-card-foreground">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Type-safe URL State Demo</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            copy(window.location.search || `?q=${state.q}&page=${state.page}`)
          }
        >
          {copied ? 'Copied URL!' : 'Copy Share URL'}
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Search query (debounced)</label>
        <Input
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value)
            setParams({ q: e.target.value })
          }}
          placeholder="Type to filter..."
        />
        <p className="text-xs text-muted-foreground">
          Debounced value: <span className="font-mono">{debouncedSearch}</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        {(['all', 'active', 'archived'] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={state.status === s ? 'default' : 'outline'}
            onClick={() => setParams({ status: s })}
          >
            {s}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={state.page <= 1}
            onClick={() => setParams((prev) => ({ page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <span className="text-sm font-medium">Page {state.page}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setParams((prev) => ({ page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={() => resetParams()}>
          Reset Filters
        </Button>
      </div>

      <div className="pt-2">
        <Button variant="secondary" size="sm" onClick={disclosure.toggle}>
          {disclosure.isOpen ? 'Hide State JSON' : 'Show State JSON'}
        </Button>
        {disclosure.isOpen && (
          <pre className="mt-2 p-3 bg-muted rounded text-xs font-mono overflow-auto">
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

export const Default: StoryObj = {
  render: () => <UrlFilterDemo />,
}
