export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'abort' | 'unknown'

export interface ApiErrorPayload {
  message: string
  kind: ApiErrorKind
  status?: number
  code?: string
  fieldErrors?: Record<string, string>
  requestId?: string
  data?: unknown
}

export class ApiError extends Error implements ApiErrorPayload {
  readonly kind: ApiErrorKind
  readonly status?: number
  readonly code?: string
  readonly fieldErrors?: Record<string, string>
  readonly requestId?: string
  readonly data?: unknown

  constructor(payload: ApiErrorPayload) {
    super(payload.message)
    this.name = 'ApiError'
    this.kind = payload.kind
    this.status = payload.status
    this.code = payload.code
    this.fieldErrors = payload.fieldErrors
    this.requestId = payload.requestId
    this.data = payload.data

    Object.setPrototypeOf(this, ApiError.prototype)
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isValidationError(): boolean {
    return (
      this.status === 422 ||
      Boolean(this.fieldErrors && Object.keys(this.fieldErrors).length > 0)
    )
  }

  get isRateLimited(): boolean {
    return this.status === 429
  }

  get isServerError(): boolean {
    return (
      typeof this.status === 'number' && this.status >= 500 && this.status < 600
    )
  }

  get isNetworkError(): boolean {
    return this.kind === 'network'
  }

  get isAborted(): boolean {
    return this.kind === 'abort'
  }
}

/**
 * Normalizes any caught Axios error, network failure, or unknown error into a standardized ApiError.
 */
export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  // Check for DOM / fetch abort
  if (
    error &&
    typeof error === 'object' &&
    'name' in error &&
    (error.name === 'AbortError' || error.name === 'CanceledError')
  ) {
    return new ApiError({
      message: 'Request was cancelled',
      kind: 'abort',
    })
  }

  // Axios-like error
  if (
    error &&
    typeof error === 'object' &&
    'isAxiosError' in error &&
    (error as { isAxiosError: boolean }).isAxiosError
  ) {
    const axiosErr = error as {
      message?: string
      code?: string
      response?: {
        status?: number
        data?: unknown
        headers?: Record<string, unknown>
      }
      config?: {
        headers?: Record<string, unknown>
      }
    }

    const status = axiosErr.response?.status
    const responseData = axiosErr.response?.data
    const requestId =
      (axiosErr.response?.headers?.['x-request-id'] as string) ||
      (axiosErr.config?.headers?.['X-Request-ID'] as string) ||
      undefined

    // Check cancellation
    if (axiosErr.code === 'ERR_CANCELED') {
      return new ApiError({
        message: 'Request was cancelled',
        kind: 'abort',
        requestId,
      })
    }

    // Check timeout
    if (axiosErr.code === 'ECONNABORTED' || axiosErr.code === 'ETIMEDOUT') {
      return new ApiError({
        message: 'Request timed out. Please check your connection.',
        kind: 'timeout',
        requestId,
      })
    }

    // Network / No response error
    if (!axiosErr.response) {
      return new ApiError({
        message: 'Network error. Please check your internet connection.',
        kind: 'network',
        code: axiosErr.code,
        requestId,
      })
    }

    // HTTP error with response
    let message = 'An unexpected error occurred'
    let fieldErrors: Record<string, string> | undefined

    if (responseData && typeof responseData === 'object') {
      const dataObj = responseData as Record<string, unknown>
      if (typeof dataObj.message === 'string') {
        message = dataObj.message
      } else if (typeof dataObj.error === 'string') {
        message = dataObj.error
      }

      if (dataObj.fieldErrors && typeof dataObj.fieldErrors === 'object') {
        fieldErrors = dataObj.fieldErrors as Record<string, string>
      } else if (
        dataObj.errors &&
        typeof dataObj.errors === 'object' &&
        !Array.isArray(dataObj.errors)
      ) {
        fieldErrors = dataObj.errors as Record<string, string>
      }
    }

    return new ApiError({
      message,
      kind: 'http',
      status,
      code: axiosErr.code,
      fieldErrors,
      requestId,
      data: responseData,
    })
  }

  if (error instanceof Error) {
    return new ApiError({
      message: error.message,
      kind: 'unknown',
    })
  }

  return new ApiError({
    message: String(error) || 'An unknown error occurred',
    kind: 'unknown',
  })
}
