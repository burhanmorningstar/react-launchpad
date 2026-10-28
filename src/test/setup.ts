import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'

import { server } from './mocks/server'

if (typeof window !== 'undefined' && !globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
}

if (
  typeof window !== 'undefined' &&
  !window.HTMLElement.prototype.scrollIntoView
) {
  window.HTMLElement.prototype.scrollIntoView = function () {}
}

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// MSW setup - Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers()
})

// Stop server after all tests
afterAll(() => {
  server.close()
})
