import { useState } from 'react'

import { z } from 'zod'

import { Form, useAppForm } from '@/core/forms'
import { FileField } from '@/core/forms/fields/FileField'
import { Button } from '@/core/ui/components/button'

import { FileDropzone } from './FileDropzone'
import { FilePreview } from './FilePreview'
import { useFileSelection } from './useFileSelection'
import { createMockUploadAdapter, useUploadQueue } from './useUploadQueue'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Core/Files/FileUpload',
  decorators: [
    (Story) => (
      <div className="p-6 max-w-xl mx-auto space-y-6">
        <Story />
      </div>
    ),
  ],
}

export default meta

export const DropzoneAndPreview: StoryObj = {
  render: () => {
    const { files, addFiles, removeFile, clearFiles, errors } =
      useFileSelection({
        policy: {
          maxFiles: 5,
          maxSizeBytes: 1024 * 1024 * 10, // 10MB
          allowedMimeTypes: ['image/*', 'application/pdf'],
        },
      })

    return (
      <div className="space-y-4">
        <FileDropzone
          onFilesSelected={addFiles}
          title="Upload receipts or documents"
          subtitle="PNG, JPG, PDF up to 10MB (max 5 files)"
        />

        {errors.length > 0 && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive space-y-1">
            {errors.map((err, i) => (
              <p key={i}>
                <strong>{err.fileName}:</strong> {err.message}
              </p>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{files.length} file(s) selected</span>
              <button
                type="button"
                onClick={clearFiles}
                className="hover:text-foreground underline"
              >
                Clear all
              </button>
            </div>

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
                onRemove={removeFile}
              />
            ))}
          </div>
        )}
      </div>
    )
  },
}

export const UploadQueueWithProgress: StoryObj = {
  render: () => {
    const adapter = createMockUploadAdapter({ latencyMs: 1500 })
    const { items, enqueue, abort, retry, remove, clear } = useUploadQueue({
      adapter,
    })

    const handleSelect = (selectedFiles: File[]) => {
      selectedFiles.forEach((file) => {
        let previewUrl: string | undefined
        if (file.type.startsWith('image/')) {
          try {
            previewUrl = URL.createObjectURL(file)
          } catch {
            // Ignore preview error
          }
        }
        void enqueue(file, previewUrl)
      })
    }

    return (
      <div className="space-y-4">
        <FileDropzone
          onFilesSelected={handleSelect}
          title="Upload with simulated progress"
          subtitle="Files will simulate upload with cancel and retry support"
        />

        {items.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Upload queue ({items.length})</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="h-7 text-xs"
              >
                Clear queue
              </Button>
            </div>

            {items.map((item) => (
              <FilePreview
                key={item.id}
                item={item}
                onRemove={(id) => {
                  abort(id)
                  remove(id)
                }}
                onRetry={retry}
              />
            ))}
          </div>
        )}
      </div>
    )
  },
}

export const FormWithFileField: StoryObj = {
  render: () => {
    const schema = z.object({
      documentName: z.string().min(2, 'Name is required'),
      attachments: z
        .array(z.custom<File>())
        .min(1, 'Please select at least one file'),
    })

    const [submitted, setSubmitted] = useState<{
      documentName: string
      attachments?: File[]
    } | null>(null)
    const form = useAppForm({
      schema,
      defaultValues: {
        documentName: '',
        attachments: [],
      },
    })

    return (
      <Form
        form={form}
        onSubmit={(values) => {
          setSubmitted(values)
        }}
        className="space-y-4"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium">Document Title</label>
          <input
            {...form.register('documentName')}
            className="w-full rounded border px-3 py-1.5 text-sm bg-background"
            placeholder="e.g. Q4 Financial Report"
          />
        </div>

        <FileField
          name="attachments"
          label="Attachments"
          description="Upload related PDF or spreadsheets"
          policy={{
            maxFiles: 3,
            allowedMimeTypes: ['application/pdf', 'image/*'],
          }}
        />

        <Button type="submit" size="sm">
          Submit Form
        </Button>

        {submitted && (
          <div className="mt-4 p-3 bg-muted rounded text-xs">
            <p className="font-semibold">Submitted values:</p>
            <p>Title: {submitted.documentName}</p>
            <p>Files: {submitted.attachments?.length} file(s)</p>
          </div>
        )}
      </Form>
    )
  },
}

export const RtlLayout: StoryObj = {
  render: () => (
    <div dir="rtl" className="space-y-4">
      <h3 className="text-lg font-semibold">تحميل الملفات (RTL)</h3>
      <FileDropzone
        onFilesSelected={() => {}}
        title="اسحب الملفات هنا أو انقر للتحميل"
        subtitle="يدعم ملفات الصور والمستندات"
      />
    </div>
  ),
}
