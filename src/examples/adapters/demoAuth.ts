import type { AuthAdapter } from '@/core/auth/adapter'
import type { AuthState, User, UserRole } from '@/core/auth/types'

const DEFAULT_DEMO_USER: User = {
  id: 'demo-admin-id',
  email: 'admin@launchpad.dev',
  name: 'Demo Administrator',
  role: 'admin',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
}

export interface DemoAuthAdapter extends Omit<AuthAdapter, 'getSession'> {
  getSession: () => AuthState
  switchRole: (role: UserRole) => void
  signInAs: (role: UserRole, email?: string) => void
  reset: () => void
}

export function createDemoAuthAdapter(
  initialUser: User | null = DEFAULT_DEMO_USER
): DemoAuthAdapter {
  let currentState: AuthState = {
    user: initialUser,
    isAuthenticated: Boolean(initialUser),
    isLoading: false,
  }

  const subscribers = new Set<(state: AuthState) => void>()

  const notify = () => {
    subscribers.forEach((cb) => cb({ ...currentState }))
  }

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
      notify()
    },
    getAccessToken: () =>
      currentState.isAuthenticated ? 'demo-in-memory-token' : null,
    setSession: (nextState) => {
      currentState = { ...nextState }
      notify()
    },
    switchRole: (role: UserRole) => {
      if (!currentState.user) {
        currentState = {
          user: {
            ...DEFAULT_DEMO_USER,
            role,
            name:
              role === 'admin' ? 'Demo Administrator' : 'Demo Standard User',
            email: `${role}@launchpad.dev`,
          },
          isAuthenticated: true,
          isLoading: false,
        }
      } else {
        currentState = {
          ...currentState,
          user: {
            ...currentState.user,
            role,
            name:
              role === 'admin' ? 'Demo Administrator' : 'Demo Standard User',
          },
        }
      }
      notify()
    },
    signInAs: (role: UserRole, email?: string) => {
      currentState = {
        user: {
          id: `demo-${role}-id`,
          email: email || `${role}@launchpad.dev`,
          name: role === 'admin' ? 'Demo Administrator' : 'Demo Standard User',
          role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        isAuthenticated: true,
        isLoading: false,
      }
      notify()
    },
    reset: () => {
      currentState = {
        user: DEFAULT_DEMO_USER,
        isAuthenticated: true,
        isLoading: false,
      }
      notify()
    },
  }
}

export const demoAuth = createDemoAuthAdapter()
