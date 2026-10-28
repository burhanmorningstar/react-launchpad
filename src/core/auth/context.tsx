import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import { getAuthAdapter, type AuthAdapter } from './adapter'

import type { AuthState, User } from './types'

export interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: User) => void
  adapter: AuthAdapter
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export interface AuthProviderProps {
  children: ReactNode
  adapter?: AuthAdapter
}

export function AuthProvider({
  children,
  adapter: customAdapter,
}: AuthProviderProps) {
  const adapter = customAdapter || getAuthAdapter()

  const [state, setState] = useState<AuthState>(() => {
    try {
      const initial = adapter.getSession()
      if (
        initial &&
        typeof (initial as Promise<AuthState>).then !== 'function'
      ) {
        return initial as AuthState
      }
    } catch {
      // Storage access blocked or denied
    }
    return { user: null, isAuthenticated: false, isLoading: false }
  })

  useEffect(() => {
    const unsubscribe = adapter.subscribe((nextState) => {
      setState(nextState)
    })
    return () => {
      unsubscribe()
    }
  }, [adapter])

  const login = useCallback(
    (token: string, user: User) => {
      const nextState: AuthState = {
        user,
        isAuthenticated: true,
        isLoading: false,
      }
      adapter.setSession?.(nextState, token)
    },
    [adapter]
  )

  const logout = useCallback(() => {
    adapter.signOut()
  }, [adapter])

  const updateUser = useCallback(
    (user: User) => {
      const nextState: AuthState = {
        user,
        isAuthenticated: true,
        isLoading: false,
      }
      adapter.setSession?.(nextState)
    },
    [adapter]
  )

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, updateUser, adapter }}
    >
      {children}
    </AuthContext.Provider>
  )
}
