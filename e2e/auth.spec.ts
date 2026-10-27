import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should load login page', async ({ page }) => {
    const response = await page.goto('/login')
    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole('button', { name: 'Login', exact: true })
    ).toBeVisible()
  })

  test('keeps discovered dashboard and admin routes protected', async ({
    page,
  }) => {
    for (const path of ['/dashboard', '/admin/users', '/admin/settings']) {
      await page.goto(path)
      await expect(page).toHaveURL(/\/login$/)
      await expect(
        page.getByRole('button', { name: 'Login', exact: true })
      ).toBeVisible()
    }
  })
})
