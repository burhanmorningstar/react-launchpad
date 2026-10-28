import { expect, test } from './fixtures'

test.describe('Automated Accessibility (axe-core)', () => {
  test('landing page (/) has no critical or serious a11y violations', async ({
    page,
    makeAxeBuilder,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const accessibilityScanResults = await makeAxeBuilder().analyze()
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(seriousViolations).toEqual([])
  })

  test('login page (/login) has no critical or serious a11y violations', async ({
    page,
    makeAxeBuilder,
  }) => {
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    const accessibilityScanResults = await makeAxeBuilder().analyze()
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(seriousViolations).toEqual([])
  })

  test('protected dashboard (/dashboard) has no critical or serious a11y violations', async ({
    page,
    loginAsDemoUser,
    makeAxeBuilder,
  }) => {
    await loginAsDemoUser()
    await page.waitForLoadState('domcontentloaded')

    const accessibilityScanResults = await makeAxeBuilder().analyze()
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(seriousViolations).toEqual([])
  })

  test('examples tables page (/examples/tables) has no critical or serious a11y violations', async ({
    page,
    makeAxeBuilder,
  }) => {
    await page.goto('/examples/tables')
    await page.waitForLoadState('domcontentloaded')

    const accessibilityScanResults = await makeAxeBuilder().analyze()
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(seriousViolations).toEqual([])
  })

  test('examples forms page (/examples/forms) has no critical or serious a11y violations', async ({
    page,
    makeAxeBuilder,
  }) => {
    await page.goto('/examples/forms')
    await page.waitForLoadState('domcontentloaded')

    const accessibilityScanResults = await makeAxeBuilder().analyze()
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(seriousViolations).toEqual([])
  })

  test('examples files page (/examples/files) has no critical or serious a11y violations', async ({
    page,
    makeAxeBuilder,
  }) => {
    await page.goto('/examples/files')
    await page.waitForLoadState('domcontentloaded')

    const accessibilityScanResults = await makeAxeBuilder().analyze()
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(seriousViolations).toEqual([])
  })
})
