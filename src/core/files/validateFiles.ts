import type { FilePolicy, FileValidationError, ValidationResult } from './types'

function matchesMime(fileType: string, allowedMime: string): boolean {
  if (allowedMime === fileType) return true
  if (allowedMime.endsWith('/*')) {
    const prefix = allowedMime.slice(0, -1) // e.g. "image/"
    return fileType.startsWith(prefix)
  }
  return false
}

function matchesExtension(fileName: string, allowedExt: string): boolean {
  const ext = allowedExt.startsWith('.')
    ? allowedExt.toLowerCase()
    : `.${allowedExt.toLowerCase()}`
  return fileName.toLowerCase().endsWith(ext)
}

/**
 * Validates a batch of candidate files against a policy.
 * Produces user-facing, localizable validation errors.
 */
export function validateFiles(
  candidates: File[],
  currentFileCount = 0,
  policy: FilePolicy = {}
): ValidationResult {
  const {
    maxFiles,
    maxSizeBytes,
    minSizeBytes,
    allowedMimeTypes,
    allowedExtensions,
    allowEmpty = false,
  } = policy

  const validFiles: File[] = []
  const errors: FileValidationError[] = []

  let accumulatedCount = currentFileCount

  for (const file of candidates) {
    // 1. Max files check
    if (maxFiles !== undefined && accumulatedCount >= maxFiles) {
      errors.push({
        file,
        fileName: file.name,
        kind: 'max_files_exceeded',
        message: `Maximum limit of ${maxFiles} file(s) exceeded.`,
      })
      continue
    }

    // 2. Empty file check
    if (file.size === 0 && !allowEmpty) {
      errors.push({
        file,
        fileName: file.name,
        kind: 'empty_file',
        message: `File "${file.name}" is empty (0 bytes).`,
      })
      continue
    }

    // 3. Max size check
    if (maxSizeBytes !== undefined && file.size > maxSizeBytes) {
      errors.push({
        file,
        fileName: file.name,
        kind: 'max_size_exceeded',
        message: `File "${file.name}" exceeds maximum allowed size of ${Math.round(
          maxSizeBytes / 1024 / 1024
        )}MB.`,
      })
      continue
    }

    // 4. Min size check
    if (minSizeBytes !== undefined && file.size < minSizeBytes) {
      errors.push({
        file,
        fileName: file.name,
        kind: 'min_size_exceeded',
        message: `File "${file.name}" is smaller than minimum allowed size.`,
      })
      continue
    }

    // 5. MIME type & Extension check
    const hasMimeConstraint = allowedMimeTypes && allowedMimeTypes.length > 0
    const hasExtConstraint = allowedExtensions && allowedExtensions.length > 0

    if (hasMimeConstraint || hasExtConstraint) {
      const mimeMatches = hasMimeConstraint
        ? allowedMimeTypes.some((mime) => matchesMime(file.type, mime))
        : false

      const extMatches = hasExtConstraint
        ? allowedExtensions.some((ext) => matchesExtension(file.name, ext))
        : false

      if (!mimeMatches && !extMatches) {
        errors.push({
          file,
          fileName: file.name,
          kind: 'unsupported_type',
          message: `File type of "${file.name}" is not supported.`,
        })
        continue
      }
    }

    validFiles.push(file)
    accumulatedCount++
  }

  return { validFiles, errors }
}
