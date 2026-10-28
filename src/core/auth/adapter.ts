import { STORAGE_KEYS } from '@/config/constants'

import type { AuthState, User } from './types'

const USER_STORAGE_KEY = 'user'

export interface AuthAdapter {
  getSession: () => Promise<AuthState | null> | AuthState | null
  subscribe: (callback: (state: AuthState) => void) => () => void
  signOut: () => Promise<void> | void
  getAccessToken?: () => Promise<string | null> | string | null
  setSession?: (state: AuthState, token?: string) => Promise<void> | void
}

/**
 * Creates an in-memory mock auth adapter for backend-free testing and demo usage.
 */
export function createMockAuthAdapter(
  initialUser: User | null = null
): AuthAdapter {
  let currentState: AuthState = {
    user: initialUser,
    isAuthenticated: Boolean(initialUser),
    isLoading: false,
  }
  const subscribers = new Set<(state: AuthState) => void>()

  return {
    getSession: () => ({ ...currentState }),
    subscribe: (callback) => {
      subscribers.add(callback)
      callback({ ...currentState })
      return () => {
        subscribers.delete(callback)
      }
    },
    signOut: () => {
      currentState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }
      subscribers.forEach((cb) => cb({ ...currentState }))
    },
    getAccessToken: () =>
      currentState.isAuthenticated ? 'mock-demo-token' : null,
    setSession: (nextState) => {
      currentState = { ...nextState }
      subscribers.forEach((cb) => cb({ ...currentState }))
    },
  }
}

/**
 * Creates a browser-storage backed auth adapter.
 */
export function createStorageAuthAdapter(
  storage: Storage = typeof window !== 'undefined'
    ? window.localStorage
    : (undefined as unknown as Storage)
): AuthAdapter {
  const subscribers = new Set<(state: AuthState) => void>()

  const readStateFromStorage = (): AuthState => {
    if (!storage) {
      return { user: null, isAuthenticated: false, isLoading: false }
    }
    try {
      const userRaw = storage.getItem(USER_STORAGE_KEY)
      const token = storage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      if (userRaw && token) {
        const user = JSON.parse(userRaw) as User
        return { user, isAuthenticated: true, isLoading: false }
      }
    } catch {
      // Ignore storage parse error
    }
    return { user: null, isAuthenticated: false, isLoading: false }
  }

  return {
    getSession: () => readStateFromStorage(),
    subscribe: (callback) => {
      subscribers.add(callback)
      callback(readStateFromStorage())
      return () => {
        subscribers.delete(callback)
      }
    },
    signOut: () => {
      try {
        storage?.removeItem(USER_STORAGE_KEY)
        storage?.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      } catch {
        // Storage access may be blocked
      }
      const nextState = { user: null, isAuthenticated: false, isLoading: false }
      subscribers.forEach((cb) => cb(nextState))
    },
    getAccessToken: () => {
      try {
        return storage?.getItem(STORAGE_KEYS.AUTH_TOKEN) || null
      } catch {
        return null
      }
    },
    setSession: (nextState, token) => {
      try {
        if (nextState.user) {
          storage?.setItem(USER_STORAGE_KEY, JSON.stringify(nextState.user))
          if (token) {
            storage?.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
          }
        } else {
          storage?.removeItem(USER_STORAGE_KEY)
          storage?.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        }
      } catch {
        // Storage access may be blocked
      }
      subscribers.forEach((cb) => cb(nextState))
    },
  }
}

let activeAuthAdapter: AuthAdapter = createStorageAuthAdapter()

export function setAuthAdapter(adapter: AuthAdapter): void {
  activeAuthAdapter = adapter
}

export function getAuthAdapter(): AuthAdapter {
  return activeAuthAdapter
}
