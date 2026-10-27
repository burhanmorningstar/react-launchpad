import { expect, test } from '@playwright/test'

test('starts without a backend or external services and recovers from 404', async ({
  page,
  context,
  baseURL,
}) => {
  const origin = new URL(baseURL!).origin
  const externalRequests: string[] = []
  const dataRequests: string[] = []
  const browserErrors: string[] = []
  const httpErrors: string[] = []
  const consoleMessages: string[] = []
  page.on('console', (message) => {
    consoleMessages.push(`${message.type()}: ${message.text()}`)
    if (message.type() === 'error' || message.type() === 'warning')
      browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))
  page.on('response', (response) => {
    if (response.status() >= 400)
      httpErrors.push(`${response.status()} ${response.url()}`)
  })
  await context.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (['http:', 'https:'].includes(url.protocol) && url.origin !== origin) {
      externalRequests.push(request.url())
      await route.abort()
      return
    }
    // Startup needs only document, stylesheet and script assets, never data.
    if (
      url.pathname.startsWith('/api/') ||
      ['xhr', 'fetch', 'ping', 'eventsource'].includes(request.resourceType())
    )
      dataRequests.push(request.url())
    await route.continue()
  })

  try {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: 'Your next frontend starts here.' })
    ).toBeVisible()
    await expect(page).toHaveURL(`${origin}/`)
    await expect(page.getByText('No backend required')).toBeVisible()
    await page.screenshot({
      path: test.info().outputPath('welcome.png'),
      fullPage: true,
    })
    await page.reload()
    await expect(
      page.getByRole('heading', { name: 'Your next frontend starts here.' })
    ).toBeVisible()
    await page.goto('/a-page-that-does-not-exist')
    await expect(
      page.getByRole('heading', { name: 'Page not found' })
    ).toBeVisible()
    await page.getByRole('link', { name: 'Back to home' }).click()
    await expect(
      page.getByRole('heading', { name: 'Your next frontend starts here.' })
    ).toBeVisible()
    expect(
      await page.evaluate(
        async () => (await navigator.serviceWorker.getRegistrations()).length
      )
    ).toBe(0)
    await page.waitForLoadState('networkidle')
    expect(externalRequests).toEqual([])
    expect(dataRequests).toEqual([])
    expect(browserErrors, consoleMessages.join('\n')).toEqual([])
    expect(httpErrors).toEqual([])
  } finally {
    await test.info().attach('startup-diagnostics', {
      body: JSON.stringify(
        {
          externalRequests,
          dataRequests,
          browserErrors,
          httpErrors,
          consoleMessages,
        },
        null,
        2
      ),
      contentType: 'application/json',
    })
  }
})
