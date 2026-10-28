export interface ChartDataPoint {
  label: string
  value: number
  color?: string
  secondaryValue?: number
}

export type ChartType = 'bar' | 'line' | 'pie'

export interface ChartConfig {
  type?: ChartType
  title?: string
  description?: string
  formatValue?: (value: number) => string
  showLegend?: boolean
  showTableAlternative?: boolean
  ariaLabel?: string
  height?: number
}

export interface ChartProps {
  data: ChartDataPoint[]
  config?: ChartConfig
  isLoading?: boolean
  error?: Error | string | null
  emptyMessage?: string
  className?: string
}
