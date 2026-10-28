import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createMockAuthAdapter,
  createStorageAuthAdapter,
  getAuthAdapter,
  setAuthAdapter,
} from './adapter'

import type { AuthState, User } from './types'

describe('AuthAdapter', () => {
  afterEach(() => {
    setAuthAdapter(createStorageAuthAdapter())
    localStorage.clear()
  })
  const dummyUser: User = {
    id: 'user-1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }

  describe('createMockAuthAdapter', () => {
    it('manages session and notifies subscribers', () => {
      const adapter = createMockAuthAdapter(dummyUser)
      const subscriber = vi.fn()

      const unsubscribe = adapter.subscribe(subscriber)
      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({
          isAuthenticated: true,
          user: dummyUser,
        })
      )

      adapter.signOut()
      expect(subscriber).toHaveBeenLastCalledWith(
        expect.objectContaining({
          isAuthenticated: false,
          user: null,
        })
      )

      unsubscribe()
      adapter.setSession?.({
        user: dummyUser,
        isAuthenticated: true,
        isLoading: false,
      })
      // Subscriber was unsubscribed, so count does not increase
      expect(subscriber).toHaveBeenCalledTimes(2)
    })
  })

  describe('createStorageAuthAdapter', () => {
    it('persists and clears storage correctly', () => {
      const mockStorage = {
        store: {} as Record<string, string>,
        getItem(key: string) {
          return this.store[key] || null
        },
        setItem(key: string, val: string) {
          this.store[key] = val
        },
        removeItem(key: string) {
          delete this.store[key]
        },
        clear() {
          this.store = {}
        },
      }

      mockStorage.setItem('auth_token', 'token-123')
      mockStorage.setItem('user', JSON.stringify(dummyUser))

      const adapter = createStorageAuthAdapter(
        mockStorage as unknown as Storage
      )
      const session = adapter.getSession() as {
        isAuthenticated: boolean
        user: User
      }

      expect(session.isAuthenticated).toBe(true)
      expect(session.user.email).toBe('ada@example.com')
      expect(adapter.getAccessToken?.()).toBe('token-123')

      adapter.signOut()
      const afterSignOut = adapter.getSession() as AuthState
      expect(afterSignOut.isAuthenticated).toBe(false)
      expect(mockStorage.getItem('auth_token')).toBeNull()
    })
  })

  describe('setAuthAdapter / getAuthAdapter', () => {
    it('allows global adapter dependency injection', () => {
      const custom = createMockAuthAdapter(null)
      setAuthAdapter(custom)
      expect(getAuthAdapter()).toBe(custom)
    })
  })
})
