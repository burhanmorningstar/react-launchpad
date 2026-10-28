import createClient from 'openapi-fetch'

import { projectConfig } from '@/config/project'
import { getAuthAdapter } from '@/core/auth/adapter'

import type { paths } from './schema'

/**
 * Type-safe API client instance
 * Uses generated OpenAPI types for full type safety
 */
export const api = createClient<paths>({
  baseUrl: projectConfig.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Unified middleware integrating with the shared AuthAdapter
api.use({
  async onRequest({ request }) {
    const token = await getAuthAdapter().getAccessToken?.()
    if (token && !request.headers.has('Authorization')) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    return request
  },
  onResponse({ response }) {
    if (response.status === 401) {
      getAuthAdapter().signOut()
    }
    return response
  },
})

/**
 * Explicit helper to set token if needed
 */
export function setAuthToken(token: string): void {
  api.use({
    onRequest({ request }) {
      request.headers.set('Authorization', `Bearer ${token}`)
      return request
    },
  })
}

/**
 * Clear authorization header (for logout)
 */
export function clearAuthToken(): void {
  getAuthAdapter().signOut()
}

// Re-export types for convenience
export type { paths, components } from './schema'
