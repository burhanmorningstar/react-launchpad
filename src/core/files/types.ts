export interface FilePolicy {
  maxFiles?: number
  maxSizeBytes?: number
  minSizeBytes?: number
  allowedMimeTypes?: string[]
  allowedExtensions?: string[]
  allowEmpty?: boolean
}

export type FileValidationErrorKind =
  | 'max_files_exceeded'
  | 'max_size_exceeded'
  | 'min_size_exceeded'
  | 'unsupported_type'
  | 'empty_file'

export interface FileValidationError {
  file?: File
  fileName: string
  kind: FileValidationErrorKind
  message: string
}

export interface ValidationResult {
  validFiles: File[]
  errors: FileValidationError[]
}

export interface UploadedAsset {
  id: string
  url: string
  name: string
  size: number
  mimeType: string
  uploadedAt: string
}

export interface UploadOptions {
  signal?: AbortSignal
  onProgress?: (progress: number) => void
}

export interface UploadAdapter {
  upload: (file: File, options?: UploadOptions) => Promise<UploadedAsset>
}

export type UploadStatus =
  | 'idle'
  | 'uploading'
  | 'success'
  | 'error'
  | 'aborted'

export interface UploadQueueItem {
  id: string
  file: File
  previewUrl?: string
  status: UploadStatus
  progress: number
  error?: string
  asset?: UploadedAsset
  abortController?: AbortController
}
