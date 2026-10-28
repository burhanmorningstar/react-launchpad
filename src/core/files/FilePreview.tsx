import { AlertCircle, CheckCircle2, FileIcon, RotateCw, X } from 'lucide-react'

import { Badge } from '@/core/ui/components/badge'
import { Button } from '@/core/ui/components/button'
import { cn } from '@/core/ui/utils'

import type { UploadQueueItem } from './types'

export interface FilePreviewProps {
  item: UploadQueueItem
  onRemove?: (id: string) => void
  onRetry?: (id: string) => void
  className?: string
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function FilePreview({
  item,
  onRemove,
  onRetry,
  className,
}: FilePreviewProps) {
  const { id, file, status, progress, error, previewUrl } = item

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 rounded-lg border p-3 bg-card text-card-foreground',
        className
      )}
    >
      {/* Thumbnail or File icon */}
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={file.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <FileIcon className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      {/* Info & Progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium" title={file.name}>
            {file.name}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatBytes(file.size)}
          </span>
        </div>

        {status === 'uploading' && (
          <div className="mt-2 space-y-1">
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Uploading ${file.name}`}
              className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-1 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Uploaded</span>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{error || 'Upload failed'}</span>
          </div>
        )}

        {status === 'aborted' && (
          <div className="mt-1">
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
              Cancelled
            </Badge>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {(status === 'error' || status === 'aborted') && onRetry && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onRetry(id)}
            aria-label={`Retry ${file.name}`}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        )}

        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => onRemove(id)}
            aria-label={`Remove ${file.name}`}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
