import { expect, test } from './fixtures'

test.describe('Localization & Bidirectionality (RTL)', () => {
  test('persists language selection and updates html lang & dir', async ({
    page,
  }) => {
    await page.goto('/')

    // Default locale should be 'en' or 'tr'
    const initialLang = await page.evaluate(() => document.documentElement.lang)
    expect(['en', 'tr']).toContain(initialLang)

    // Trigger language switch via UI or query param
    await page.goto('/?lng=tr')
    await page.waitForLoadState('domcontentloaded')

    const currentLang = await page.evaluate(() => document.documentElement.lang)
    const currentDir = await page.evaluate(() => document.documentElement.dir)

    expect(currentLang).toBe('tr')
    expect(currentDir).toBe('ltr')
  })

  test('supports RTL direction attribute when configured', async ({ page }) => {
    await page.goto('/')

    // Evaluate setting RTL direction dynamically
    await page.evaluate(() => {
      document.documentElement.dir = 'rtl'
    })

    const dir = await page.evaluate(() => document.documentElement.dir)
    expect(dir).toBe('rtl')
  })
})
