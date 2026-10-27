import { expect, test } from '@playwright/test'

for (const preference of [
  null,
  'light',
  'dark',
  'invalid-value',
  'blocked',
] as const) {
  test(`applies the correct theme before the app loads and after refresh: ${preference}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.addInitScript((preference) => {
      if (preference === 'blocked') {
        Object.defineProperty(window, 'localStorage', {
          configurable: true,
          get() {
            throw new DOMException('Denied', 'SecurityError')
          },
        })
      } else if (preference !== null) {
        localStorage.setItem('theme', preference)
      }
    }, preference)
    const expected = preference === 'light' ? 'light' : 'dark'
    // Hold all application JavaScript. The HTML bootstrap must apply the
    // preference before any React/theme effects can run.
    let release: () => void = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() === 'script') await gate
      await route.continue()
    })
    try {
      await page.goto('/', { waitUntil: 'commit' })
      await expect(page.locator('html')).toHaveClass(new RegExp(expected), {
        timeout: 3000,
      })
      const frames = await page.evaluate(
        () =>
          new Promise<string[]>((resolve) => {
            const seen: string[] = []
            const frame = () => {
              seen.push(document.documentElement.className)
              if (seen.length === 3) resolve(seen)
              else requestAnimationFrame(frame)
            }
            requestAnimationFrame(frame)
          })
      )
      expect(
        frames.every((classes) => classes.split(' ').includes(expected))
      ).toBe(true)
    } finally {
      release()
    }
    await page.waitForLoadState('load')
    await expect(
      page.getByRole('heading', { name: 'Your next frontend starts here.' })
    ).toBeVisible()
    await expect(page.locator('html')).toHaveClass(new RegExp(expected))
    await page.unroute('**/*')
    await page.reload()
    await expect(
      page.getByRole('heading', { name: 'Your next frontend starts here.' })
    ).toBeVisible()
    await expect(page.locator('html')).toHaveClass(new RegExp(expected))
    await page.screenshot({
      path: test.info().outputPath(`theme-${preference}.png`),
      fullPage: true,
    })
  })
}

test('respects reduced motion and wraps long text on a narrow screen', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/login')
  const submit = page.getByRole('button', { name: 'Login', exact: true })
  await expect(submit).toBeVisible()
  await expect(submit).toHaveCSS('transition-duration', '0s')
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Your next frontend starts here.' })
  ).toBeVisible()
  await page
    .locator('main > p')
    .last()
    .evaluate((element) => {
      element.textContent = 'A'.repeat(250)
    })
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(360)
  await page.screenshot({
    path: test.info().outputPath('long-text-reduced-motion.png'),
    fullPage: true,
  })
})

for (const theme of ['light', 'dark'] as const) {
  test(`semantic colors, typography and density work together: ${theme}`, async ({
    page,
  }) => {
    await page.addInitScript(
      (theme) => localStorage.setItem('theme', theme),
      theme
    )
    await page.goto('/login')
    const submit = page.getByRole('button', { name: 'Login', exact: true })
    await expect(submit).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    expect(
      await page.evaluate(() => document.fonts.check('16px "Inter Variable"'))
    ).toBe(true)
    const ratios = await page.evaluate(() => {
      const sample = document.createElement('span')
      document.body.append(sample)
      const luminance = (token: string) => {
        sample.style.color = `var(--${token})`
        const values = getComputedStyle(sample)
          .color.match(/[\d.]+/g)!
          .map(Number)
          .slice(0, 3)
        const linear = values.map((channel) => {
          const s = channel / 255
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
        })
        return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
      }
      const pairs = [
        ['foreground', 'background'],
        ['muted-foreground', 'background'],
        ['primary-foreground', 'primary'],
        ['secondary-foreground', 'secondary'],
        ['success-foreground', 'success'],
        ['warning-foreground', 'warning'],
        ['destructive-foreground', 'destructive'],
        ['info-foreground', 'info'],
        ['sidebar-foreground', 'sidebar'],
      ]
      const results = pairs.map(([foreground, background]) => {
        const first = luminance(foreground)
        const second = luminance(background)
        return {
          pair: `${foreground}/${background}`,
          contrast:
            (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05),
        }
      })
      sample.remove()
      return results
    })
    for (const { pair, contrast } of ratios)
      expect(contrast, `${theme} ${pair}`).toBeGreaterThanOrEqual(4.5)
    const before = await submit.evaluate(
      (element) => element.getBoundingClientRect().height
    )
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--density', '1.2')
      document.documentElement.style.setProperty('--primary', '#7c3aed')
    })
    await expect(submit).toHaveCSS('background-color', 'rgb(124, 58, 237)')
    expect(
      await submit.evaluate((element) => element.getBoundingClientRect().height)
    ).toBeGreaterThan(before)
    await page.getByRole('textbox', { name: 'Email' }).focus()
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveCSS(
      'border-color',
      'rgb(124, 58, 237)'
    )
    await page.screenshot({
      path: test.info().outputPath(`controls-${theme}.png`),
      fullPage: true,
    })
  })
}
