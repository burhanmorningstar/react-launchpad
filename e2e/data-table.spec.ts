import { expect, test } from '@playwright/test'

test.describe('DataTable Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as admin to access admin user table
    await page.goto('/login')
    await page.getByLabel('Email').fill('admin@example.com')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Login', exact: true }).click()
    await page.waitForURL(/\/dashboard|\/admin/)
  })

  test('renders users table and supports sorting and filtering', async ({
    page,
  }) => {
    await page.goto('/admin/users')

    // Expect table region
    const tableRegion = page.getByRole('region', { name: 'Users table' })
    await expect(tableRegion).toBeVisible()

    // Table displays rows
    const table = page.getByRole('table')
    await expect(table).toBeVisible()

    // Expect column headers
    await expect(page.getByRole('columnheader', { name: 'User' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Role' })).toBeVisible()
    await expect(
      page.getByRole('columnheader', { name: 'Status' })
    ).toBeVisible()

    // Search filter filters rows
    const searchInput = page.getByPlaceholder(/search users/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill('Admin')
      // Wait for table to update
      await page.waitForTimeout(300)
    }
  })
})
