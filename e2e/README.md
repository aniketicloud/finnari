# E2E Testing Guide

Comprehensive guide for running and writing end-to-end tests for Finnari using Playwright with database isolation and authentication state management.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Database Management](#database-management)
- [Authentication Flow](#authentication-flow)
- [Troubleshooting](#troubleshooting)
- [Configuration](#configuration)

---

## Overview

The E2E test suite features:

- **Database Isolation** — Separate PostgreSQL instance on port 5437 for tests
- **Automatic Reset** — Fresh database schema before each test run
- **Authentication State Reuse** — Login once, reuse session across all tests
- **Better-Auth Integration** — Test user seeded directly via internal adapter API
- **Serial Execution** — Single worker to prevent database conflicts
- **Comprehensive Logging** — Detailed console output for debugging

## Prerequisites

### Required

1. **Docker** — For running PostgreSQL test database
2. **Node.js 20+** — With npm installed
3. **Dependencies Installed** — Run `npm install`

### Environment Setup

Ensure you have the following files:

- `.env.test` — Test environment configuration (included in repo)
- `.env` — Development environment configuration

## Quick Start

### 1. Start Docker Containers

```bash
npm run db:local:docker-up
```

This starts both development (`localhost:5436`) and test (`localhost:5437`) PostgreSQL databases.

### 2. Run All Tests

```bash
npm run test:e2e
```

This will:
1. Reset test database schema
2. Run migrations
3. Seed test user (`testuser@example.com`)
4. Automate login and save auth state
5. Execute all tests across 3 browsers
6. Generate HTML report

### 3. View Test Report

If tests fail or you want to see detailed results:

```bash
npx playwright show-report
```

---

## Test Structure

```
e2e/
├── README.md                 # This file
├── db-setup.ts              # Database reset, migration, and seeding
├── global-setup.ts          # Pre-test: DB setup + auth state generation
├── global-teardown.ts       # Post-test: Database cleanup
├── auth.spec.ts             # Authenticated user flow tests
├── login.spec.ts            # Login/logout flow tests (unauthenticated)
└── example.spec.ts          # Playwright examples (can be deleted)

playwright/.auth/
└── user.json                # Saved authentication state (auto-generated)
```

### Test Categories

| File | Description | Auth State |
|------|-------------|------------|
| `auth.spec.ts` | Tests for authenticated users (dashboard, protected routes) | ✅ Pre-authenticated |
| `login.spec.ts` | Login/logout flows, form validation | ❌ Starts unauthenticated |

---

## Running Tests

### All Tests

```bash
npm run test:e2e
```

Runs all tests in headless mode across Chromium, Firefox, and WebKit.

### Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

Runs tests with visible browser windows — useful for debugging.

### UI Mode (Interactive)

```bash
npm run test:e2e:ui
```

Opens Playwright's interactive test UI for step-by-step debugging.

### Debug Mode

```bash
npm run test:e2e:debug
```

Runs tests with Playwright Inspector for breakpoint debugging.

### Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Specific Test File

```bash
npx playwright test auth.spec.ts
npx playwright test login.spec.ts
```

### Single Test

```bash
npx playwright test -g "should access dashboard"
```

---

## Writing Tests

### Authenticated Tests

Most tests should use the default authenticated state:

```typescript
import { test, expect } from '@playwright/test'

test('should access protected page', async ({ page }) => {
  // Already logged in! Just navigate to protected pages
  await page.goto('/dashboard')
  
  await expect(page).toHaveURL(/\/dashboard/)
  // Add your assertions here
})
```

**Key Points:**
- No need to log in manually
- Auth state is loaded automatically from `playwright/.auth/user.json`
- Tests start with active session cookies

### Unauthenticated Tests

For testing login/logout flows, override the storage state:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Login Tests', () => {
  // Override default auth state for this test suite
  test.use({ storageState: { cookies: [], origins: [] } })

  test('should login successfully', async ({ page }) => {
    await page.goto('/login')
    
    // Fill login form
    await page.locator('input[type="email"]').fill('testuser@example.com')
    await page.locator('input[type="password"]').fill('Test123Password!')
    
    // Submit
    await page.locator('button[type="submit"]').click()
    
    // Verify redirect
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
```

### Using Environment Variables

Test credentials are in `.env.test`:

```typescript
const testEmail = process.env.TEST_USER_EMAIL || 'testuser@example.com'
const testPassword = process.env.TEST_USER_PASSWORD || 'Test123Password!'
```

### Common Patterns

#### Navigation
```typescript
await page.goto('/dashboard')           // Uses baseURL from config
await page.goto('/categories')
```

#### Form Interaction
```typescript
await page.locator('input[name="email"]').fill('test@example.com')
await page.locator('button[type="submit"]').click()
```

#### Assertions
```typescript
await expect(page).toHaveURL(/\/dashboard/)
await expect(page.locator('h1')).toHaveText('Dashboard')
await expect(page.locator('.error')).toBeVisible()
```

#### Waiting
```typescript
await page.waitForLoadState('networkidle')
await page.waitForURL('**/dashboard/**')
await page.waitForSelector('.data-loaded')
```

---

## Database Management

### Automatic Lifecycle

The test database follows this lifecycle:

1. **Global Setup** (before all tests):
   - DROP SCHEMA public CASCADE
   - CREATE SCHEMA public
   - Run migrations (`npm run db:push`)
   - Seed test user

2. **Test Execution**:
   - Tests run with seeded data
   - Serial execution (1 worker) prevents conflicts

3. **Global Teardown** (after all tests):
   - DROP SCHEMA public CASCADE (cleanup)

### Manual Database Setup

If you need to manually prepare the test database:

```bash
npm run db:test:setup
```

This runs `e2e/db-setup.ts` directly without running tests.

### Inspecting Test Database

**Using Drizzle Studio:**
```bash
# Temporarily change DATABASE_URL in .env to test DB
DATABASE_URL=postgresql://postgres:password@localhost:5437/finnari-test npm run db:studio
```

**Using psql:**
```bash
psql postgresql://postgres:password@localhost:5437/finnari-test
```

### Test User Credentials

Created automatically during setup:

```
Email: testuser@example.com
Password: Test123Password!
```

To change credentials, update `.env.test`:
```env
TEST_USER_EMAIL=mytest@example.com
TEST_USER_PASSWORD=MySecurePassword123!
```

---

## Authentication Flow

### How Auth State Works

1. **Global Setup** logs in once before all tests:
   ```
   Launch Browser → Navigate to /login → Fill form → Submit → Wait for redirect → Save cookies
   ```

2. **Auth state saved** to `playwright/.auth/user.json`:
   ```json
   {
     "cookies": [
       { "name": "better-auth.session_token", "value": "..." },
       { "name": "...", "value": "..." }
     ],
     "origins": []
   }
   ```

3. **Tests load auth state** automatically:
   - Playwright config has `storageState: 'playwright/.auth/user.json'`
   - Every test starts with session cookies already set
   - No need to log in again

### Session Persistence

Sessions persist across:
- ✅ Page navigation
- ✅ Page reloads
- ✅ Different test files
- ✅ Browser context switches (within same test run)

Sessions do NOT persist across:
- ❌ Different test runs (auth state regenerated each time)
- ❌ Tests that override `storageState`

### Better-Auth Integration

Test user is created using better-auth's internal adapter API:

```typescript
// From e2e/db-setup.ts
const context = await authService.$context
const internalAdapter = context.internalAdapter
const passwordHasher = context.password

// Create user
const newUser = await internalAdapter.createUser({
  email: testEmail,
  emailVerified: true,
  name: 'Test User',
})

// Link credentials
const hashedPassword = await passwordHasher.hash(testPassword)
await internalAdapter.linkAccount({
  accountId: newUser.id,
  providerId: 'credential',  // email/password provider
  password: hashedPassword,
  userId: newUser.id,
})
```

This ensures compatibility with better-auth's authentication system.

---

## Troubleshooting

### Test Database Connection Failed

**Error:** `failed to connect to database`

**Solution:**
```bash
# Ensure Docker containers are running
docker ps

# Start containers if not running
npm run db:local:docker-up

# Verify test DB is accessible
docker exec -it finnari-db-test-1 psql -U postgres -d finnari-test -c "SELECT 1"
```

### Global Setup Failed

**Error:** `globalSetup: Navigation failed`

**Possible Causes:**
1. **Dev server not running** — webServer in playwright.config.ts should auto-start
2. **Port conflict** — Port 3000 already in use
3. **Database not ready** — Test DB not accepting connections

**Solution:**
```bash
# Check if port 3000 is available
netstat -ano | findstr :3002  # Windows
lsof -i :3002                 # Mac/Linux

# Manually start dev server to check for errors
npm run dev

# Check database connectivity
psql postgresql://postgres:password@localhost:5437/finnari-test
```

### Authentication State Not Saved

**Error:** `storageState file not found`

**Solution:**
```bash
# Ensure .auth directory exists
mkdir -p playwright/.auth

# Re-run global setup
npm run test:e2e
```

### Tests Timing Out

**Error:** `Test timeout of 30000ms exceeded`

**Solution:**
1. Increase timeout in test:
   ```typescript
   test.setTimeout(60000)  // 60 seconds
   ```

2. Or in config:
   ```typescript
   // playwright.config.ts
   timeout: 60 * 1000,
   ```

### Database Schema Out of Sync

**Error:** `relation "user" does not exist`

**Solution:**
```bash
# Force push schema to test DB
DATABASE_URL=postgresql://postgres:password@localhost:5437/finnari-test npm run db:push

# Or manually re-run setup
npm run db:test:setup
```

### Parallel Execution Issues

**Error:** Tests interfering with each other

**Solution:**
Already configured in `playwright.config.ts`:
```typescript
fullyParallel: false,
workers: 1,
```

This ensures serial execution to avoid database conflicts.

---

## Configuration

### Playwright Config

Key settings in `playwright.config.ts`:

```typescript
{
  testDir: './e2e',                    // Test directory
  fullyParallel: false,                // Serial execution
  workers: 1,                          // Single worker
  use: {
    baseURL: 'http://localhost:3002',  // App URL
    storageState: 'playwright/.auth/user.json',  // Auth state
    screenshot: 'only-on-failure',     // Debug screenshots
  },
  globalSetup: './e2e/global-setup',   // Pre-test setup
  globalTeardown: './e2e/global-teardown',  // Post-test cleanup
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
  ],
  webServer: {
    command: 'npm run dev',            // Start dev server
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {                             // Test env vars
      DATABASE_URL: process.env.DATABASE_URL,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    },
  },
}
```

### Environment Variables

**`.env.test`** (test configuration):
```env
DATABASE_URL=postgresql://postgres:password@localhost:5437/finnari-test
BETTER_AUTH_SECRET=i4ddatGJkjrO0jRtpZO30tqwfFuvN5BC
BETTER_AUTH_URL=http://localhost:3002
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=Test123Password!
```

**`.env`** (development configuration):
```env
DATABASE_URL=postgresql://postgres:password@localhost:5436/finnari-v0
# ... other dev settings
```

### Docker Compose

**Test database service** (`docker-compose.yml`):
```yaml
services:
  db-test:
    image: postgres:18.0
    ports:
      - "5437:5432"
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_USER=postgres
      - POSTGRES_DB=finnari-test
    volumes:
      - pgdata-test:/var/lib/postgresql/data
```

---

## Best Practices

### ✅ Do

- Use descriptive test names
- Test one thing per test
- Use data-testid attributes for stable selectors
- Clean up test data if needed
- Add comments for complex test logic
- Use page object model for reusable interactions

### ❌ Don't

- Rely on fixed delays (`page.waitForTimeout()`) — use smart waits
- Test implementation details — test user-visible behavior
- Share state between tests
- Hardcode URLs — use `page.goto('/path')` with baseURL
- Skip authentication for most tests — reuse saved state

---

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Better-Auth Documentation](https://www.better-auth.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)

---

## Support

If you encounter issues:

1. Check this guide's Troubleshooting section
2. Review test logs (verbose output shows each step)
3. Run tests in headed mode to see what's happening: `npm run test:e2e:headed`
4. Check the HTML report: `npx playwright show-report`

---

**Happy Testing! 🎭**
