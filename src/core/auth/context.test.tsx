import { render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { AuthProvider } from './context'
import { useAuth } from './hooks'

afterEach(() => vi.restoreAllMocks())

it('keeps the starter usable when browser storage is denied', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new DOMException('Denied', 'SecurityError')
  })
  function Session() {
    const { isAuthenticated } = useAuth()
    return <p>{isAuthenticated ? 'Signed in' : 'Anonymous session'}</p>
  }
  render(
    <AuthProvider>
      <Session />
    </AuthProvider>
  )
  expect(screen.getByText('Anonymous session')).toBeVisible()
})
