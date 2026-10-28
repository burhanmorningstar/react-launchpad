import { expect, test } from './fixtures'

test.describe('Zero Telemetry & External Network Isolation Contract', () => {
  test('landing page makes zero unauthorized external network requests by default', async ({
    page,
  }) => {
    const externalRequests: string[] = []

    page.on('request', (request) => {
      const url = new URL(request.url())
      // Allow localhost, 127.0.0.1, internal test runner origins, and data URLs
      const isLocal =
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.protocol === 'data:' ||
        url.protocol === 'blob:'

      if (!isLocal) {
        externalRequests.push(request.url())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Expect zero external requests (no external fonts, no telemetry, no CDNs)
    expect(externalRequests).toEqual([])
  })

  test('authenticated routes do not leak telemetry when analytics/monitoring are disabled', async ({
    page,
    loginAsDemoUser,
  }) => {
    const externalTelemetryRequests: string[] = []

    page.on('request', (request) => {
      const url = request.url()
      if (
        url.includes('posthog') ||
        url.includes('sentry.io') ||
        url.includes('google-analytics')
      ) {
        externalTelemetryRequests.push(url)
      }
    })

    await loginAsDemoUser()
    await page.waitForLoadState('networkidle')

    expect(externalTelemetryRequests).toEqual([])
  })
})
