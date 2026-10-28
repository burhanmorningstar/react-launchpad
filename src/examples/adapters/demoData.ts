import { ApiError } from '@/core/api/errors'
import type { PageResult } from '@/core/api/types'

import { INITIAL_DEMO_USERS, type DemoUser } from '../fixtures/users'

export interface ListUsersParams {
  page?: number
  pageSize?: number
  search?: string
  role?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DemoMetric {
  label: string
  value: number
}

class DemoDataStore {
  private users: DemoUser[] = [...INITIAL_DEMO_USERS]
  private subscribers = new Set<() => void>()

  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  private notify() {
    this.subscribers.forEach((cb) => cb())
  }

  public reset(): void {
    this.users = [...INITIAL_DEMO_USERS]
    this.notify()
  }

  public listUsers(params: ListUsersParams = {}): PageResult<DemoUser> {
    const {
      page = 1,
      pageSize = 10,
      search = '',
      role,
      status,
      sortBy,
      sortOrder = 'asc',
    } = params

    let filtered = [...this.users]

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      filtered = filtered.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.bio && u.bio.toLowerCase().includes(q))
      )
    }

    if (role && role !== 'all') {
      filtered = filtered.filter((u) => u.role === role)
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((u) => u.status === status)
    }

    if (sortBy) {
      filtered.sort((a, b) => {
        const valA = (a as unknown as Record<string, unknown>)[sortBy] ?? ''
        const valB = (b as unknown as Record<string, unknown>)[sortBy] ?? ''
        const comp = String(valA).localeCompare(String(valB))
        return sortOrder === 'desc' ? -comp : comp
      })
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize) || 1
    const startIndex = (page - 1) * pageSize
    const items = filtered.slice(startIndex, startIndex + pageSize)

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    }
  }

  public getUserById(id: string): DemoUser | null {
    return this.users.find((u) => u.id === id) || null
  }

  public createUser(input: {
    firstName: string
    lastName: string
    email: string
    role?: 'admin' | 'user' | 'moderator'
    status?: 'active' | 'inactive' | 'pending'
    bio?: string
  }): DemoUser {
    // Demonstrate deterministic 422 field error when email is already taken
    if (
      input.email.toLowerCase() === 'taken@example.com' ||
      this.users.some(
        (u) => u.email.toLowerCase() === input.email.toLowerCase()
      )
    ) {
      throw new ApiError({
        kind: 'http',
        status: 422,
        message: 'Validation failed for one or more fields',
        fieldErrors: {
          email: 'validation.emailAlreadyExists',
        },
      })
    }

    const newUser: DemoUser = {
      id: `user-${Date.now()}`,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      role: input.role || 'user',
      status: input.status || 'active',
      bio: input.bio || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.users.unshift(newUser)
    this.notify()
    return newUser
  }

  public updateUser(
    id: string,
    patch: Partial<Omit<DemoUser, 'id' | 'createdAt'>>
  ): DemoUser {
    const index = this.users.findIndex((u) => u.id === id)
    if (index === -1) {
      throw new ApiError({
        kind: 'http',
        status: 404,
        message: 'User not found',
      })
    }

    const updated: DemoUser = {
      ...this.users[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    }

    this.users[index] = updated
    this.notify()
    return updated
  }

  public deleteUser(id: string): boolean {
    const initialLen = this.users.length
    this.users = this.users.filter((u) => u.id !== id)
    const deleted = this.users.length < initialLen
    if (deleted) {
      this.notify()
    }
    return deleted
  }

  public deleteUsers(ids: string[]): number {
    const idSet = new Set(ids)
    const initialLen = this.users.length
    this.users = this.users.filter((u) => !idSet.has(u.id))
    const removedCount = initialLen - this.users.length
    if (removedCount > 0) {
      this.notify()
    }
    return removedCount
  }

  public getChartData(): DemoMetric[] {
    return [
      { label: 'Jan', value: 3400 },
      { label: 'Feb', value: 4200 },
      { label: 'Mar', value: 5100 },
      { label: 'Apr', value: 6800 },
      { label: 'May', value: 8500 },
      { label: 'Jun', value: 11200 },
    ]
  }
}

export const demoData = new DemoDataStore()
