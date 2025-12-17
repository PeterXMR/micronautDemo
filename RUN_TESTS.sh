#!/bin/bash

# ============================================
# VexlConverter - Test Execution Guide
# ============================================

# 1. Navigate to frontend
cd /Users/accountname/Desktop/Projects/demo1/frontend

# 2. Run all tests (Chromium, Firefox, WebKit)
npm test

# 3. Run tests in headed mode (see browsers)
npm run test:headed

# 4. Run tests in UI mode (interactive)
npm run test:ui

# 5. View test report
npm run test:report

# 6. Run specific test file
npx playwright test tests/e2e/api.spec.ts
npx playwright test tests/e2e/history.spec.ts

# 7. Run tests with specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# ============================================
# Expected Results
# ============================================
#
# Total Tests: 37 unique tests
# Browsers: 3 (Chromium, Firefox, WebKit)
# Total Executions: 111 (37 × 3)
# Runtime: ~2-3 minutes
# Status: All tests should PASS ✅
#
# API Tests: 18 tests
#   - ConversionController: 14 tests
#   - HistoryController: 4 tests
#
# History Page Tests: 19 tests
#
# ============================================

