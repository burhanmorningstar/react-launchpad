import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from 'react'

import { UploadCloud } from 'lucide-react'

import { cn } from '@/core/ui/utils'

import type { FilePolicy } from './types'

export interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void
  policy?: FilePolicy
  disabled?: boolean
  className?: string
  title?: string
  subtitle?: string
}

export function FileDropzone({
  onFilesSelected,
  policy = {},
  disabled = false,
  className,
  title = 'Upload files or drag and drop',
  subtitle,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) setIsDragOver(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      if (disabled) return

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const filesArray = Array.from(e.dataTransfer.files)
        onFilesSelected(filesArray)
      }
    },
    [disabled, onFilesSelected]
  )

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.click()
    }
  }, [disabled])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
    },
    [disabled, handleClick]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const filesArray = Array.from(e.target.files)
        onFilesSelected(filesArray)
      }
    },
    [onFilesSelected]
  )

  // Construct accept string from policy
  const accept = [
    ...(policy.allowedMimeTypes ?? []),
    ...(policy.allowedExtensions ?? []),
  ].join(',')

  const defaultSubtitle = policy.maxSizeBytes
    ? `Up to ${Math.round(policy.maxSizeBytes / 1024 / 1024)}MB each`
    : 'PNG, JPG, PDF up to 10MB'

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={title}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors',
        isDragOver
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50 bg-background',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={policy.maxFiles === undefined || policy.maxFiles > 1}
        accept={accept || undefined}
        disabled={disabled}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <UploadCloud className="h-6 w-6 text-muted-foreground" />
      </div>

      <div className="mt-3">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {subtitle ?? defaultSubtitle}
        </p>
      </div>
    </div>
  )
}
