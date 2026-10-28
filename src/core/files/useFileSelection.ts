import { useCallback, useEffect, useRef, useState } from 'react'

import { type FilePolicy, type FileValidationError } from './types'
import { validateFiles } from './validateFiles'

export interface SelectedFileItem {
  id: string
  file: File
  previewUrl?: string
}

export interface UseFileSelectionOptions {
  policy?: FilePolicy
  initialFiles?: File[]
  onValidationErrors?: (errors: FileValidationError[]) => void
}

export interface UseFileSelectionResult {
  files: SelectedFileItem[]
  addFiles: (candidateFiles: File[]) => {
    validCount: number
    errors: FileValidationError[]
  }
  removeFile: (id: string) => void
  clearFiles: () => void
  errors: FileValidationError[]
}

let counter = 0
function generateFileId(file: File): string {
  counter++
  return `${file.name}-${file.size}-${file.lastModified}-${counter}`
}

export function useFileSelection(
  options: UseFileSelectionOptions = {}
): UseFileSelectionResult {
  const { policy = {}, onValidationErrors } = options
  const [files, setFiles] = useState<SelectedFileItem[]>([])
  const [errors, setErrors] = useState<FileValidationError[]>([])

  // Keep track of active blob URLs for safe revocation on unmount
  const blobUrlsRef = useRef<Set<string>>(new Set())

  const revokeUrl = useCallback((url?: string) => {
    if (url && url.startsWith('blob:') && typeof URL !== 'undefined') {
      try {
        URL.revokeObjectURL(url)
        blobUrlsRef.current.delete(url)
      } catch {
        // Ignore URL revoke error
      }
    }
  }, [])

  // Cleanup all remaining blob URLs on unmount
  useEffect(() => {
    const urls = blobUrlsRef.current
    return () => {
      urls.forEach((url) => {
        try {
          URL.revokeObjectURL(url)
        } catch {
          // Ignore
        }
      })
      urls.clear()
    }
  }, [])

  const addFiles = useCallback(
    (candidates: File[]) => {
      const { validFiles, errors: validationErrors } = validateFiles(
        candidates,
        files.length,
        policy
      )

      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        onValidationErrors?.(validationErrors)
      } else {
        setErrors([])
      }

      const newItems: SelectedFileItem[] = validFiles.map((file) => {
        let previewUrl: string | undefined
        if (
          file.type.startsWith('image/') &&
          typeof URL !== 'undefined' &&
          typeof URL.createObjectURL === 'function'
        ) {
          try {
            previewUrl = URL.createObjectURL(file)
            blobUrlsRef.current.add(previewUrl)
          } catch {
            // Ignore preview generation failure
          }
        }

        return {
          id: generateFileId(file),
          file,
          previewUrl,
        }
      })

      setFiles((prev) => [...prev, ...newItems])
      return { validCount: validFiles.length, errors: validationErrors }
    },
    [files.length, onValidationErrors, policy]
  )

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const target = prev.find((item) => item.id === id)
        if (target?.previewUrl) {
          revokeUrl(target.previewUrl)
        }
        return prev.filter((item) => item.id !== id)
      })
    },
    [revokeUrl]
  )

  const clearFiles = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((item) => revokeUrl(item.previewUrl))
      return []
    })
    setErrors([])
  }, [revokeUrl])

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    errors,
  }
}
