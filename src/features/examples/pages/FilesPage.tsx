import * as React from 'react'

import { AlertCircle, UploadCloud } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/core/blocks'
import {
  FileDropzone,
  FilePreview,
  useFileSelection,
  useUploadQueue,
  createMockUploadAdapter,
} from '@/core/files'
import { Button } from '@/core/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/ui/components/card'

export default function FilesPage() {
  const { t } = useTranslation('examples')
  const mockAdapter = React.useMemo(
    () => createMockUploadAdapter({ latencyMs: 800 }),
    []
  )

  const { files, addFiles, removeFile, clearFiles, errors } = useFileSelection({
    policy: {
      maxFiles: 5,
      maxSizeBytes: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['image/*', 'application/pdf'],
    },
  })

  const { items, enqueue, abort, retry, remove, clear } = useUploadQueue({
    adapter: mockAdapter,
  })

  const handleStartUpload = () => {
    files.forEach((item) => {
      enqueue(item.file, item.previewUrl)
    })
    clearFiles()
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('files.title', 'File Selection & Upload Management')}
        description={t(
          'files.description',
          'Demonstrates drag-and-drop file selection, client-side validation, upload progress and file previews.'
        )}
      />

      <Card className="border-border">
        <CardHeader>
          <CardTitle>
            {t('files.uploadHeading', 'Upload Document or Media')}
          </CardTitle>
          <CardDescription>
            {t(
              'files.simulatedNotice',
              'Uploads are handled entirely in-memory using an upload adapter.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileDropzone
            onFilesSelected={addFiles}
            title="Drag and drop your files here, or browse"
            subtitle="Images (PNG, JPG, SVG) and PDFs up to 10MB"
          />

          {/* Validation errors */}
          {errors.length > 0 && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div className="space-y-1">
                {errors.map((err, i) => (
                  <div key={i}>
                    <strong>{err.fileName}:</strong> {err.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  Selected Files ({files.length})
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={clearFiles}>
                    Clear All
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleStartUpload}
                    className="gap-2"
                  >
                    <UploadCloud className="h-4 w-4" />
                    Start Upload
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {files.map((item) => (
                  <FilePreview
                    key={item.id}
                    item={{
                      id: item.id,
                      file: item.file,
                      previewUrl: item.previewUrl,
                      status: 'idle',
                      progress: 0,
                    }}
                    onRemove={() => removeFile(item.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Active Upload Queue */}
          {items.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <h4 className="font-semibold text-foreground">
                  {t('files.uploadQueue', 'Upload Queue')} ({items.length})
                </h4>
                <Button variant="ghost" size="sm" onClick={clear}>
                  Clear Queue
                </Button>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <FilePreview
                    key={item.id}
                    item={item}
                    onRemove={item.status === 'uploading' ? abort : remove}
                    onRetry={retry}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
