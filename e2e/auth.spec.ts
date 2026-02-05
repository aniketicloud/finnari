import { test, expect } from '@playwright/test'

/**
 * Authenticated tests - use saved authentication state by default
 *
 * These tests automatically use the auth state saved in playwright/.auth/user.json
 * by Playwright's globalSetup, so the user is already logged in.
 *
 * No need to manually log in - just navigate to protected pages and interact with them.
 */

test.describe('Authenticated User Tests', () => {
  test('should access dashboard when authenticated', async ({ page }) => {
    // Navigate to dashboard - this is a protected route
    await page.goto('/dashboard')

    // Verify the page loaded
    await expect(page).toHaveURL(/\/dashboard/)

    // Example: Check that we're not on the login page
    const loginForm = page.locator('form')
    const isLoginForm = await loginForm
      .locator('input[type="email"]')
      .isVisible()
      .catch(() => false)

    expect(isLoginForm).toBe(false)
  })

  test('should display user information on dashboard', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check if some dashboard content is visible
    // Adjust selectors based on your actual dashboard structure
    const dashboardContent = page.locator('main, [role="main"]')
    await expect(dashboardContent).toBeVisible()
  })

  test('should have valid session cookie', async ({ context }) => {
    // The storage state should have cookies from a valid session
    const cookies = await context.cookies()

    // Check that auth-related cookies exist
    const authCookie = cookies.find((c) => c.name.includes('auth') || c.name.includes('session'))
    expect(authCookie).toBeDefined()
  })

  test('should allow navigation to protected pages', async ({ page }) => {
    // These are example protected routes - adjust to your actual app structure
    const protectedPaths = ['/dashboard']

    for (const path of protectedPaths) {
      await page.goto(path)

      // Should not be redirected to login
      expect(page.url()).not.toContain('/login')
    }
  })

  test('should maintain session across navigation', async ({ page }) => {
    // Navigate to one protected page
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)

    // Navigate to another area while staying authenticated
    // This tests that the session persists
    await page.reload()

    // Should still be on dashboard (not redirected to login)
    expect(page.url()).not.toContain('/login')
  })
})

test.describe('Session Persistence', () => {
  test('should maintain authentication state across page reloads', async ({ page }) => {
    // Go to a protected page
    await page.goto('/dashboard')

    // Reload the page
    await page.reload()

    // Should still be on the same protected page (not redirected to login)
    expect(page.url()).toContain('/dashboard')
    expect(page.url()).not.toContain('/login')
  })

  test('should keep user logged in after open new page', async ({ browser }) => {
    // Create a new context with the same auth state
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    })

    const page = await context.newPage()

    // Navigate to protected page
    await page.goto('/dashboard')

    // Should be authenticated
    await expect(page).toHaveURL(/\/dashboard/)

    await context.close()
  })
})
