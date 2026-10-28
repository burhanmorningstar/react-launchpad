import axios from 'axios'

import { projectConfig } from '@/config/project'
import { getAuthAdapter } from '@/core/auth/adapter'
import { logger } from '@/core/monitoring'

import { normalizeApiError } from './errors'

import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios'

export interface RetryConfig {
  retries: number
  retryDelay: number
  maxRetryDelay: number
  retryCondition: (error: AxiosError) => boolean
}

export const defaultRetryConfig: RetryConfig = {
  retries: 2,
  retryDelay: 300,
  maxRetryDelay: 3000,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    if (!error.response) return true
    const status = error.response.status
    return status >= 500 && status < 600
  },
}

export interface ApiClientOptions {
  baseURL?: string
  getToken?: () => string | null | Promise<string | null>
  onUnauthorized?: () => void
  retryConfig?: Partial<RetryConfig>
  headers?: Record<string, string>
  timeout?: number
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const calculateRetryDelay = (
  retryCount: number,
  baseDelay: number,
  maxDelay: number
): number => {
  const exponential = baseDelay * Math.pow(2, retryCount)
  const jitter = Math.random() * 50
  return Math.min(exponential + jitter, maxDelay)
}

function sanitizeHeadersForLogging(
  headers: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!headers) return {}
  const sanitized: Record<string, unknown> = {}
  const SENSITIVE_KEYS = ['authorization', 'cookie', 'x-api-key', 'set-cookie']

  for (const [key, val] of Object.entries(headers)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]'
    } else {
      sanitized[key] = val
    }
  }
  return sanitized
}

export function createApiClient(options: ApiClientOptions = {}): AxiosInstance {
  const config: RetryConfig = {
    ...defaultRetryConfig,
    ...options.retryConfig,
  }

  const client = axios.create({
    baseURL: options.baseURL || projectConfig.apiUrl,
    timeout: options.timeout ?? 30000,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  // Request interceptor
  client.interceptors.request.use(
    async (axiosConfig: InternalAxiosRequestConfig) => {
      // 1. Resolve Auth token if provider configured
      const tokenResolver =
        options.getToken || (() => getAuthAdapter().getAccessToken?.() || null)
      const token = await tokenResolver()
      if (
        token &&
        !axiosConfig.headers.get?.('Authorization') &&
        !axiosConfig.headers.Authorization
      ) {
        if (typeof axiosConfig.headers.set === 'function') {
          axiosConfig.headers.set('Authorization', `Bearer ${token}`)
        } else {
          axiosConfig.headers.Authorization = `Bearer ${token}`
        }
      }

      // 2. Add request ID for tracing
      const existingReqId =
        axiosConfig.headers.get?.('X-Request-ID') ||
        axiosConfig.headers['X-Request-ID']
      if (!existingReqId) {
        const generatedId =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `req-${Date.now()}`
        if (typeof axiosConfig.headers.set === 'function') {
          axiosConfig.headers.set('X-Request-ID', generatedId)
        } else {
          axiosConfig.headers['X-Request-ID'] = generatedId
        }
      }

      const reqId =
        axiosConfig.headers.get?.('X-Request-ID') ||
        axiosConfig.headers['X-Request-ID']
      logger.debug('API Request', {
        method: axiosConfig.method?.toUpperCase(),
        url: axiosConfig.url,
        requestId: reqId,
      })

      return axiosConfig
    },
    (error: unknown) => {
      logger.error('API Request Preparation Error', error)
      return Promise.reject(normalizeApiError(error))
    }
  )

  // Response interceptor with safe retry & error normalization
  client.interceptors.response.use(
    (response) => {
      logger.debug('API Response', {
        status: response.status,
        url: response.config.url,
        requestId:
          response.config.headers?.get?.('X-Request-ID') ||
          response.config.headers?.['X-Request-ID'],
      })
      return response
    },
    async (error: AxiosError) => {
      // Handle 401 Unauthorized via configured callback
      if (error.response?.status === 401) {
        if (options.onUnauthorized) {
          options.onUnauthorized()
        } else {
          getAuthAdapter().signOut()
        }
      }

      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & {
            __retryCount?: number
          })
        | undefined

      if (!originalRequest) {
        return Promise.reject(normalizeApiError(error))
      }

      // Check method idempotency:
      // Safe methods: GET, HEAD, OPTIONS
      // Non-safe methods (POST, PATCH, DELETE) only retried if explicit idempotency header is passed
      const method = (originalRequest.method || 'GET').toUpperCase()
      const isSafeMethod =
        method === 'GET' || method === 'HEAD' || method === 'OPTIONS'
      const headers = originalRequest.headers
      const hasIdempotencyOptIn = Boolean(
        headers?.get?.('Idempotency-Key') ||
        headers?.['Idempotency-Key'] ||
        headers?.get?.('X-Idempotent') ||
        headers?.['X-Idempotent']
      )
      const isIdempotent = isSafeMethod || hasIdempotencyOptIn

      originalRequest.__retryCount = originalRequest.__retryCount || 0

      const shouldRetry =
        isIdempotent &&
        originalRequest.__retryCount < config.retries &&
        config.retryCondition(error)

      if (shouldRetry) {
        originalRequest.__retryCount++
        const retryDelayMs = calculateRetryDelay(
          originalRequest.__retryCount,
          config.retryDelay,
          config.maxRetryDelay
        )

        logger.warn('API Request Retry', {
          url: originalRequest.url,
          method,
          attempt: originalRequest.__retryCount,
          maxRetries: config.retries,
          delayMs: retryDelayMs,
        })

        await delay(retryDelayMs)
        return client(originalRequest)
      }

      // Log sanitized failure details
      logger.error('API Request Failed', {
        url: originalRequest.url,
        status: error.response?.status,
        message: error.message,
        headers: sanitizeHeadersForLogging(
          originalRequest.headers as unknown as Record<string, unknown>
        ),
      })

      return Promise.reject(normalizeApiError(error))
    }
  )

  return client
}

export const apiClient = createApiClient()

export const createCustomClient = (options?: ApiClientOptions) =>
  createApiClient(options)
