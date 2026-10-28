import { useCallback, useEffect } from 'react'

import {
  useController,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import { FileDropzone } from '@/core/files/FileDropzone'
import { FilePreview } from '@/core/files/FilePreview'
import { type FilePolicy } from '@/core/files/types'
import { useFileSelection } from '@/core/files/useFileSelection'

import { FieldShell } from '../FieldShell'

import type { BaseFieldProps } from '../types'

export interface FileFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  policy?: FilePolicy
  dropzoneTitle?: string
  dropzoneSubtitle?: string
}

export function FileField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  hint,
  description,
  required,
  policy = {},
  disabled,
  className,
  labelClassName,
  hintClassName,
  errorClassName,
  dropzoneTitle,
  dropzoneSubtitle,
}: FileFieldProps<TFieldValues, TName>) {
  const {
    field: { onChange },
  } = useController<TFieldValues, TName>({ name })

  const { files, addFiles, removeFile, clearFiles } = useFileSelection({
    policy,
  })

  // Synchronize internal files array to form value
  useEffect(() => {
    const rawFiles = files.map((f) => f.file)
    onChange(rawFiles)
  }, [files, onChange])

  const handleRemove = useCallback(
    (id: string) => {
      removeFile(id)
    },
    [removeFile]
  )

  return (
    <FieldShell
      name={name}
      label={label}
      hint={hint}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
      labelClassName={labelClassName}
      hintClassName={hintClassName}
      errorClassName={errorClassName}
    >
      {(ctx) => (
        <div
          id={ctx.id}
          aria-describedby={ctx.ariaDescribedBy}
          className="space-y-3"
        >
          <FileDropzone
            onFilesSelected={addFiles}
            policy={policy}
            disabled={ctx.disabled}
            title={dropzoneTitle}
            subtitle={dropzoneSubtitle}
            className={ctx.hasError ? 'border-destructive/60' : undefined}
          />

          {files.length > 0 && (
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
                  onRemove={handleRemove}
                />
              ))}

              {files.length > 1 && (
                <button
                  type="button"
                  onClick={clearFiles}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Clear all files
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </FieldShell>
  )
}
