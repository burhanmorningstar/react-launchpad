import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Chart } from './Chart'

import type { ChartDataPoint } from './types'

describe('Chart Component', () => {
  const sampleData: ChartDataPoint[] = [
    { label: 'Jan', value: 120 },
    { label: 'Feb', value: 340 },
    { label: 'Mar', value: 250 },
    { label: 'Apr', value: 480 },
  ]

  it('renders SVG chart with labels and accessible elements', () => {
    render(
      <Chart
        data={sampleData}
        config={{
          title: 'Monthly Revenue',
          ariaLabel: 'Monthly Revenue Bar Chart',
        }}
      />
    )

    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument()
    expect(screen.getByRole('graphics-document')).toBeInTheDocument()
    expect(screen.getByText('Jan')).toBeInTheDocument()
    expect(screen.getByText('Apr')).toBeInTheDocument()
  })

  it('provides an accessible data table alternative for screen readers', () => {
    render(
      <Chart
        data={sampleData}
        config={{
          title: 'Quarterly Sales',
          showTableAlternative: true,
        }}
      />
    )

    const toggleBtn = screen.getByRole('button', {
      name: /view as data table/i,
    })
    fireEvent.click(toggleBtn)

    // Table view becomes visible
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('480')).toBeInTheDocument()
  })

  it('formats values using custom locale formatter', () => {
    const formatCurrency = (val: number) => `$${val.toLocaleString('en-US')}`

    render(
      <Chart
        data={sampleData}
        config={{
          title: 'Revenue',
          formatValue: formatCurrency,
          showTableAlternative: true,
        }}
      />
    )

    // Toggle table
    fireEvent.click(screen.getByRole('button', { name: /view as data table/i }))
    expect(screen.getByText('$340')).toBeInTheDocument()
    expect(screen.getByText('$480')).toBeInTheDocument()
  })

  it('renders loading skeleton when isLoading is true', () => {
    render(
      <Chart
        data={[]}
        isLoading={true}
        config={{ title: 'Loading Statistics' }}
      />
    )

    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument()
  })

  it('renders error alert when error occurs', () => {
    render(
      <Chart
        data={[]}
        error="Network error fetching chart data"
        config={{ title: 'Traffic' }}
      />
    )

    expect(
      screen.getByText('Network error fetching chart data')
    ).toBeInTheDocument()
  })

  it('renders empty state when data is empty', () => {
    render(
      <Chart
        data={[]}
        emptyMessage="No statistics recorded for this period."
        config={{ title: 'Empty Period' }}
      />
    )

    expect(
      screen.getByText('No statistics recorded for this period.')
    ).toBeInTheDocument()
  })
})
