import { Chart } from './Chart'

import type { Meta, StoryObj } from '@storybook/react-vite'

const revenueData = [
  { label: 'Q1 2025', value: 45000 },
  { label: 'Q2 2025', value: 68000 },
  { label: 'Q3 2025', value: 89000 },
  { label: 'Q4 2025', value: 124000 },
  { label: 'Q1 2026', value: 156000 },
]

const meta: Meta = {
  title: 'Core/Charts/Chart',
  component: Chart,
  decorators: [
    (Story) => (
      <div className="p-6 max-w-2xl mx-auto">
        <Story />
      </div>
    ),
  ],
}

export default meta

export const DefaultBarChart: StoryObj = {
  render: () => (
    <Chart
      data={revenueData}
      config={{
        title: 'Quarterly Revenue Growth',
        description:
          'Revenue trajectory with accessible data table alternative',
        formatValue: (v) => `$${v.toLocaleString('en-US')}`,
        showTableAlternative: true,
      }}
    />
  ),
}

export const LoadingState: StoryObj = {
  render: () => (
    <Chart
      data={[]}
      isLoading={true}
      config={{ title: 'Real-time Server Analytics' }}
    />
  ),
}

export const EmptyState: StoryObj = {
  render: () => (
    <Chart
      data={[]}
      emptyMessage="No traffic records found for selected filter period."
      config={{ title: 'User Conversion Funnel' }}
    />
  ),
}
