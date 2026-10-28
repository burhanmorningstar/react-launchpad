import { describe, expect, it, vi } from 'vitest'

import { createApiClient } from './client'
import { ApiError, normalizeApiError } from './errors'
import { queryKeys } from './queryKeys'

describe('Unified API Client & Error Contract', () => {
  describe('normalizeApiError', () => {
    it('normalizes HTTP 401 unauthorized error', () => {
      const err = normalizeApiError({
        isAxiosError: true,
        response: { status: 401, data: { message: 'Token expired' } },
      })

      expect(err).toBeInstanceOf(ApiError)
      expect(err.isUnauthorized).toBe(true)
      expect(err.status).toBe(401)
      expect(err.message).toBe('Token expired')
    })

    it('normalizes HTTP 422 validation error and extracts fieldErrors', () => {
      const err = normalizeApiError({
        isAxiosError: true,
        response: {
          status: 422,
          data: {
            message: 'Validation failed',
            fieldErrors: {
              email: 'Invalid email',
              age: 'Must be 18',
            },
          },
        },
      })

      expect(err.isValidationError).toBe(true)
      expect(err.fieldErrors).toEqual({
        email: 'Invalid email',
        age: 'Must be 18',
      })
    })

    it('normalizes HTTP 429 rate limit error', () => {
      const err = normalizeApiError({
        isAxiosError: true,
        response: { status: 429, data: { message: 'Too many requests' } },
      })

      expect(err.isRateLimited).toBe(true)
      expect(err.status).toBe(429)
    })

    it('normalizes HTTP 500 server error', () => {
      const err = normalizeApiError({
        isAxiosError: true,
        response: { status: 500, data: { message: 'Internal server error' } },
      })

      expect(err.isServerError).toBe(true)
      expect(err.status).toBe(500)
    })

    it('normalizes network errors when no response is received', () => {
      const err = normalizeApiError({
        isAxiosError: true,
        code: 'ERR_NETWORK',
        message: 'Network Error',
      })

      expect(err.isNetworkError).toBe(true)
      expect(err.status).toBeUndefined()
    })

    it('normalizes abort and cancellation errors without crashing', () => {
      const err = normalizeApiError({
        isAxiosError: true,
        code: 'ERR_CANCELED',
        name: 'CanceledError',
      })

      expect(err.isAborted).toBe(true)
      expect(err.kind).toBe('abort')
    })
  })

  describe('createApiClient', () => {
    it('injects authorization token and request id', async () => {
      let interceptedHeaders: Record<string, string> = {}

      const client = createApiClient({
        baseURL: 'https://api.example.com',
        getToken: () => 'test-bearer-token',
      })

      client.defaults.adapter = async (config) => {
        interceptedHeaders = {
          Authorization: (config.headers.get?.('Authorization') ||
            config.headers.Authorization) as string,
          'X-Request-ID': (config.headers.get?.('X-Request-ID') ||
            config.headers['X-Request-ID']) as string,
        }
        return {
          data: 'ok',
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }
      }

      await client.get('/test')
      expect(interceptedHeaders.Authorization).toBe('Bearer test-bearer-token')
      expect(interceptedHeaders['X-Request-ID']).toBeTruthy()
    })

    it('triggers onUnauthorized callback on 401 response', async () => {
      const handleUnauthorized = vi.fn()

      const client = createApiClient({
        baseURL: 'https://api.example.com',
        onUnauthorized: handleUnauthorized,
        retryConfig: { retries: 0 },
      })

      // Mock client adapter returning 401
      client.defaults.adapter = async (config) => {
        return Promise.reject({
          isAxiosError: true,
          config,
          response: {
            status: 401,
            data: { message: 'Unauthorized' },
          },
        })
      }

      await expect(client.get('/secure-resource')).rejects.toThrow()
      expect(handleUnauthorized).toHaveBeenCalledTimes(1)
    })

    it('retries safe GET requests on 500 error up to max retries', async () => {
      let callCount = 0

      const client = createApiClient({
        baseURL: 'https://api.example.com',
        retryConfig: {
          retries: 2,
          retryDelay: 10,
          maxRetryDelay: 50,
        },
      })

      client.defaults.adapter = async (config) => {
        callCount++
        if (callCount < 3) {
          return Promise.reject({
            isAxiosError: true,
            config,
            response: { status: 500, data: { message: 'Server down' } },
          })
        }
        return {
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }
      }

      const res = await client.get('/health')
      expect(res.data.success).toBe(true)
      // 1 initial call + 2 retries = 3 calls
      expect(callCount).toBe(3)
    })

    it('does NOT retry non-idempotent POST requests by default', async () => {
      let callCount = 0

      const client = createApiClient({
        baseURL: 'https://api.example.com',
        retryConfig: {
          retries: 3,
          retryDelay: 10,
        },
      })

      client.defaults.adapter = async (config) => {
        callCount++
        return Promise.reject({
          isAxiosError: true,
          config,
          response: { status: 500, data: { message: 'Internal error' } },
        })
      }

      await expect(client.post('/orders', { item: 'Widget' })).rejects.toThrow()
      // Should not retry non-idempotent POST
      expect(callCount).toBe(1)
    })

    it('retries POST request if Idempotency-Key header is explicitly provided', async () => {
      let callCount = 0

      const client = createApiClient({
        baseURL: 'https://api.example.com',
        retryConfig: {
          retries: 2,
          retryDelay: 10,
        },
      })

      client.defaults.adapter = async (config) => {
        callCount++
        if (callCount < 2) {
          return Promise.reject({
            isAxiosError: true,
            config,
            response: { status: 503, data: { message: 'Unavailable' } },
          })
        }
        return {
          data: { orderId: '123' },
          status: 201,
          statusText: 'Created',
          headers: {},
          config,
        }
      }

      const res = await client.post(
        '/payments',
        { amount: 100 },
        { headers: { 'Idempotency-Key': 'key-unique-123' } }
      )

      expect(res.data.orderId).toBe('123')
      expect(callCount).toBe(2)
    })
  })

  describe('queryKeys factory', () => {
    it('produces scoped, hierarchical query key tuples', () => {
      expect(queryKeys.users.all).toEqual(['users'])
      expect(queryKeys.users.lists()).toEqual(['users', 'list'])
      expect(queryKeys.users.list({ role: 'admin' })).toEqual([
        'users',
        'list',
        { role: 'admin' },
      ])
      expect(queryKeys.users.detail('42')).toEqual(['users', 'detail', '42'])
      expect(queryKeys.auth.session()).toEqual(['auth', 'session'])
    })
  })
})
