import { expect, test } from './fixtures'

test.describe('Production Preview & SPA Deep-Linking Fallback', () => {
  test('directly navigates to deep example tables route without 404', async ({
    page,
  }) => {
    const response = await page.goto('/examples/tables')
    expect(response?.status()).toBeLessThan(400)

    await page.waitForLoadState('domcontentloaded')
    // Verify content rendered properly
    const heading = page.locator('h1, h2, [role="heading"]').first()
    await expect(heading).toBeVisible()
  })

  test('directly navigates to login route without 404', async ({ page }) => {
    const response = await page.goto('/login')
    expect(response?.status()).toBeLessThan(400)

    await page.waitForLoadState('domcontentloaded')
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()
  })

  test('directly navigates to examples forms route without 404', async ({
    page,
  }) => {
    const response = await page.goto('/examples/forms')
    expect(response?.status()).toBeLessThan(400)

    await page.waitForLoadState('domcontentloaded')
    const formHeading = page.locator('h1, h2, [role="heading"]').first()
    await expect(formHeading).toBeVisible()
  })
})
