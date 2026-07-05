import { test, expect } from '@playwright/test'

const TEST_USER = {
  email: `e2e_${Date.now()}@test.com`,
  username: `user_${Date.now()}`,
  password: 'StrongPass1!',
}

test('signup, onboarding, and map page', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // Click signup link
  await page.locator('a[href="/signup"]').first().click()
  await page.waitForURL('/signup')
  await page.waitForLoadState('networkidle')

  // Fill signup form (inputs use placeholders, not name attrs)
  await page.locator('input[placeholder="Email"]').fill(TEST_USER.email)
  await page.locator('input[placeholder="Username"]').fill(TEST_USER.username)
  await page.locator('input[placeholder="Password"]').fill(TEST_USER.password)
  await page.locator('input[placeholder="Confirm password"]').fill(TEST_USER.password)
  await page.locator('button[type="submit"]').click()

  // Onboarding
  await page.waitForURL('/onboarding', { timeout: 10000 })
  await page.locator('button:has-text("Next")').click()
  await page.locator('button:has-text("Next")').click()
  await page.locator('button:has-text("Get started")').click()

  // Map page — check the Leaflet map is rendered
  await page.waitForURL('/map', { timeout: 10000 })
  await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 5000 })
})

test('login shows error for bad credentials', async ({ page }) => {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  await page.locator('input[type="email"]').fill('wrong@test.com')
  await page.locator('input[type="password"]').fill('wrong')
  await page.locator('button[type="submit"]').click()

  await expect(page.locator('text=Invalid')).toBeVisible({ timeout: 5000 })
})
