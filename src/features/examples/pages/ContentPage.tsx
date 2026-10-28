import * as React from 'react'

import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/core/blocks'
import { Chart } from '@/core/charts'
import { RichTextContent, RichTextEditor } from '@/core/editor'
import { Button } from '@/core/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/ui/components/card'
import { VirtualList } from '@/core/ui/virtual-list'
import { demoData } from '@/examples/adapters/demoData'

interface VirtualRecord {
  id: string
  code: string
  label: string
  category: string
}

const VIRTUAL_RECORDS: VirtualRecord[] = Array.from(
  { length: 1000 },
  (_, i) => ({
    id: `rec-${i + 1}`,
    code: `LOG-${String(i + 1).padStart(4, '0')}`,
    label: `System event payload #${i + 1} processed by background scheduler`,
    category: i % 3 === 0 ? 'security' : i % 2 === 0 ? 'network' : 'system',
  })
)

export default function ContentPage() {
  const { t } = useTranslation('examples')
  const [editorValue, setEditorValue] = React.useState(
    '<h3>Launchpad Editorial</h3><p>Welcome to the <strong>Rich Content</strong> showcase! This content is safely processed through our custom HTML sanitizer.</p><ul><li>Zero external script vulnerabilities</li><li>Preserved semantics and links</li></ul>'
  )

  const [chartLoading, setChartLoading] = React.useState(false)
  const [chartEmpty, setChartEmpty] = React.useState(false)

  const chartData = React.useMemo(() => {
    return chartEmpty ? [] : demoData.getChartData()
  }, [chartEmpty])

  return (
    <div className="space-y-8">
      <PageHeader
        title={t(
          'content.title',
          'Rich Content, Visualization & Virtualization'
        )}
        description={t(
          'content.description',
          'Demonstrates sanitized rich text editing, interactive SVG charts and high-performance list virtualization.'
        )}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Editor Showcase */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>
              {t(
                'content.editorHeading',
                'Rich Text Editor & Sanitized Preview'
              )}
            </CardTitle>
            <CardDescription>
              Controlled WYSIWYG editor with strict DOMParser sanitization
              boundary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <RichTextEditor
              value={editorValue}
              onChange={setEditorValue}
              ariaLabel="Article Body Editor"
            />
            <div className="rounded-md border p-3 bg-muted/20 flex-1">
              <span className="text-xs font-semibold uppercase text-muted-foreground block mb-2">
                Live Sanitized Render
              </span>
              <RichTextContent content={editorValue} />
            </div>
          </CardContent>
        </Card>

        {/* Chart Showcase */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                {t('content.chartHeading', 'Revenue Analytics Chart')}
              </CardTitle>
              <CardDescription>
                Accessible SVG data visualization with toggleable states.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChartEmpty((prev) => !prev)}
              >
                {t('content.toggleData', 'Toggle Empty State')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChartLoading((prev) => !prev)}
              >
                {t('content.toggleLoading', 'Toggle Loading State')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <Chart
              data={chartData}
              config={{
                title: 'Monthly Recurring Revenue ($USD)',
                description: 'First half 2026 performance',
                height: 280,
              }}
              isLoading={chartLoading}
              emptyMessage="No revenue records available for this period."
            />
          </CardContent>
        </Card>
      </div>

      {/* Virtualization Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t(
              'content.virtualListHeading',
              'High-Volume Virtualized List (1,000 items)'
            )}
          </CardTitle>
          <CardDescription>
            Renders only visible rows to maintain 60 FPS performance and minimal
            DOM nodes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VirtualList
            items={VIRTUAL_RECORDS}
            height={320}
            itemHeight={48}
            getItemKey={(item) => item.id}
            renderItem={(item) => (
              <div className="flex items-center justify-between px-3 py-2 border-b text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {item.code}
                  </span>
                  <span className="text-foreground">{item.label}</span>
                </div>
                <span className="text-xs uppercase text-muted-foreground">
                  {item.category}
                </span>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
