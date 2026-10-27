import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('optional public API configuration', () => {
  it.each([undefined, '', '   '])(
    'allows an absent or empty API URL (%s)',
    async (value) => {
      vi.stubEnv('VITE_API_URL', value)
      vi.resetModules()
      const { env } = await import('./env')
      expect(env.API_URL).toBeUndefined()
    }
  )

  it('preserves an explicitly configured public API URL', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.test/v1')
    vi.resetModules()
    const { env } = await import('./env')
    expect(env.API_URL).toBe('https://api.example.test/v1')
  })
})
