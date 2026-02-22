import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { chromium, request, FullConfig } from '@playwright/test'
import { setupTestDatabase } from './db-setup'

// Load .env.test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

/**
 * Global setup runs once before all tests.
 *
 * This function:
 * 1. Prepares the test database with fresh schema and seeded test user
 * 2. Authenticates directly via the better-auth API (no browser UI needed)
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

    // Step 2: Generate authentication state by calling the auth API directly
    // This is more reliable than driving the login UI and avoids any UI-related flakiness.
    console.log('\nSTEP 2: Generating authentication state')
    console.log('─'.repeat(40))

    const testEmail = process.env.TEST_USER_EMAIL || 'testuser@example.com'
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123Password!'
    const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3002'

    console.log(`🔑 Signing in as ${testEmail} via API...`)

    // Use Playwright's request context to POST directly to the sign-in endpoint
    const requestContext = await request.newContext({ baseURL })

    const response = await requestContext.post('/api/auth/sign-in/email', {
      data: {
        email: testEmail,
        password: testPassword,
        rememberMe: true,
      },
    })

    if (!response.ok()) {
      const body = await response.text()
      throw new Error(`Sign-in API returned ${response.status()}: ${body}`)
    }

    console.log(`✅ API sign-in successful (HTTP ${response.status()})`)

    // Step 3: Save authentication state (cookies from the API response)
    console.log('\nSTEP 3: Saving authentication state')
    console.log('─'.repeat(40))

    const authDir = path.join(__dirname, '../playwright/.auth')
    const authFile = path.join(authDir, 'user.json')

    // Ensure the .auth directory exists before writing
    fs.mkdirSync(authDir, { recursive: true })

    // Save cookies captured during the API sign-in
    const storageState = await requestContext.storageState({ path: authFile })

    console.log(`💾 Saved authentication state to: ${authFile}`)
    console.log(`   - Cookies: ${storageState.cookies.length}`)
    console.log(`   - LocalStorage: ${storageState.origins.length} origins`)

    await requestContext.dispose()

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
