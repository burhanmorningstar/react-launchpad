import { useCallback, useRef, useState } from 'react'

import type {
  UploadAdapter,
  UploadedAsset,
  UploadOptions,
  UploadQueueItem,
} from './types'

export interface MockUploadAdapterOptions {
  latencyMs?: number
  simulateError?: boolean
}

/**
 * Creates an in-memory mock upload adapter for backend-free starter and preview mode.
 */
export function createMockUploadAdapter(
  options: MockUploadAdapterOptions = {}
): UploadAdapter {
  const { latencyMs = 250, simulateError = false } = options

  return {
    upload: async (file: File, uploadOptions: UploadOptions = {}) => {
      const { signal, onProgress } = uploadOptions

      if (signal?.aborted) {
        throw new DOMException('Upload aborted', 'AbortError')
      }

      const steps = 4
      const stepDuration = latencyMs / steps

      for (let i = 1; i <= steps; i++) {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            if (signal?.aborted) {
              reject(new DOMException('Upload aborted', 'AbortError'))
            } else {
              resolve()
            }
          }, stepDuration)

          if (signal) {
            signal.addEventListener(
              'abort',
              () => {
                clearTimeout(timeout)
                reject(new DOMException('Upload aborted', 'AbortError'))
              },
              { once: true }
            )
          }
        })

        if (signal?.aborted) {
          throw new DOMException('Upload aborted', 'AbortError')
        }

        const currentProgress = Math.round((i / steps) * 100)
        onProgress?.(currentProgress)
      }

      if (simulateError) {
        throw new Error(`Upload failed for file ${file.name}`)
      }

      const asset: UploadedAsset = {
        id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url: `https://storage.local/uploads/${file.name}`,
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
      }

      return asset
    },
  }
}

export interface UseUploadQueueOptions {
  adapter?: UploadAdapter
  autoUpload?: boolean
}

export interface UseUploadQueueResult {
  items: UploadQueueItem[]
  enqueue: (file: File, previewUrl?: string) => Promise<UploadedAsset | null>
  abort: (id: string) => void
  retry: (id: string) => Promise<UploadedAsset | null>
  remove: (id: string) => void
  clear: () => void
}

let uploadIdCounter = 0

export function useUploadQueue(
  options: UseUploadQueueOptions = {}
): UseUploadQueueResult {
  const defaultAdapter = useRef(createMockUploadAdapter())
  const adapter = options.adapter ?? defaultAdapter.current

  const [items, setItems] = useState<UploadQueueItem[]>([])
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map())

  const performUpload = useCallback(
    async (
      id: string,
      file: File,
      controller: AbortController
    ): Promise<UploadedAsset | null> => {
      try {
        const asset = await adapter.upload(file, {
          signal: controller.signal,
          onProgress: (progress) => {
            setItems((prev) =>
              prev.map((item) =>
                item.id === id ? { ...item, progress } : item
              )
            )
          },
        })

        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: 'success', progress: 100, asset }
              : item
          )
        )
        return asset
      } catch (err: unknown) {
        const isAbort = err instanceof DOMException && err.name === 'AbortError'
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: isAbort ? 'aborted' : 'error',
                  error: isAbort ? 'Upload aborted' : (err as Error)?.message,
                }
              : item
          )
        )
        return null
      } finally {
        abortControllersRef.current.delete(id)
      }
    },
    [adapter]
  )

  const enqueue = useCallback(
    async (file: File, previewUrl?: string): Promise<UploadedAsset | null> => {
      uploadIdCounter++
      const id = `upload-${Date.now()}-${uploadIdCounter}`
      const controller = new AbortController()
      abortControllersRef.current.set(id, controller)

      const newItem: UploadQueueItem = {
        id,
        file,
        previewUrl,
        status: 'uploading',
        progress: 0,
        abortController: controller,
      }

      setItems((prev) => [...prev, newItem])
      return performUpload(id, file, controller)
    },
    [performUpload]
  )

  const abort = useCallback((id: string) => {
    const controller = abortControllersRef.current.get(id)
    if (controller) {
      controller.abort()
      abortControllersRef.current.delete(id)
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.status === 'uploading'
          ? { ...item, status: 'aborted', error: 'Upload aborted' }
          : item
      )
    )
  }, [])

  const retry = useCallback(
    async (id: string): Promise<UploadedAsset | null> => {
      const target = items.find((item) => item.id === id)
      if (!target) return null

      const controller = new AbortController()
      abortControllersRef.current.set(id, controller)

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: 'uploading', progress: 0, error: undefined }
            : item
        )
      )

      return performUpload(id, target.file, controller)
    },
    [items, performUpload]
  )

  const remove = useCallback(
    (id: string) => {
      abort(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    },
    [abort]
  )

  const clear = useCallback(() => {
    abortControllersRef.current.forEach((controller) => controller.abort())
    abortControllersRef.current.clear()
    setItems([])
  }, [])

  return {
    items,
    enqueue,
    abort,
    retry,
    remove,
    clear,
  }
}
