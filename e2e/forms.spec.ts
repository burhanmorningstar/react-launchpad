import { test, expect } from '@playwright/test'

test.describe('Forms & Validation E2E', () => {
  test('renders login form with accessible inputs and validates submission', async ({
    page,
  }) => {
    await page.goto('/login')

    const emailInput = page.getByLabel('Email')
    const passwordInput = page.getByLabel('Password')
    const submitButton = page.getByRole('button', {
      name: 'Login',
      exact: true,
    })

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()

    // Trigger validation with empty inputs
    await submitButton.click()

    // Expect accessible aria-invalid states
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true')
    await expect(passwordInput).toHaveAttribute('aria-invalid', 'true')

    // Enter invalid email
    await emailInput.fill('invalid-email-address')
    await submitButton.click()

    await expect(emailInput).toHaveAttribute('aria-invalid', 'true')
    // Value is preserved
    await expect(emailInput).toHaveValue('invalid-email-address')
  })

  test('registers account and toggles password visibility safely', async ({
    page,
  }) => {
    await page.goto('/register')

    const nameInput = page.getByLabel('Name')
    const emailInput = page.getByLabel('Email')
    const passwordInput = page.getByLabel('Password', { exact: true })
    const confirmPasswordInput = page.getByLabel('Confirm Password')
    const registerButton = page.getByRole('button', { name: 'Create Account' })

    await expect(nameInput).toBeVisible()
    await expect(emailInput).toBeVisible()

    // Fill form
    await nameInput.fill('John Tester')
    await emailInput.fill('tester@example.com')
    await passwordInput.fill('secret123')
    await confirmPasswordInput.fill('secret123')

    // Toggle password visibility button
    const toggleButton = page
      .getByRole('button', { name: /show password/i })
      .first()
    if (await toggleButton.isVisible()) {
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'text')
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'password')
    }

    await registerButton.click()
  })

  test('preserves filled form values during responsive viewport resize', async ({
    page,
  }) => {
    await page.goto('/login')

    const emailInput = page.getByLabel('Email')
    await emailInput.fill('responsive@example.com')

    // Switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(emailInput).toHaveValue('responsive@example.com')

    // Switch to desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(emailInput).toHaveValue('responsive@example.com')
  })
})
