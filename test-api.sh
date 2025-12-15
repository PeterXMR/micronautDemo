#!/bin/bash

# Vexl Converter Backend Test Script

echo "======================================="
echo "Vexl Converter Backend Test Script"
echo "======================================="
echo ""

# Check if server is running
echo "1. Testing Health Endpoint..."
curl -s http://localhost:8080/api/health
echo ""
echo ""

# Test ASCII to Hex conversion
echo "2. Testing ASCII to Hex Conversion..."
curl -s -X POST http://localhost:8080/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Hello",
    "fromFormat": "ascii",
    "toFormat": "hex"
  }' | json_pp
echo ""

# Test Hex to Base64 conversion
echo "3. Testing Hex to Base64 Conversion..."
curl -s -X POST http://localhost:8080/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "input": "48656c6c6f",
    "fromFormat": "hex",
    "toFormat": "base64"
  }' | json_pp
echo ""

# Test Base64 to ASCII conversion
echo "4. Testing Base64 to ASCII Conversion..."
curl -s -X POST http://localhost:8080/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "input": "SGVsbG8=",
    "fromFormat": "base64",
    "toFormat": "ascii"
  }' | json_pp
echo ""

# Test Binary to Decimal conversion
echo "5. Testing Binary to Decimal Conversion..."
curl -s -X POST http://localhost:8080/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "input": "01001000 01100101 01101100 01101100 01101111",
    "fromFormat": "binary",
    "toFormat": "decimal"
  }' | json_pp
echo ""

# Test Get Supported Formats
echo "6. Testing Get Supported Formats..."
curl -s http://localhost:8080/api/formats | json_pp
echo ""

# Test Error Handling
echo "7. Testing Error Handling (Invalid Hex)..."
curl -s -X POST http://localhost:8080/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "input": "invalid_hex_string",
    "fromFormat": "hex",
    "toFormat": "base64"
  }' | json_pp
echo ""

echo "======================================="
echo "All tests completed!"
echo "======================================="

