import dotenv from 'dotenv'
import path from 'path'
import { drizzle } from 'drizzle-orm/node-postgres'
import { sql } from 'drizzle-orm'
import * as schema from '@/drizzle/schema'

// Load .env.test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

/**
 * Global teardown runs once after all tests have completed.
 * 
 * This function cleans up the test database by dropping the public schema,
 * ensuring a clean state for the next test run.
 */
async function globalTeardown() {
  console.log('\n========================================')
  console.log('🧹 PLAYWRIGHT GLOBAL TEARDOWN')
  console.log('========================================\n')

  try {
    if (!process.env.DATABASE_URL) {
      console.log('⚠️  DATABASE_URL not set, skipping cleanup')
      return
    }

    const testDb = drizzle(process.env.DATABASE_URL, { schema })

    console.log('Cleaning up test database...')
    console.log('─'.repeat(40))

    try {
      console.log('🗑️  Dropping public schema...')
      await testDb.execute(sql`DROP SCHEMA public CASCADE`)
      console.log('✅ Schema cleanup completed')
    } catch (error) {
      // It's okay if the schema doesn't exist
      console.log('ℹ️  Schema cleanup skipped (schema may not exist)')
    }

    console.log('\n========================================')
    console.log('✅ GLOBAL TEARDOWN COMPLETED')
    console.log('========================================\n')
  } catch (error) {
    console.error('\n⚠️  TEARDOWN ERROR (non-fatal):')
    console.error(error)
    // Don't exit with error - teardown failures shouldn't block test suite
  }
}

export default globalTeardown
