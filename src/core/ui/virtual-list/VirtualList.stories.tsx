import { VirtualList } from './VirtualList'

import type { Meta, StoryObj } from '@storybook/react-vite'

interface BigDataRow {
  id: number
  title: string
  code: string
  status: string
}

const mockBigData: BigDataRow[] = Array.from({ length: 5000 }, (_, i) => ({
  id: i + 1,
  title: `Data Record #${i + 1}`,
  code: `SYS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  status: i % 3 === 0 ? 'Verified' : i % 3 === 1 ? 'Pending' : 'Archived',
}))

const meta: Meta = {
  title: 'Core/UI/VirtualList',
  decorators: [
    (Story) => (
      <div className="p-6 max-w-xl mx-auto space-y-4">
        <Story />
      </div>
    ),
  ],
}

export default meta

export const Default: StoryObj = {
  render: () => {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Rendering 5,000 items with smooth scrolling and keyboard support
          (Up/Down/PageUp/PageDown).
        </p>
        <VirtualList
          items={mockBigData}
          height={400}
          itemHeight={48}
          overscan={5}
          getItemKey={(item) => item.id}
          renderItem={(item) => (
            <div className="flex items-center justify-between px-4 py-2 border-b bg-card text-card-foreground hover:bg-muted/50 h-full">
              <span className="font-medium text-sm">{item.title}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {item.code}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-muted">
                {item.status}
              </span>
            </div>
          )}
        />
      </div>
    )
  },
}

export const Empty: StoryObj = {
  render: () => (
    <VirtualList
      items={[]}
      height={200}
      itemHeight={40}
      getItemKey={(item: string) => item}
      renderItem={() => null}
      emptyMessage="No log records found."
    />
  ),
}
