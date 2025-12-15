# Frontend & Backend Testing Guide

## Overview

The application now has both manual and automated testing capabilities. The frontend has been updated to correctly call the backend API endpoints that match the Python implementation.

## Architecture

```
Frontend (Port 3000, Nginx)
    ↓ /api/* requests
Backend (Port 8080, Java Micronaut)
    ↓ Fetches data from
External API (CoinGecko)
    ↓ Stores in
Database (PostgreSQL Port 5432)
```

## API Endpoints

### Backend Endpoints (Java Micronaut at http://localhost:8080)

1. **GET /api/health** - Health check
   ```bash
   curl http://localhost:8080/api/health
   ```
   Response: `{"status":"healthy","version":"0.0.1"}`

2. **GET /api/prices/latest** - Get latest BTC/USD and BTC/EUR rates
   ```bash
   curl http://localhost:8080/api/prices/latest
   ```
   Response:
   ```json
   {
     "success": true,
     "data": {
       "id": 1,
       "btc_usd": 86464.0,
       "btc_eur": 73539.0,
       "timestamp": "2025-12-16T10:31:16.883768Z"
     }
   }
   ```

3. **POST /api/convert** - Convert BTC amount to USD and EUR
   ```bash
   curl -X POST http://localhost:8080/api/convert \
     -H 'Content-Type: application/json' \
     -d '{"btc_amount": 0.1}'
   ```
   Response:
   ```json
   {
     "success": true,
     "data": {
       "btc_amount": 0.1,
       "usd_amount": 8646.4,
       "eur_amount": 7353.9,
       "rates": {
         "btc_usd": 86464.0,
         "btc_eur": 73539.0
       },
       "timestamp": "2025-12-16T10:31:16.883768Z"
     }
   }
   ```

4. **GET /api/currencies** - Get supported currencies
   ```bash
   curl http://localhost:8080/api/currencies
   ```
   Response: `{"currencies":["BTC","ETH","LTC","XMR","EUR","USD"]}`

## Frontend Testing

### Method 1: Automated Tests (Browser Console)

1. **Open http://localhost:3000 in your browser**

2. **Open Browser Developer Console** (F12 or Cmd+Option+I on Mac)

3. **Run the test suite:**
   ```javascript
   apiTests.runAllTests()
   ```

4. **See results in console:**
   ```
   🧪 Starting Frontend API Tests
   ==================================================
   📋 Test 1: Health Check
   ✅ Health check passed
   
   📋 Test 2: Get Latest Prices
   ✅ Latest prices retrieved:
      BTC/USD: $86464
      BTC/EUR: €73539
   
   📋 Test 3: Convert 0.1 BTC
   ✅ Conversion successful:
      0.1 BTC = $8646.4 USD
      0.1 BTC = €7353.9 EUR
      Exchange Rates: 1 BTC = $86464 / €73539
   
   📋 Test 4: Convert 0.5 BTC
   ✅ Large amount conversion successful:
      0.5 BTC = $43232 USD (expected $43232)
      0.5 BTC = $36769.5 EUR (expected $36769.5)
   
   📋 Test 5: Get Supported Currencies
   ✅ Supported currencies retrieved:
      BTC, ETH, LTC, XMR, EUR, USD
   
   📋 Test 6: Error Handling - Invalid Amount (0)
   ✅ Error handling working:
      Error: BTC amount must be greater than 0
   
   📋 Test 7: Decimal Precision - Convert 0.00001 BTC
   ✅ Small amount conversion successful:
      0.00001 BTC = $0.86
   
   ==================================================
   📊 Test Summary:
     ✅ Health Check
     ✅ Get Latest Prices
     ✅ Convert 0.1 BTC
     ✅ Convert 0.5 BTC
     ✅ Get Supported Currencies
     ✅ Invalid Amount
     ✅ Decimal Precision
   
   Total: 7 passed, 0 failed
   ==================================================
   ```

### Method 2: Manual UI Testing

1. **Open http://localhost:3000**

2. **Test Basic Conversion:**
   - Enter amount: `0.1` BTC
   - See USD/EUR values auto-calculate
   - Verify rates match `/api/prices/latest`

3. **Test Unit Toggle:**
   - Click "Switch to Sats"
   - Verify amount converts to satoshis (0.1 BTC = 10,000,000 SATS)
   - Click again to switch back

4. **Test Currency Swap:**
   - Click ⇅ button
   - Verify currencies swap
   - Verify calculations update

5. **Test Add Currency:**
   - Click "+ Add Currency"
   - Select GBP or JPY
   - Verify rate fetches and displays

6. **Test Auto-Refresh:**
   - Leave page open for 5 minutes
   - Verify rate updates automatically
   - Check footer timestamp

### Method 3: Backend Unit Tests (curl)

#### Test 1: Health Check
```bash
curl http://localhost:8080/api/health
# Expected: {"status":"healthy","version":"0.0.1"}
```

#### Test 2: Get Latest Prices
```bash
curl http://localhost:8080/api/prices/latest
# Expected: success=true, btc_usd and btc_eur with real values
```

#### Test 3: Convert 0.1 BTC
```bash
curl -X POST http://localhost:8080/api/convert \
  -H 'Content-Type: application/json' \
  -d '{"btc_amount": 0.1}'
# Expected: success=true, usd_amount=8646.4 (approx), eur_amount=7353.9 (approx)
```

#### Test 4: Convert 0.5 BTC
```bash
curl -X POST http://localhost:8080/api/convert \
  -H 'Content-Type: application/json' \
  -d '{"btc_amount": 0.5}'
# Expected: usd_amount=43232, eur_amount=36769.5 (values 5x the 0.1 test)
```

#### Test 5: Convert 0.00001 BTC (Decimal Precision)
```bash
curl -X POST http://localhost:8080/api/convert \
  -H 'Content-Type: application/json' \
  -d '{"btc_amount": 0.00001}'
# Expected: small USD and EUR amounts, no rounding errors
```

#### Test 6: Invalid Amount (Error Handling)
```bash
curl -X POST http://localhost:8080/api/convert \
  -H 'Content-Type: application/json' \
  -d '{"btc_amount": 0}'
# Expected: success=false, error="BTC amount must be greater than 0"
```

#### Test 7: Currencies Endpoint
```bash
curl http://localhost:8080/api/currencies
# Expected: ["BTC","ETH","LTC","XMR","EUR","USD"]
```

## Integration Test Workflow

### Full E2E Test (Start to Finish)

```bash
# 1. Verify all containers running
docker compose ps
# Expected: All 3 containers in "Running" or "Healthy" status

# 2. Test backend health
curl http://localhost:8080/api/health
# Expected: {"status":"healthy","version":"0.0.1"}

# 3. Get initial prices
curl http://localhost:8080/api/prices/latest
# Expected: BTC/USD and BTC/EUR rates

# 4. Test conversion
curl -X POST http://localhost:8080/api/convert \
  -H 'Content-Type: application/json' \
  -d '{"btc_amount": 0.1}'
# Expected: Success with calculated amounts

# 5. Open frontend
# Visit http://localhost:3000 in browser

# 6. Run automated tests
# In browser console: apiTests.runAllTests()
# Expected: All 7 tests pass

# 7. Manual UI test
# Enter amount, toggle units, add currencies, verify rates update
```

## Docker Logs for Debugging

### View Backend Logs
```bash
docker logs vexlconverter-app -f
# Shows Micronaut startup, scheduled jobs, API calls
```

### View Frontend Logs
```bash
docker logs vexlconverter-frontend -f
# Shows Nginx server startup
```

### View Database Logs
```bash
docker logs vexlconverter-db -f
# Shows PostgreSQL startup
```

### View All Logs
```bash
docker compose logs -f
```

## Verification Checklist

- [ ] Backend container running on port 8080
- [ ] Frontend container running on port 3000
- [ ] Database container running on port 5432
- [ ] Health endpoint returns "healthy"
- [ ] /api/prices/latest returns BTC/USD and BTC/EUR rates
- [ ] /api/convert correctly calculates conversions
- [ ] Frontend loads without errors
- [ ] Converter form displays and accepts input
- [ ] Conversion results show both USD and EUR
- [ ] Rates auto-refresh every 5 minutes
- [ ] Browser console tests all pass
- [ ] No CORS errors in browser console
- [ ] Database logs show no errors

## Common Issues & Solutions

### Issue: Frontend can't reach backend

**Symptom:** Frontend shows "Failed to fetch latest prices" error

**Solutions:**
1. Check backend is running: `docker logs vexlconverter-app`
2. Test backend directly: `curl http://localhost:8080/api/health`
3. Restart backend: `docker compose restart app`
4. Check CORS config in `application.properties` includes `http://localhost:3000`

### Issue: Rates showing as 0.0

**Symptom:** BTC/EUR is always 0.0

**Solution:**
1. Check scheduler is running: `docker logs vexlconverter-app | grep "Refreshing BTC prices"`
2. Verify both USD and EUR rates are being fetched
3. Check database has both BTC/USD and BTC/EUR rows:
   ```bash
   docker exec vexlconverter-db psql -U postgres -d vexlconverter \
     -c "SELECT * FROM exchange_rate;"
   ```

### Issue: Conversion amounts don't match

**Symptom:** Amount calculations seem incorrect

**Solution:**
1. Verify rate: `curl http://localhost:8080/api/prices/latest`
2. Calculate manually: amount × rate = result
3. Check rounding: amounts are rounded to 2 decimal places
4. Verify database rate is correct: `docker exec vexlconverter-db psql ...`

## Performance Benchmarks

- API response time: <100ms (local)
- Database query: <50ms
- CoinGecko fetch: 500-2000ms (network dependent)
- Frontend build: ~1s
- Docker compose startup: ~10s

## Next Steps

1. **Run automated tests** to verify integration
2. **Monitor logs** while running tests
3. **Check database** to confirm persistence
4. **Test in production** with real data and longer intervals
5. **Add more currency pairs** as needed

---

**Questions?** Check logs, run tests, verify endpoints.

