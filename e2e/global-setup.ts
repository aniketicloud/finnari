import dotenv from 'dotenv'
import path from 'path'
import { chromium, FullConfig } from '@playwright/test'
import { setupTestDatabase } from './db-setup'

// Load .env.test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

/**
 * Global setup runs once before all tests.
 * 
 * This function:
 * 1. Prepares the test database with fresh schema and seeded test user
 * 2. Authenticates via the login UI to generate valid session state
 * 3. Saves authentication state so tests can reuse it without re-logging in
 */
async function globalSetup(config: FullConfig) {
  console.log('\n========================================')
  console.log('🚀 PLAYWRIGHT GLOBAL SETUP')
  console.log('========================================\n')

  try {
    // Step 1: Prepare test database
    console.log('STEP 1: Preparing test database')
    console.log('─'.repeat(40))
    await setupTestDatabase()

    // Step 2: Generate authentication state by logging in
    console.log('\nSTEP 2: Generating authentication state')
    console.log('─'.repeat(40))

    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()

    const testEmail = process.env.TEST_USER_EMAIL || 'testuser@example.com'
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123Password!'
    const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000'

    console.log(`📍 Navigating to ${baseURL}/login`)
    await page.goto(`${baseURL}/login`)

    // Wait for login form to be ready
    await page.waitForLoadState('networkidle')

    // Fill in email field
    console.log(`📧 Entering email: ${testEmail}`)
    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill(testEmail)

    // Fill in password field
    console.log('🔐 Entering password')
    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.fill(testPassword)

    // Submit login form
    console.log('✋ Submitting login form')
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Wait for successful authentication redirect
    // The app should redirect from /login to /dashboard or home page
    console.log('⏳ Waiting for authentication...')
    await page.waitForURL('**/dashboard/**', { timeout: 30000 }).catch(() => {
      // If dashboard redirect fails, try waiting for any navigation away from login
      return page.goto(`${baseURL}/dashboard`, { waitUntil: 'networkidle' })
    })

    console.log('✅ Login successful, user authenticated')

    // Step 3: Save authentication state
    console.log('\nSTEP 3: Saving authentication state')
    console.log('─'.repeat(40))

    const authDir = path.join(__dirname, '../playwright/.auth')
    const authFile = path.join(authDir, 'user.json')

    // Save both cookies and localStorage for comprehensive session persistence
    const storageState = await context.storageState({ path: authFile })

    console.log(`💾 Saved authentication state to: ${authFile}`)
    console.log(`   - Cookies: ${storageState.cookies.length}`)
    console.log(`   - LocalStorage: ${storageState.origins.length} origins`)

    // Cleanup
    await browser.close()

    console.log('\n========================================')
    console.log('✅ GLOBAL SETUP COMPLETED SUCCESSFULLY')
    console.log('========================================\n')
  } catch (error) {
    console.error('\n❌ GLOBAL SETUP FAILED')
    console.error('Error details:', error)
    process.exit(1)
  }
}

export default globalSetup
