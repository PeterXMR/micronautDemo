#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                                                                           ║
# ║          🎯 VexlConverter - Data Integration Testing Commands            ║
# ║                                                                           ║
# ║  Question: Can Playwright check if relevant data exists on BE and        ║
# ║            verify if FE is showing them?                                 ║
# ║                                                                           ║
# ║  Answer: YES! ✅                                                          ║
# ║                                                                           ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

# Navigate to frontend directory
cd /Users/accountname/Desktop/Projects/demo1/frontend

# ═════════════════════════════════════════════════════════════════════════════
# 🧪 TESTING COMMANDS
# ═════════════════════════════════════════════════════════════════════════════

echo "📋 PLAYWRIGHT TEST COMMANDS"
echo "═════════════════════════════════════════════════════════════════════════════"
echo ""

echo "1️⃣  RUN INTEGRATION TESTS (Backend→Frontend validation)"
echo "   npm run test:integration"
echo "   └─ 5 tests that verify:"
echo "     ├─ Backend data is returned"
echo "     ├─ Frontend displays it"
echo "     ├─ Counts match"
echo "     ├─ Values correct"
echo "     └─ No silent failures"
echo ""

echo "2️⃣  RUN ALL TESTS"
echo "   npm test"
echo "   └─ 42 tests across 3 browsers (126 total)"
echo ""

echo "3️⃣  RUN SPECIFIC SUITES"
echo "   npm run test:api        # 18 API tests"
echo "   npm run test:history    # 19 History UI tests"
echo ""

echo "4️⃣  VIEW TEST RESULTS"
echo "   npm run test:report     # Browser report"
echo ""

echo "5️⃣  INTERACTIVE TESTING"
echo "   npm run test:ui         # UI mode"
echo "   npm run test:headed     # See browser"
echo ""

# ═════════════════════════════════════════════════════════════════════════════
# ✅ WHAT GETS TESTED
# ═════════════════════════════════════════════════════════════════════════════

echo "═════════════════════════════════════════════════════════════════════════════"
echo "✅ INTEGRATION TEST COVERAGE"
echo "═════════════════════════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
Test 1: Display All Backend Data
├─ Calls GET /api/history/last-24h
├─ Gets 18 data points
├─ Navigates to frontend
├─ Verifies "Data points: 18" appears
├─ Checks charts render (SVG)
└─ Verifies statistics display

Test 2: Display Specific Values
├─ Gets latest API data point
├─ Verifies USD/EUR values visible
├─ Confirms no error messages
└─ Validates exact prices on page

Test 3: Update Data When Changed
├─ Gets initial DB count
├─ Navigates to history page
├─ Verifies displayed count matches
└─ Validates data is current

Test 4: Conversion Math Matches
├─ Gets latest prices from API
├─ Performs conversion via API
├─ Performs same conversion on frontend
├─ Verifies results match
└─ Validates USD and EUR amounts

Test 5: Data Consistency
├─ Makes multiple API calls
├─ Verifies all return same data
├─ Checks frontend displays it
├─ Confirms no "no data" message
└─ Ensures no silent failures
EOF

echo ""
echo "═════════════════════════════════════════════════════════════════════════════"
echo "📊 EXPECTED TEST OUTPUT"
echo "═════════════════════════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
✅ Backend returned 18 data points
✅ Frontend shows 18 data points
✅ Frontend rendered 2 charts
✅ Frontend displays 8 statistics
✅ Frontend stat value (87623) is in expected range (87595-89924)
✅ Displayed data (18) matches backend total (18)
✅ Frontend displays conversion results matching API
✅ API returns consistent data across calls: 18 records
✅ Frontend correctly shows data (not showing "no data" message)

5/5 TESTS PASSED ✅
EOF

echo ""
echo "═════════════════════════════════════════════════════════════════════════════"
echo "🔧 QUICK SETUP CHECKLIST"
echo "═════════════════════════════════════════════════════════════════════════════"
echo ""

# Check if all services are running
echo "Checking services..."
echo ""

# Backend
if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "✅ Backend:   http://localhost:8080/api"
else
    echo "❌ Backend:   Not running"
fi

# Frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend:  http://localhost:3000"
else
    echo "❌ Frontend:  Not running"
fi

# Database
DATA_COUNT=$(curl -s http://localhost:8080/api/history/total | grep -o '"total":[0-9]*' | grep -o '[0-9]*' || echo "0")
echo "✅ Database:  $DATA_COUNT rate history records"

echo ""
echo "═════════════════════════════════════════════════════════════════════════════"
echo "🚀 READY TO TEST"
echo "═════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Run this command to start testing:"
echo ""
echo "  npm run test:integration"
echo ""
echo "Or run all tests:"
echo ""
echo "  npm test"
echo ""

