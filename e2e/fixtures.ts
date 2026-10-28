/* eslint-disable react-hooks/rules-of-hooks */
import AxeBuilder from '@axe-core/playwright'
import { expect, test as base } from '@playwright/test'

export interface LaunchpadFixtures {
  makeAxeBuilder: () => AxeBuilder
  loginAsDemoUser: () => Promise<void>
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>
  setLocale: (locale: 'en' | 'tr') => Promise<void>
}

export const test = base.extend<LaunchpadFixtures>({
  makeAxeBuilder: async ({ page }, use) => {
    const makeBuilder = () =>
      new AxeBuilder({ page }).withTags([
        'wcag2a',
        'wcag2aa',
        'wcag21a',
        'wcag21aa',
      ])
    await use(makeBuilder)
  },

  loginAsDemoUser: async ({ page }, use) => {
    await use(async () => {
      await page.goto('/login')
      await page.fill('input[type="email"]', 'user@example.com')
      await page.fill('input[type="password"]', 'password')
      await page.click('button[type="submit"]')
      await page.waitForURL('**/dashboard', { timeout: 10000 })
    })
  },

  setTheme: async ({ page }, use) => {
    await use(async (theme: 'light' | 'dark' | 'system') => {
      await page.evaluate((t) => {
        localStorage.setItem('theme', t)
        if (t === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }, theme)
    })
  },

  setLocale: async ({ page }, use) => {
    await use(async (locale: 'en' | 'tr') => {
      await page.evaluate((l) => {
        localStorage.setItem('preferred-locale', l)
        document.documentElement.lang = l
      }, locale)
    })
  },
})

export { expect }
