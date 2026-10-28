/**
 * Structured query key factory for TanStack Query.
 * Ensures consistent and type-safe query cache invalidation and scoping.
 */
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
  },
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.users.lists(), { ...(filters || {}) }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...queryKeys.users.details(), id] as const,
  },
  settings: {
    all: ['settings'] as const,
    preferences: () => [...queryKeys.settings.all, 'preferences'] as const,
  },
} as const
