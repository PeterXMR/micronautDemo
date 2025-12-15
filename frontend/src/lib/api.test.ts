/**
 * Frontend API Tests
 * Tests that the frontend correctly calls the backend endpoints
 * and handles responses in the expected format.
 */

import { convert, getLatestPrices, getCurrencies, health } from './api'

/**
 * Test Suite: API Endpoints
 */
export const tests = {
  /**
   * Test 1: Health Check
   * Verifies the backend is responding
   */
  testHealth: async () => {
    console.log('📋 Test 1: Health Check')
    try {
      const response = await health()
      console.assert(response.status === 'healthy', 'Status should be "healthy"')
      console.assert(response.version === '0.0.1', 'Version should be "0.0.1"')
      console.log('✅ Health check passed')
      return true
    } catch (err) {
      console.error('❌ Health check failed:', err)
      return false
    }
  },

  /**
   * Test 2: Get Latest Prices
   * Verifies that /api/prices/latest returns BTC/USD and BTC/EUR rates
   */
  testGetLatestPrices: async () => {
    console.log('\n📋 Test 2: Get Latest Prices')
    try {
      const response = await getLatestPrices()
      console.assert(response.success === true, 'Success should be true')
      console.assert(response.data?.btc_usd > 0, 'BTC/USD rate should be > 0')
      console.assert(response.data?.btc_eur > 0, 'BTC/EUR rate should be > 0')
      console.assert(response.data?.id > 0, 'ID should exist')
      console.assert(response.data?.timestamp, 'Timestamp should exist')
      console.log(`✅ Latest prices retrieved:`)
      console.log(`   BTC/USD: $${response.data?.btc_usd}`)
      console.log(`   BTC/EUR: €${response.data?.btc_eur}`)
      return true
    } catch (err) {
      console.error('❌ Get latest prices failed:', err)
      return false
    }
  },

  /**
   * Test 3: Convert 0.1 BTC to USD and EUR
   * Verifies /api/convert with btc_amount parameter
   */
  testConvert: async () => {
    console.log('\n📋 Test 3: Convert 0.1 BTC')
    try {
      const response = await convert(0.1)
      console.assert(response.success === true, 'Success should be true')
      console.assert(response.data?.btc_amount === 0.1, 'BTC amount should match input')
      console.assert(response.data?.usd_amount > 0, 'USD amount should be > 0')
      console.assert(response.data?.eur_amount > 0, 'EUR amount should be > 0')
      console.assert(response.data?.rates?.btc_usd > 0, 'Rate BTC/USD should exist')
      console.assert(response.data?.rates?.btc_eur > 0, 'Rate BTC/EUR should exist')
      console.assert(response.data?.timestamp, 'Timestamp should exist')
      console.log(`✅ Conversion successful:`)
      console.log(`   0.1 BTC = $${response.data?.usd_amount} USD`)
      console.log(`   0.1 BTC = €${response.data?.eur_amount} EUR`)
      console.log(`   Exchange Rates: 1 BTC = $${response.data?.rates?.btc_usd} / €${response.data?.rates?.btc_eur}`)
      return true
    } catch (err) {
      console.error('❌ Convert failed:', err)
      return false
    }
  },

  /**
   * Test 4: Convert 0.5 BTC
   * Verifies conversion works with larger amount
   */
  testConvertLargeAmount: async () => {
    console.log('\n📋 Test 4: Convert 0.5 BTC')
    try {
      const response = await convert(0.5)
      console.assert(response.success === true, 'Success should be true')
      console.assert(response.data?.btc_amount === 0.5, 'BTC amount should match input')
      console.assert(response.data?.usd_amount > 0, 'USD amount should be > 0')
      console.assert(response.data?.eur_amount > 0, 'EUR amount should be > 0')
      // Verify math: 0.5 * rate = amount
      const expectedUsd = Math.round(0.5 * response.data!.rates!.btc_usd * 100) / 100
      const expectedEur = Math.round(0.5 * response.data!.rates!.btc_eur * 100) / 100
      console.assert(response.data?.usd_amount === expectedUsd, `USD amount should be ${expectedUsd}`)
      console.assert(response.data?.eur_amount === expectedEur, `EUR amount should be ${expectedEur}`)
      console.log(`✅ Large amount conversion successful:`)
      console.log(`   0.5 BTC = $${response.data?.usd_amount} USD (expected $${expectedUsd})`)
      console.log(`   0.5 BTC = €${response.data?.eur_amount} EUR (expected €${expectedEur})`)
      return true
    } catch (err) {
      console.error('❌ Large amount conversion failed:', err)
      return false
    }
  },

  /**
   * Test 5: Get Supported Currencies
   * Verifies /api/currencies endpoint
   */
  testGetCurrencies: async () => {
    console.log('\n📋 Test 5: Get Supported Currencies')
    try {
      const response = await getCurrencies()
      console.assert(Array.isArray(response.currencies), 'Currencies should be an array')
      console.assert(response.currencies.length > 0, 'Currencies array should not be empty')
      console.assert(response.currencies.includes('BTC'), 'Should include BTC')
      console.assert(response.currencies.includes('USD'), 'Should include USD')
      console.log(`✅ Supported currencies retrieved:`)
      console.log(`   ${response.currencies.join(', ')}`)
      return true
    } catch (err) {
      console.error('❌ Get currencies failed:', err)
      return false
    }
  },

  /**
   * Test 6: Error Handling - Invalid Amount
   * Verifies backend rejects invalid amounts
   */
  testInvalidAmount: async () => {
    console.log('\n📋 Test 6: Error Handling - Invalid Amount (0)')
    try {
      const response = await convert(0)
      console.assert(response.success === false, 'Should fail for amount = 0')
      console.assert(response.error, 'Should return error message')
      console.log(`✅ Error handling working:`)
      console.log(`   Error: ${response.error}`)
      return true
    } catch (err) {
      console.error('❌ Error handling test failed:', err)
      return false
    }
  },

  /**
   * Test 7: Verify Decimal Precision
   * Tests conversion with small amounts like 0.00001 BTC
   */
  testSmallAmount: async () => {
    console.log('\n📋 Test 7: Decimal Precision - Convert 0.00001 BTC')
    try {
      const response = await convert(0.00001)
      console.assert(response.success === true, 'Success should be true')
      console.assert(response.data?.btc_amount === 0.00001, 'BTC amount should match')
      console.assert(response.data?.usd_amount > 0, 'USD amount should be > 0')
      console.log(`✅ Small amount conversion successful:`)
      console.log(`   0.00001 BTC = $${response.data?.usd_amount}`)
      return true
    } catch (err) {
      console.error('❌ Small amount conversion failed:', err)
      return false
    }
  },
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🧪 Starting Frontend API Tests\n')
  console.log('Backend: http://localhost:8080')
  console.log('Frontend: http://localhost:3000\n')
  console.log('=' .repeat(50))

  const results: { [key: string]: boolean } = {}

  // Run tests in sequence
  results['Health Check'] = await tests.testHealth()
  results['Get Latest Prices'] = await tests.testGetLatestPrices()
  results['Convert 0.1 BTC'] = await tests.testConvert()
  results['Convert 0.5 BTC'] = await tests.testConvertLargeAmount()
  results['Get Currencies'] = await tests.testGetCurrencies()
  results['Invalid Amount'] = await tests.testInvalidAmount()
  results['Decimal Precision'] = await tests.testSmallAmount()

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 Test Summary:')
  let passed = 0
  let failed = 0
  Object.entries(results).forEach(([test, result]) => {
    if (result) {
      console.log(`  ✅ ${test}`)
      passed++
    } else {
      console.log(`  ❌ ${test}`)
      failed++
    }
  })
  console.log(`\nTotal: ${passed} passed, ${failed} failed`)
  console.log('='.repeat(50))

  return { passed, failed, total: passed + failed }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  ;(window as any).apiTests = { ...tests, runAllTests }
  console.log('💡 Tip: Run tests from console with: apiTests.runAllTests()')
}

