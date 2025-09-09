#!/bin/bash

echo "🎯 DispatchTracker - Production Verification"
echo "============================================="
echo ""
echo "Testing enhanced FileMaker integration at www.pepmovetracker.info"
echo ""

# Test 1: Enhanced jobs with customer data
echo "📋 Test 1: Enhanced jobs with customer addresses..."
curl -s "https://www.pepmovetracker.info/api/jobs?limit=5&hygiene=true" | jq '.data[0] | {id, customer, address, status, arrivalTime, completionTime}' 2>/dev/null || echo "Waiting for deployment..."

echo ""

# Test 2: Field access verification
echo "🧪 Test 2: Field access verification..."
curl -s -X POST "https://www.pepmovetracker.info/api/jobs" \
  -H "Content-Type: application/json" \
  -d '{"testFieldAccess": true}' | jq '.field_status.enhanced_fields' 2>/dev/null || echo "Waiting for deployment..."

echo ""

# Test 3: Vehicle tracking with job correlation
echo "🚛 Test 3: Vehicle tracking with job assignments..."
curl -s "https://www.pepmovetracker.info/api/tracking" | jq '.data | length' 2>/dev/null || echo "Waiting for deployment..."

echo ""
echo "🌐 Manual verification:"
echo "Visit: https://www.pepmovetracker.info"
echo "- Check if real customer names are displayed"
echo "- Verify service addresses are showing"
echo "- Confirm schedule hygiene is working"
echo ""
echo "Production endpoints:"
echo "• Jobs: https://www.pepmovetracker.info/api/jobs?limit=10"
echo "• Tracking: https://www.pepmovetracker.info/api/tracking"
echo "• Hygiene: https://www.pepmovetracker.info/api/schedule-hygiene"
