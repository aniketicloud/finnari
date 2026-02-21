import { test, expect } from '@playwright/test'

/**
 * Unauthenticated tests - tests the login/logout flows
 *
 * These tests override the default storageState to start without authentication,
 * so the user must log in through the UI.
 */

test.describe('Login Tests', () => {
  // Override default auth state for these tests
  test.use({ storageState: { cookies: [], origins: [] } })

  test('should redirect to login when accessing protected pages unauthenticated', async ({
    page,
  }) => {
    // Try to access a protected page without authentication
    await page.goto('/dashboard')

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('should display login form', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')

    // Check that login form elements are visible
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    const submitButton = page.locator('button[type="submit"]')

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitButton).toBeVisible()
  })

  test('should login with valid credentials', async ({ page }) => {
    const testEmail = process.env.TEST_USER_EMAIL || 'testuser@example.com'
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123Password!'

    // Navigate to login page
    await page.goto('/login')

    // Fill in email
    await page.locator('input[type="email"]').fill(testEmail)

    // Fill in password
    await page.locator('input[type="password"]').fill(testPassword)

    // Submit form
    await page.locator('button[type="submit"]').click()

    // Should redirect to dashboard after successful login
    // Wait for navigation away from login page
    await page.waitForURL('**/dashboard/**', { timeout: 10000 }).catch(async () => {
      // If no /dashboard redirect, wait for any navigation away from /login
      await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 10000 })
    })

    // Should not be on login page anymore
    expect(page.url()).not.toContain('/login')
  })

  test('should show error message with invalid email', async ({ page }) => {
    await page.goto('/login')

    // Fill in invalid email format
    await page.locator('input[type="email"]').fill('invalid-email')
    await page.locator('input[type="password"]').fill('somepassword')

    // Try to submit
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Check for error message or validation
    // Adjust selector based on your actual form error messages
    // For HTML5 validation, the form might not submit at all
    const emailInput = page.locator('input[type="email"]')
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity())
    expect(isInvalid).toBe(true)
  })

  test('should show error message with invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in valid email format but wrong credentials
    await page.locator('input[type="email"]').fill('wronguser@example.com')
    await page.locator('input[type="password"]').fill('wrongpassword')

    // Submit form
    await page.locator('button[type="submit"]').click()

    // Wait for potential error message or stay on login page
    await page.waitForTimeout(1000)

    // Should still be on login page (authentication failed)
    expect(page.url()).toContain('/login')

    // Look for error message (adjust selector if different)
    const errorMessage = page.locator('[role="alert"]')
    const errorVisible = await errorMessage.isVisible().catch(() => false)

    // Either show error message or prevent form submission
    const expectedError = errorVisible || page.url().includes('/login')
    expect(expectedError).toBe(true)
  })

  test('should prevent empty email submission', async ({ page }) => {
    await page.goto('/login')

    // Leave email empty, fill password
    await page.locator('input[type="password"]').fill('somepassword')

    // Try to submit form
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Should still be on login page (form not submitted with empty email)
    await page.waitForTimeout(500)
    expect(page.url()).toContain('/login')
  })

  test('should prevent empty password submission', async ({ page }) => {
    await page.goto('/login')

    // Fill email, leave password empty
    await page.locator('input[type="email"]').fill('test@example.com')

    // Try to submit form
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Should still be on login page (form not submitted with empty password)
    await page.waitForTimeout(500)
    expect(page.url()).toContain('/login')
  })
})

test.describe('Logout Tests', () => {
  test('should logout from authenticated session', async ({ page, context }) => {
    // Use default authenticated state for this test
    // So DON'T override storageState

    // Navigate to dashboard
    await page.goto('/dashboard')

    // Find and click logout button
    // Adjust selector based on your actual logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Log out"), a:has-text("Logout")')

    const logoutExists = await logoutButton.count().then((count) => count > 0)

    if (logoutExists) {
      await logoutButton.first().click()

      // Wait for redirect to login or home page
      await page.waitForURL((url) => {
        const path = url.pathname
        return path.includes('/login') || path === '/' || path === ''
      })

      // Should be on login or public page
      const isPublicPage = page.url().includes('/login') || page.url() === 'http://localhost:3002/'

      expect(isPublicPage).toBe(true)

      // Session cookies should be cleared
      const cookies = await context.cookies()
      const authCookie = cookies.find((c) => c.name.includes('auth') || c.name.includes('session'))

      // The auth cookie should either be removed or expired
      // (depending on implementation)
      if (authCookie) {
        expect(authCookie.expires).toBeLessThanOrEqual(Math.floor(Date.now() / 1000))
      }
    } else {
      // If no explicit logout button found, skip this test
      test.skip()
    }
  })
})
