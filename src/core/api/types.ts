export * from './errors'

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Legacy PaginatedResponse maintained for backwards compatibility.
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  pageSize?: number
}
