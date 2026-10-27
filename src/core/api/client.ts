import axios from 'axios'

import { STORAGE_KEYS } from '@/config/constants'
import { projectConfig } from '@/config/project'
import { logger } from '@/core/monitoring'

import type { ApiError } from './types'
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios'

interface RetryConfig {
  retries: number
  retryDelay: number
  retryCondition: (error: AxiosError) => boolean
}

const defaultRetryConfig: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    if (!error.response) return true // Network error
    const status = error.response.status
    return status >= 500 && status < 600
  },
}

/**
 * Delay helper with exponential backoff
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Calculate delay with exponential backoff
 */
const getRetryDelay = (retryCount: number, baseDelay: number): number => {
  return baseDelay * Math.pow(2, retryCount) + Math.random() * 100
}

const createApiClient = (
  retryConfig: Partial<RetryConfig> = {}
): AxiosInstance => {
  const config: RetryConfig = { ...defaultRetryConfig, ...retryConfig }

  const client = axios.create({
    baseURL: projectConfig.apiUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor
  client.interceptors.request.use(
    (axiosConfig: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      if (token) {
        axiosConfig.headers.Authorization = `Bearer ${token}`
      }

      // Add request ID for tracing
      axiosConfig.headers['X-Request-ID'] = crypto.randomUUID()

      logger.debug('API Request', {
        method: axiosConfig.method?.toUpperCase(),
        url: axiosConfig.url,
        requestId: axiosConfig.headers['X-Request-ID'],
      })

      return axiosConfig
    },
    (error: AxiosError) => {
      logger.error('API Request Error', error)
      return Promise.reject(error)
    }
  )

  // Response interceptor with retry logic
  client.interceptors.response.use(
    (response) => {
      logger.debug('API Response', {
        status: response.status,
        url: response.config.url,
        requestId: response.config.headers['X-Request-ID'],
      })
      return response
    },
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        __retryCount?: number
      }

      if (!originalRequest) {
        return Promise.reject(error)
      }

      // Initialize retry count
      originalRequest.__retryCount = originalRequest.__retryCount || 0

      // Check if we should retry
      const shouldRetry =
        originalRequest.__retryCount < config.retries &&
        config.retryCondition(error)

      if (shouldRetry) {
        originalRequest.__retryCount++

        const retryDelay = getRetryDelay(
          originalRequest.__retryCount,
          config.retryDelay
        )

        logger.warn('API Request Retry', {
          url: originalRequest.url,
          attempt: originalRequest.__retryCount,
          maxRetries: config.retries,
          delayMs: retryDelay,
          error: error.message,
        })

        await delay(retryDelay)
        return client(originalRequest)
      }

      // Handle specific error cases
      if (error.response?.status === 401) {
        // Don't redirect if already on auth pages or if this is a login/register request
        const isAuthRequest =
          originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/register')
        const isOnAuthPage =
          window.location.pathname.includes('/login') ||
          window.location.pathname.includes('/register')

        if (!isAuthRequest && !isOnAuthPage) {
          logger.warn('Unauthorized - Redirecting to login')
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
          window.location.href = '/login'
        }
      }

      // Log the final error
      logger.error('API Request Failed', error, {
        url: originalRequest.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      })

      return Promise.reject(error)
    }
  )

  return client
}

export const apiClient = createApiClient()

/**
 * Create a custom API client with different configuration
 */
export const createCustomClient = createApiClient
