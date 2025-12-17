import { test, expect } from '@playwright/test';

/**
 * API Tests for Backend Endpoints
 * Tests the existing APIs from:
 * - ConversionController: /api/health, /api/currencies, /api/prices/latest, /api/convert
 * - HistoryController: /api/history/last-24h, /api/history/total, /api/history/rate-history
 */

const API_BASE = 'http://localhost:8080/api';

test.describe('API Endpoints - ConversionController', () => {

  // ============================================
  // Health & Status Tests
  // ============================================

  test('GET /api/health - should return healthy status', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('version');
    expect(data.status).toBe('healthy');
  });

  // ============================================
  // Currencies Tests
  // ============================================

  test('GET /api/currencies - should return supported currencies', async ({ request }) => {
    const response = await request.get(`${API_BASE}/currencies`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('currencies');
    expect(Array.isArray(data.currencies)).toBeTruthy();
    expect(data.currencies.length).toBeGreaterThan(0);
    expect(data.currencies).toContain('BTC');
    expect(data.currencies).toContain('USD');
    expect(data.currencies).toContain('EUR');
  });

  // ============================================
  // Prices Tests
  // ============================================

  test('GET /api/prices/latest - should return latest BTC prices', async ({ request }) => {
    const response = await request.get(`${API_BASE}/prices/latest`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('data');

    const rateData = data.data;
    expect(rateData).toHaveProperty('btc_usd');
    expect(rateData).toHaveProperty('btc_eur');
    expect(rateData).toHaveProperty('id');
    expect(rateData).toHaveProperty('timestamp');

    // Verify rates are positive numbers
    expect(typeof rateData.btc_usd).toBe('number');
    expect(typeof rateData.btc_eur).toBe('number');
    expect(rateData.btc_usd).toBeGreaterThan(0);
    expect(rateData.btc_eur).toBeGreaterThan(0);
  });

  // ============================================
  // Conversion Tests
  // ============================================

  test('POST /api/convert - should convert BTC to USD and EUR', async ({ request }) => {
    const response = await request.post(`${API_BASE}/convert`, {
      data: { btc_amount: 0.1 }
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('data');

    const result = data.data;
    expect(result).toHaveProperty('btc_amount');
    expect(result).toHaveProperty('usd_amount');
    expect(result).toHaveProperty('eur_amount');
    expect(result).toHaveProperty('rates');
    expect(result).toHaveProperty('timestamp');

    // Verify calculations
    expect(typeof result.usd_amount).toBe('number');
    expect(typeof result.eur_amount).toBe('number');
    expect(result.usd_amount).toBeGreaterThan(0);
    expect(result.eur_amount).toBeGreaterThan(0);

    // Verify rates match
    expect(result.rates).toHaveProperty('btc_usd');
    expect(result.rates).toHaveProperty('btc_eur');
  });

  test('POST /api/convert - should validate BTC amount (zero)', async ({ request }) => {
    const response = await request.post(`${API_BASE}/convert`, {
      data: { btc_amount: 0 }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data.success).toBe(false);
    expect(data).toHaveProperty('error');
  });

  test('POST /api/convert - should validate BTC amount (negative)', async ({ request }) => {
    const response = await request.post(`${API_BASE}/convert`, {
      data: { btc_amount: -1 }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  test('POST /api/convert - should handle various amounts', async ({ request }) => {
    const amounts = [0.001, 0.01, 0.1, 1, 10];

    for (const amount of amounts) {
      const response = await request.post(`${API_BASE}/convert`, {
        data: { btc_amount: amount }
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.btc_amount).toBe(amount);
      expect(data.data.usd_amount).toBeGreaterThan(0);
      expect(data.data.eur_amount).toBeGreaterThan(0);
    }
  });

  // ============================================
  // Data Integrity Tests
  // ============================================

  test('should maintain data consistency between endpoints', async ({ request }) => {
    // Get prices
    const pricesResponse = await request.get(`${API_BASE}/prices/latest`);
    const pricesData = await pricesResponse.json();

    expect(pricesData.success).toBe(true);
    const btcUsd = pricesData.data.btc_usd;
    const btcEur = pricesData.data.btc_eur;

    // Convert 1 BTC and verify calculation
    const convertResponse = await request.post(`${API_BASE}/convert`, {
      data: { btc_amount: 1 }
    });

    const convertData = await convertResponse.json();
    expect(convertData.success).toBe(true);

    // 1 BTC should convert to approximately the rate (with tolerance for rounding)
    expect(Math.abs(convertData.data.usd_amount - btcUsd)).toBeLessThan(1);
    expect(Math.abs(convertData.data.eur_amount - btcEur)).toBeLessThan(1);
  });

  // ============================================
  // Performance Tests
  // ============================================

  test('should respond quickly to health check', async ({ request }) => {
    const startTime = Date.now();

    const response = await request.get(`${API_BASE}/health`);

    const elapsed = Date.now() - startTime;

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(2000);
  });

  test('should respond quickly to get prices', async ({ request }) => {
    const startTime = Date.now();

    const response = await request.get(`${API_BASE}/prices/latest`);

    const elapsed = Date.now() - startTime;

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(3000);
  });

  test('should handle concurrent requests', async ({ request }) => {
    const requests = [
      request.get(`${API_BASE}/health`),
      request.get(`${API_BASE}/currencies`),
      request.get(`${API_BASE}/prices/latest`),
      request.post(`${API_BASE}/convert`, { data: { btc_amount: 0.1 } }),
      request.post(`${API_BASE}/convert`, { data: { btc_amount: 1 } })
    ];

    const responses = await Promise.all(requests);

    responses.forEach(response => {
      expect(response.status()).toBeLessThan(400);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  test('POST /api/convert - should handle string BTC amount', async ({ request }) => {
    const response = await request.post(`${API_BASE}/convert`, {
      data: { btc_amount: "0.5" }
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.btc_amount).toBe(0.5);
  });

  test('GET /api/prices/latest - prices should be consistent across calls', async ({ request }) => {
    const response1 = await request.get(`${API_BASE}/prices/latest`);
    const data1 = await response1.json();

    const response2 = await request.get(`${API_BASE}/prices/latest`);
    const data2 = await response2.json();

    expect(data1.success).toBe(true);
    expect(data2.success).toBe(true);

    // Prices should be similar (within 1% tolerance for market fluctuation)
    const tolerance = 0.01;
    const diff = Math.abs(data1.data.btc_usd - data2.data.btc_usd) / data1.data.btc_usd;
    expect(diff).toBeLessThan(tolerance);
  });

  test('should have proper error responses', async ({ request }) => {
    const response = await request.get(`${API_BASE}/nonexistent`, {
      failOnStatusCode: false
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('API Endpoints - HistoryController', () => {

  // ============================================
  // Rate History - Last 24 Hours
  // ============================================

  test('GET /api/history/last-24h - should return last 24 hours data', async ({ request }) => {
    const response = await request.get(`${API_BASE}/history/last-24h`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('success');

    if (data.success === true) {
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBeTruthy();

      if (data.data.length > 0) {
        const firstRecord = data.data[0];
        expect(firstRecord).toHaveProperty('id');
        expect(firstRecord).toHaveProperty('btc_usd');
        expect(firstRecord).toHaveProperty('btc_eur');
        expect(firstRecord).toHaveProperty('timestamp');
      }
    } else {
      expect(data).toHaveProperty('error');
    }
  });

  // ============================================
  // Rate History - Total Count
  // ============================================

  test('GET /api/history/total - should return total count', async ({ request }) => {
    const response = await request.get(`${API_BASE}/history/total`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('success');

    if (data.success === true) {
      expect(data).toHaveProperty('total');
      expect(typeof data.total).toBe('number');
      expect(data.total).toBeGreaterThanOrEqual(0);
    }
  });

  // ============================================
  // Rate History - Last 24h Data Validation
  // ============================================

  test('GET /api/history/last-24h - data should have correct structure', async ({ request }) => {
    const response = await request.get(`${API_BASE}/history/last-24h`);

    expect(response.status()).toBe(200);

    const data = await response.json();

    if (data.success && data.data && data.data.length > 0) {
      data.data.forEach(record => {
        expect(record).toHaveProperty('id');
        expect(record).toHaveProperty('btc_usd');
        expect(record).toHaveProperty('btc_eur');
        expect(record).toHaveProperty('timestamp');

        expect(typeof record.id).toBe('number');
        expect(typeof record.btc_usd).toBe('number');
        expect(typeof record.btc_eur).toBe('number');
        expect(typeof record.timestamp).toBe('string');

        expect(record.btc_usd).toBeGreaterThan(0);
        expect(record.btc_eur).toBeGreaterThan(0);
      });
    }
  });

  test('GET /api/history/last-24h - should return ordered data by timestamp', async ({ request }) => {
    const response = await request.get(`${API_BASE}/history/last-24h`);

    expect(response.status()).toBe(200);

    const data = await response.json();

    if (data.success && data.data && data.data.length > 1) {
      // Verify data is ordered by timestamp ascending
      for (let i = 1; i < data.data.length; i++) {
        const prevTime = new Date(data.data[i - 1].timestamp).getTime();
        const currTime = new Date(data.data[i].timestamp).getTime();
        expect(currTime).toBeGreaterThanOrEqual(prevTime);
      }
    }
  });
});

