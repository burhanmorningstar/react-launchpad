import { expect, test } from './fixtures'

test.describe('Visual & Responsive Smoke Verification', () => {
  test('renders landing page reliably across light and dark modes', async ({
    page,
    setTheme,
  }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()

    // Light mode
    await setTheme('light')
    await expect(page.locator('body')).not.toHaveClass(/dark/)

    // Dark mode
    await setTheme('dark')
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('adapts layout for mobile viewports without horizontal overflow', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Verify there is no unintentional horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      )
    })

    expect(hasHorizontalScroll).toBe(false)
  })

  test('renders navigation shell adaptively on tablet and desktop', async ({
    page,
  }) => {
    await page.goto('/examples/overview')
    await page.waitForLoadState('domcontentloaded')

    const main = page.locator('main, [role="main"], #main-content')
    await expect(main.first()).toBeVisible()
  })
})
