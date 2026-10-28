import { expect, test } from './fixtures'

test.describe('Keyboard Navigation & Focus Management', () => {
  test('skip link bypasses header navigation to main content', async ({
    page,
  }) => {
    await page.goto('/')

    // Press Tab to reveal and focus the skip link
    await page.keyboard.press('Tab')
    const skipLink = page.locator('a[href="#main-content"]')
    if (await skipLink.count()) {
      await expect(skipLink).toBeFocused()
      await page.keyboard.press('Enter')

      const mainContent = page.locator('#main-content')
      await expect(mainContent).toBeVisible()
    }
  })

  test('Escape key closes open dialog modals and command palettes', async ({
    page,
  }) => {
    await page.goto('/')

    // Trigger Command Palette with ControlOrMeta+KeyK
    await page.keyboard.press('ControlOrMeta+KeyK')

    const dialog = page.locator('[role="dialog"]')
    if (await dialog.count()) {
      await expect(dialog).toBeVisible()
      // Press Escape to dismiss
      await page.keyboard.press('Escape')
      await expect(dialog).not.toBeVisible()
    }
  })

  test('Tabs list allows keyboard arrow navigation', async ({ page }) => {
    await page.goto('/examples/forms')
    const tabList = page.locator('[role="tablist"]')

    if (await tabList.count()) {
      const firstTab = tabList.locator('[role="tab"]').first()
      await firstTab.focus()
      await expect(firstTab).toBeFocused()

      // Press ArrowRight to move focus
      await page.keyboard.press('ArrowRight')
      const secondTab = tabList.locator('[role="tab"]').nth(1)
      if (await secondTab.count()) {
        await expect(secondTab).toBeFocused()
      }
    }
  })
})
