import type { ReactNode } from 'react'

import { X } from 'lucide-react'

import { Button } from '@/core/ui/components/button'

interface DataTableSelectionBarProps<TData> {
  selectedCount: number
  selectedRows: TData[]
  clearSelection: () => void
  children?: ReactNode
}

export function DataTableSelectionBar<TData>({
  selectedCount,
  clearSelection,
  children,
}: DataTableSelectionBarProps<TData>) {
  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/60 px-4 py-2 text-sm">
      <div className="flex items-center gap-3">
        <span className="font-medium text-foreground">
          {selectedCount} item(s) selected
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-muted-foreground hover:text-foreground"
          onClick={clearSelection}
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Clear selection
        </Button>
      </div>

      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
