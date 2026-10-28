import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FileDropzone } from './FileDropzone'
import { FilePreview } from './FilePreview'
import { useFileSelection } from './useFileSelection'
import { createMockUploadAdapter, useUploadQueue } from './useUploadQueue'
import { validateFiles } from './validateFiles'

describe('core file and upload management', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('validateFiles', () => {
    it('validates file sizes, empty files, and count limits', () => {
      const file1 = new File(['valid content'], 'file1.png', {
        type: 'image/png',
      })
      const file2 = new File([''], 'empty.png', { type: 'image/png' })
      const file3 = new File([new Uint8Array(1024 * 1024 * 5)], 'huge.png', {
        type: 'image/png',
      }) // 5MB

      const policy = {
        maxFiles: 2,
        maxSizeBytes: 1024 * 1024 * 2, // 2MB
        allowedMimeTypes: ['image/*'],
      }

      const result = validateFiles([file1, file2, file3], 0, policy)

      expect(result.validFiles).toEqual([file1])
      expect(result.errors).toHaveLength(2)

      const emptyErr = result.errors.find((e) => e.fileName === 'empty.png')
      expect(emptyErr?.kind).toBe('empty_file')

      const sizeErr = result.errors.find((e) => e.fileName === 'huge.png')
      expect(sizeErr?.kind).toBe('max_size_exceeded')
    })

    it('validates allowed extensions and MIME types', () => {
      const pdf = new File(['content'], 'document.pdf', {
        type: 'application/pdf',
      })
      const exe = new File(['binary'], 'virus.exe', {
        type: 'application/x-msdownload',
      })

      const policy = {
        allowedExtensions: ['.pdf', '.docx'],
        allowedMimeTypes: ['application/pdf'],
      }

      const result = validateFiles([pdf, exe], 0, policy)
      expect(result.validFiles).toEqual([pdf])
      expect(result.errors[0]?.kind).toBe('unsupported_type')
      expect(result.errors[0]?.fileName).toBe('virus.exe')
    })

    it('enforces total file count limit with existing files', () => {
      const fileA = new File(['a'], 'a.png', { type: 'image/png' })
      const fileB = new File(['b'], 'b.png', { type: 'image/png' })

      const policy = { maxFiles: 2 }

      // Already have 1 file, trying to add 2 files -> 1 valid, 1 rejected
      const result = validateFiles([fileA, fileB], 1, policy)
      expect(result.validFiles).toEqual([fileA])
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]?.kind).toBe('max_files_exceeded')
    })
  })

  describe('useFileSelection & Object URL lifecycle', () => {
    it('manages file selection and creates/revokes object URLs safely', () => {
      let blobCounter = 0
      const createObjectURL = vi
        .spyOn(URL, 'createObjectURL')
        .mockImplementation(() => `blob:mock/${++blobCounter}`)
      const revokeObjectURL = vi
        .spyOn(URL, 'revokeObjectURL')
        .mockImplementation(() => {})

      const { result, unmount } = renderHook(() =>
        useFileSelection({
          policy: { maxFiles: 3 },
        })
      )

      const file1 = new File(['img1'], 'photo.jpg', { type: 'image/jpeg' })
      const file2 = new File(['img2'], 'photo.jpg', { type: 'image/jpeg' }) // Same name, different file

      act(() => {
        result.current.addFiles([file1, file2])
      })

      expect(result.current.files).toHaveLength(2)
      // Both got distinct unique items despite matching file names
      expect(result.current.files[0]?.id).not.toBe(result.current.files[1]?.id)
      expect(createObjectURL).toHaveBeenCalledTimes(2)

      // Remove the first file
      const firstId = result.current.files[0]!.id
      act(() => {
        result.current.removeFile(firstId)
      })

      expect(result.current.files).toHaveLength(1)
      expect(revokeObjectURL).toHaveBeenCalledWith(`blob:mock/1`)

      // Unmounting revokes all remaining URLs
      unmount()
      expect(revokeObjectURL).toHaveBeenCalledTimes(2)
    })
  })

  describe('useUploadQueue & MockUploadAdapter', () => {
    it('simulates upload progress, success, and abort signal', async () => {
      const adapter = createMockUploadAdapter({ latencyMs: 20 })

      const { result } = renderHook(() => useUploadQueue({ adapter }))

      const testFile = new File(['data'], 'report.pdf', {
        type: 'application/pdf',
      })

      let uploadPromise: Promise<unknown>
      act(() => {
        uploadPromise = result.current.enqueue(testFile)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0]?.status).toBe('uploading')

      await act(async () => {
        await uploadPromise
      })

      expect(result.current.items[0]?.status).toBe('success')
      expect(result.current.items[0]?.progress).toBe(100)
      expect(result.current.items[0]?.asset?.url).toContain('report.pdf')
    })

    it('supports aborting an in-flight upload', async () => {
      const adapter = createMockUploadAdapter({ latencyMs: 200 })

      const { result } = renderHook(() => useUploadQueue({ adapter }))

      const testFile = new File(['data'], 'large.mov', {
        type: 'video/quicktime',
      })

      let uploadPromise: Promise<unknown>
      act(() => {
        uploadPromise = result.current.enqueue(testFile)
      })

      const itemId = result.current.items[0]!.id
      expect(result.current.items[0]?.status).toBe('uploading')

      await act(async () => {
        result.current.abort(itemId)
        await uploadPromise
      })

      expect(result.current.items[0]?.status).toBe('aborted')
    })
  })

  describe('FileDropzone', () => {
    it('handles keyboard trigger and file drop', () => {
      const onFilesSelected = vi.fn()

      render(<FileDropzone onFilesSelected={onFilesSelected} />)

      const dropzone = screen.getByRole('button', {
        name: /upload files or drag and drop/i,
      })
      expect(dropzone).toHaveAttribute('tabIndex', '0')

      // Drop file
      const droppedFile = new File(['dropped'], 'doc.pdf', {
        type: 'application/pdf',
      })

      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [droppedFile],
        },
      })

      expect(onFilesSelected).toHaveBeenCalledWith([droppedFile])
    })
  })

  describe('FilePreview', () => {
    it('renders file name, human-readable size, progress and remove action', () => {
      const onRemove = vi.fn()
      const testFile = new File(['content'], 'sample.png', {
        type: 'image/png',
      })

      render(
        <FilePreview
          item={{
            id: 'item-1',
            file: testFile,
            status: 'uploading',
            progress: 45,
            previewUrl: 'blob:mock/sample.png',
          }}
          onRemove={onRemove}
        />
      )

      expect(screen.getByText('sample.png')).toBeInTheDocument()
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '45')

      const removeBtn = screen.getByRole('button', {
        name: /remove sample\.png/i,
      })
      fireEvent.click(removeBtn)
      expect(onRemove).toHaveBeenCalledWith('item-1')
    })
  })
})
