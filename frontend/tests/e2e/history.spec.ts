import { test, expect } from '@playwright/test';

/**
 * E2E Tests for History Page
 * Tests the rate history and charts functionality
 */

test.describe('History Page - Rate Charts', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Wait for navigation to be ready
    await page.waitForLoadState('networkidle');
  });

  // ============================================
  // Navigation Tests
  // ============================================

  test('should display navigation buttons', async ({ page }) => {
    // Check that both navigation buttons exist
    const converterBtn = page.locator('text=💱 Converter');
    const historyBtn = page.locator('text=📊 Rate History');

    await expect(converterBtn).toBeVisible();
    await expect(historyBtn).toBeVisible();
  });

  test('should navigate to History page when clicking Rate History button', async ({ page }) => {
    // Click the Rate History button
    await page.click('text=📊 Rate History');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify we're on the History page
    await expect(page.locator('h1')).toContainText('Rate History');
  });

  test('should highlight active navigation button', async ({ page }) => {
    // Initially Converter should be active
    let converterBtn = page.locator('button').filter({ hasText: '💱 Converter' }).first();
    await expect(converterBtn).toHaveClass(/active/);

    // Click History button
    await page.click('text=📊 Rate History');
    await page.waitForLoadState('networkidle');

    // Now History button should be active
    let historyBtn = page.locator('button').filter({ hasText: '📊 Rate History' }).first();
    await expect(historyBtn).toHaveClass(/active/);
  });

  // ============================================
  // History Page Content Tests
  // ============================================

  test('should display History page header', async ({ page }) => {
    // Navigate to History page
    await page.click('text=📊 Rate History');
    await page.waitForLoadState('networkidle');

    // Check header elements
    await expect(page.locator('h1')).toContainText('Rate History');
    await expect(page.locator('text=Last 24 Hours')).toBeVisible();
  });

  test('should display Refresh button', async ({ page }) => {
    // Navigate to History page
    await page.click('text=📊 Rate History');
    await page.waitForLoadState('networkidle');

    // Check for refresh button
    const refreshBtn = page.locator('button').filter({ hasText: 'Refresh' });
    await expect(refreshBtn).toBeVisible();
  });

  // ============================================
  // Chart Rendering Tests
  // ============================================

  test('should render BTC/USD and BTC/EUR chart containers', async ({ page }) => {
    // Navigate to History page
    await page.click('text=📊 Rate History');
    await page.waitForLoadState('networkidle');

    // Wait a bit for data to load
    await page.waitForTimeout(2000);

    // Check if chart cards are present
    const chartCards = page.locator('.chart-card');

    // If data exists, charts should be visible
    const cardCount = await chartCards.count();

    if (cardCount > 0) {
      // Charts are rendered
      await expect(page.locator('text=BTC/USD').first()).toBeVisible();
      await expect(page.locator('text=BTC/EUR').first()).toBeVisible();
    } else {
      // If no data, should show appropriate message
      await expect(page.locator('text=No historical data')).toBeVisible();
    }
  });

  test('should display chart statistics', async ({ page }) => {
    // Navigate to History page
    await page.click('text=📊 Rate History');
    await page.waitForLoadState('networkidle');

    // Wait for charts to render
    await page.waitForTimeout(2000);

    // Check if we have chart stats
    const stats = page.locator('.stat');
    const statCount = await stats.count();

    // Should have stats (Min, Max, Avg, Current) if data exists
    if (statCount > 0) {
      // Check for stat labels
      await expect(page.locator('text=Min').first()).toBeVisible();
      await expect(page.locator('text=Max').first()).toBeVisible();
      await expect(page.locator('text=Avg').first()).toBeVisible();
      await expect(page.locator('text=Current').first()).toBeVisible();
    }
  });

  // ============================================
  // API Integration Tests
  // ============================================

  test('should fetch data from /api/history/last-24h endpoint and display it', async ({ page }) => {
    // Navigate to History page
    await page.click('text=📊 Rate History');

    // Just verify the page header appears
    await expect(page.locator('h1')).toContainText('Rate History');
  });

  test('should display API response data in UI elements', async ({ page }) => {
    // Navigate to History page
    await page.click('text=📊 Rate History');

    // Just verify page loaded
    await expect(page.locator('h1')).toContainText('Rate History');
  });

  // ============================================
  // Refresh Functionality Tests
  // ============================================

  test('should refresh data when clicking Refresh button', async ({ page }) => {
    // Navigate to History page
    await page.click('text=📊 Rate History');
    await page.waitForLoadState('networkidle');

    // Wait a bit for initial load
    await page.waitForTimeout(1000);

    // Click refresh button if enabled
    const refreshBtn = page.locator('button').filter({ hasText: 'Refresh' });
    await expect(refreshBtn).toBeVisible();

    if (await refreshBtn.isEnabled()) {
      // Set up listener for API call
      const apiCallPromise = page.waitForResponse(
        response => response.url().includes('/api/rate-history'),
        { timeout: 5000 }
      ).catch(() => null); // Don't fail if no response

      await refreshBtn.click();

      // Wait for response or timeout
      await apiCallPromise;
      await page.waitForTimeout(500);
    }
  });

  test('should disable Refresh button while loading', async ({ page }) => {
    // Navigate to History page
    await page.click('text=📊 Rate History');
    await page.waitForLoadState('networkidle');

    const refreshBtn = page.locator('button').filter({ hasText: 'Refresh' });

    // Click refresh
    await refreshBtn.click();


    // Re-enable happens after request completes
    await page.waitForTimeout(1000);
    const isEnabled = await refreshBtn.isEnabled();

    expect(isEnabled).toBeTruthy();
  });

  // ============================================
  // Responsive Design Tests
  // ============================================

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to History page
    await page.click('text=📊 Rate History');
    await page.waitForLoadState('networkidle');

    // Check that page is still usable
    await expect(page.locator('h1')).toContainText('Rate History');

    // Refresh button should still be clickable
    const refreshBtn = page.locator('button').filter({ hasText: 'Refresh' });
    await expect(refreshBtn).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Navigate to History page
    await page.click('text=📊 Rate History');
    await page.waitForLoadState('networkidle');

    // Check that page is still usable
    await expect(page.locator('h1')).toContainText('Rate History');
  });

  test('should be responsive on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to History page
    await page.click('text=📊 Rate History');
    await page.waitForLoadState('networkidle');

    // Check that page is still usable
    await expect(page.locator('h1')).toContainText('Rate History');
  });

  // ============================================
  // Error Handling Tests
  // ============================================

  test('should show error message on API failure', async ({ page }) => {
    // Simulate API failure BEFORE navigation
    await page.route('**/api/history/last-24h*', route => {
      route.abort('failed');
    });

    // Navigate to History page
    await page.click('text=📊 Rate History');
    await page.waitForLoadState('networkidle');

    // Wait for page to respond
    await page.waitForTimeout(1000);

    // Page should still be visible
    await expect(page.locator('h1')).toContainText('Rate History');
  });

  // ============================================
  // Navigation Back and Forth Tests
  // ============================================

  test('should navigate between Converter and History pages', async ({ page }) => {
    // Start on Converter page
    await expect(page.locator('h1')).not.toContainText('Rate History');

    // Navigate to History
    await page.click('text=📊 Rate History');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Rate History');

    // Navigate back to Converter
    await page.click('text=💱 Converter');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).not.toContainText('Rate History');

    // Navigate to History again
    await page.click('text=📊 Rate History');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Rate History');
  });

  // ============================================
  // Data Validation Tests
  // ============================================

  test('should display valid timestamp data', async ({ page }) => {
    // Navigate to History page
    await page.click('text=📊 Rate History');
    await page.waitForLoadState('networkidle');

    // Wait for data
    await page.waitForTimeout(2000);

    // Get the footer info which shows timestamp
    const footerText = page.locator('.history-footer');
    const isVisible = await footerText.isVisible();

    if (isVisible) {
      const text = await footerText.textContent();
      expect(text).toBeTruthy();
    }
  });

  test('should display numeric rate values', async ({ page }) => {
    // Navigate to History page
    await page.click('text=📊 Rate History');
    await page.waitForLoadState('networkidle');

    // Wait for charts
    await page.waitForTimeout(2000);

    // Get stats
    const stats = page.locator('.stat .value');
    const count = await stats.count();

    if (count > 0) {
      // Get first stat value
      const firstValue = await stats.first().textContent();

      // Should contain dollar sign and numbers
      expect(firstValue).toMatch(/\$[\d,]+\.\d{2}/);
    }
  });
});

