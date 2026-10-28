import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

async function session(
  page: Page,
  role: 'user' | 'admin' = 'admin',
  theme: 'light' | 'dark' = 'light'
) {
  await page.addInitScript(
    ({ role, theme }) => {
      localStorage.setItem('theme', theme)
      localStorage.setItem('language', 'en')
      localStorage.setItem('auth_token', 'local-shell-fixture')
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'shell-fixture',
          name: 'Ada Lovelace',
          email: 'ada@example.test',
          role,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        })
      )
    },
    { role, theme }
  )
}

for (const width of [360, 768, 1440]) {
  for (const theme of ['light', 'dark'] as const) {
    test(`shell adapts at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await session(page, 'admin', theme)
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto('/admin')
      await expect(page.getByRole('main')).toHaveCount(1)
      const mobile = width < 1024
      const trigger = page.getByRole('button', {
        name: mobile ? 'Open navigation' : 'Collapse sidebar',
      })
      await expect(trigger).toBeVisible()
      if (mobile) {
        await expect(page.getByRole('navigation')).toHaveCount(0)
        await trigger.focus()
        await page.keyboard.press('Enter')
        await expect(
          page.getByRole('dialog', { name: 'Navigation' })
        ).toBeVisible()
        const dialog = page.getByRole('dialog')
        for (let i = 0; i < 8; i++) {
          await page.keyboard.press('Tab')
          expect(
            await dialog.evaluate((el) => el.contains(document.activeElement))
          ).toBe(true)
        }
        await page.keyboard.press('Escape')
        await expect(dialog).toHaveCount(0)
        await expect(trigger).toBeFocused()
        await trigger.click()
      } else {
        await expect(page.getByRole('navigation')).toBeVisible()
        await trigger.click()
        await expect(
          page.getByRole('button', { name: 'Expand sidebar' })
        ).toHaveAttribute('aria-expanded', 'false')
        await page.getByRole('button', { name: 'Expand sidebar' }).click()
      }
      await expect(
        page.getByRole('link', { name: 'Dashboard', exact: true })
      ).toHaveAttribute('aria-current', 'page')
      await page.getByRole('link', { name: 'Settings', exact: true }).click()
      await expect(page).toHaveURL(/\/admin\/settings$/)
      if (mobile) {
        await expect(page.getByRole('dialog')).toHaveCount(0)
        await trigger.click()
      }
      await expect(
        page.getByRole('link', { name: 'Settings', exact: true })
      ).toHaveAttribute('aria-current', 'page')
      await expect(
        page.getByRole('link', { name: 'Dashboard', exact: true })
      ).not.toHaveAttribute('aria-current')
      if (mobile) {
        await page.keyboard.press('Escape')
        await expect(page.getByRole('dialog')).toHaveCount(0)
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
      await page.screenshot({
        path: `.tmp/task-6/shell-${width}-${theme}.png`,
        fullPage: true,
      })
      expect(errors).toEqual([])
    })
  }
}

test('breakpoints close mobile navigation, preserve desktop collapse and restore focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await session(page)
  await page.goto('/admin')
  await page.getByRole('button', { name: 'Collapse sidebar' }).click()
  await page.setViewportSize({ width: 768, height: 900 })
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Open navigation' })
  ).toBeFocused()
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Expand sidebar' })
  ).toBeFocused()
  await page.setViewportSize({ width: 360, height: 800 })
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Open navigation' })
  ).toHaveAttribute('aria-expanded', 'false')
})

test('skip link targets main, user navigation is filtered and both layouts share project branding', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await session(page, 'user')
  await page.goto('/dashboard')
  await expect(
    page.getByRole('link', { name: 'React Launchpad', exact: true })
  ).toBeVisible()
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await expect(skip).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  await expect(
    page.getByRole('link', { name: 'Users', exact: true })
  ).toHaveCount(0)
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('navigation')).toBeVisible()
})
