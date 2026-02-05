import dotenv from 'dotenv'
import path from 'path'
import { execSync } from 'child_process'
import { drizzle } from 'drizzle-orm/node-postgres'
import { sql } from 'drizzle-orm'
import * as schema from '@/drizzle/schema'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

// Load .env.test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

// Validate that test database URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable not set. Please check .env.test')
}

/**
 * Sets up the test database with:
 * 1. Fresh schema (drops and recreates)
 * 2. Runs all migrations
 * 3. Seeds a test user with email/password credentials
 * 
 * Uses better-auth's internal adapter API to seed the user, ensuring
 * compatibility with the authentication system (password hashing, account linking).
 */
export async function setupTestDatabase() {
  console.log('🗄️  Setting up test database...')

  try {
    // Initialize Drizzle ORM connection to test database
    console.log('📦 Connecting to test database...')
    const testDb = drizzle(process.env.DATABASE_URL!, { schema })

    // Reset database schema (drop and recreate public schema)
    console.log('🔄 Resetting database schema...')
    try {
      await testDb.execute(sql`DROP SCHEMA public CASCADE`)
      console.log('  ✓ Dropped existing schema')
    } catch (error) {
      // Schema might not exist on first run
      console.log('  ℹ️  Schema did not exist (first run?)')
    }

    await testDb.execute(sql`CREATE SCHEMA public`)
    console.log('  ✓ Created fresh schema')

    // Run migrations to set up the database schema
    console.log('⚙️  Running database migrations...')
    try {
      execSync('npm run db:push', {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      })
      console.log('  ✓ Migrations completed')
    } catch (error) {
      console.error('  ✗ Migration failed:', error)
      throw error
    }

    // Seed test user using better-auth's internal adapter
    console.log('👤 Seeding test user...')
    const testEmail = process.env.TEST_USER_EMAIL || 'testuser@example.com'
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123Password!'

    try {
      // Initialize better-auth with the test database connection
      const authService = betterAuth({
        database: drizzleAdapter(testDb, {
          provider: 'pg',
        }),
        emailAndPassword: {
          enabled: true,
          disableSignUp: true, // Cannot use signup endpoint, must seed directly
        },
        session: {
          cookieCache: {
            enabled: true,
            maxAge: 3 * 60 * 60,
          },
        },
      })

      // Access internal adapter and password hashing from auth context
      const context = await authService.$context
      const internalAdapter = context.internalAdapter
      const passwordHasher = context.password

      // Check if user already exists
      const existingUser = await internalAdapter.findUserByEmail(testEmail)
      if (existingUser) {
        console.log(`  ℹ️  Test user already exists: ${testEmail}`)
        return
      }

      // Create user with better-auth's internal adapter
      // This ensures all internal fields (id, createdAt, updatedAt) are properly set
      const newUser = await internalAdapter.createUser({
        email: testEmail,
        emailVerified: true, // Auto-verify for testing
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      console.log(`  ✓ Created user: ${testEmail}`)

      // Hash password and link account with email/password provider
      // This allows the user to log in with email + password
      const hashedPassword = await passwordHasher.hash(testPassword)

      await internalAdapter.linkAccount({
        accountId: newUser.id,
        providerId: 'credential', // better-auth uses 'credential' for email/password
        password: hashedPassword,
        userId: newUser.id,
      })

      console.log(`  ✓ Linked email/password credentials`)
      console.log(`  ✓ Test user ready for login: ${testEmail}`)
    } catch (error) {
      console.error('  ✗ Failed to seed test user:', error)
      throw error
    }

    console.log('✅ Test database setup completed successfully!\n')
  } catch (error) {
    console.error('❌ Database setup failed:\n', error)
    process.exit(1)
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupTestDatabase()
    .then(() => {
      console.log('Database setup complete. You can now run tests.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Setup failed:', error)
      process.exit(1)
    })
}
