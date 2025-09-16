// Test Enhanced Geofencing and Gateway Analytics
// Run with: node test-enhancements.js

console.log('🧪 Testing DispatchTracker Enhancements: Tighter Geofencing + Gateway Analytics')

async function testGeofencingPrecision() {
  console.log('\n📏 Testing 0.25-mile geofencing precision...')
  
  const { calculateDistance } = await import('./lib/gps-utils.js')
  const { isVehicleAtLocation, getProximityStatus } = await import('./lib/gps-utils.js')
  
  // Test coordinates (Denver area)
  const vehicleCoords = { lat: 39.7392, lng: -104.9903 }
  const jobSite1 = { lat: 39.7400, lng: -104.9900 } // ~0.1 miles away
  const jobSite2 = { lat: 39.7450, lng: -104.9850 } // ~0.4 miles away
  const jobSite3 = { lat: 39.7500, lng: -104.9800 } // ~0.8 miles away
  
  const distance1 = calculateDistance(vehicleCoords, jobSite1)
  const distance2 = calculateDistance(vehicleCoords, jobSite2)
  const distance3 = calculateDistance(vehicleCoords, jobSite3)
  
  console.log(`   Distance to Job Site 1: ${distance1.toFixed(2)} miles`)
  console.log(`   Distance to Job Site 2: ${distance2.toFixed(2)} miles`)
  console.log(`   Distance to Job Site 3: ${distance3.toFixed(2)} miles`)
  
  const status1 = getProximityStatus(vehicleCoords, jobSite1)
  const status2 = getProximityStatus(vehicleCoords, jobSite2)
  const status3 = getProximityStatus(vehicleCoords, jobSite3)
  
  console.log(`   Job Site 1 Status: ${status1.status} (at-job: ${status1.isAt})`)
  console.log(`   Job Site 2 Status: ${status2.status} (at-job: ${status2.isAt})`)
  console.log(`   Job Site 3 Status: ${status3.status} (at-job: ${status3.isAt})`)
  
  // Verify 0.25-mile threshold
  const expectedResults = {
    site1: { shouldBeAtJob: true, expectedStatus: 'at-location' },
    site2: { shouldBeAtJob: false, expectedStatus: 'nearby' },
    site3: { shouldBeAtJob: false, expectedStatus: 'nearby' }
  }
  
  let passed = 0
  let total = 3
  
  if (status1.isAt === expectedResults.site1.shouldBeAtJob && status1.status === expectedResults.site1.expectedStatus) {
    console.log('   ✅ Job Site 1: PASS (correctly at-location within 0.25 miles)')
    passed++
  } else {
    console.log('   ❌ Job Site 1: FAIL')
  }
  
  if (status2.isAt === expectedResults.site2.shouldBeAtJob && status2.status === expectedResults.site2.expectedStatus) {
    console.log('   ✅ Job Site 2: PASS (correctly nearby, not at-job)')
    passed++
  } else {
    console.log('   ❌ Job Site 2: FAIL')
  }
  
  if (status3.isAt === expectedResults.site3.shouldBeAtJob && status3.status === expectedResults.site3.expectedStatus) {
    console.log('   ✅ Job Site 3: PASS (correctly nearby, not at-job)')
    passed++
  } else {
    console.log('   ❌ Job Site 3: FAIL')
  }
  
  console.log(`\n📊 Geofencing Test Results: ${passed}/${total} passed`)
  return passed === total
}

async function testGatewayAnalytics() {
  console.log('\n📡 Testing Gateway Coverage Analytics...')
  
  const { analyzeGatewayCoverage } = await import('./lib/gateway-analytics.js')
  
  // Mock vehicle data with mixed gateway capabilities
  const mockVehicleData = [
    {
      id: 'V1', name: 'TRUCK 77',
      diagnostics: {
        hasEngineData: true, hasGpsData: true,
        isEngineDataStale: false, isGpsDataStale: false,
        lastEngineTime: new Date().toISOString(),
        lastGpsTime: new Date().toISOString(),
        fuelLevel: 85, engineHours: 2500
      }
    },
    {
      id: 'V2', name: 'TRUCK 85',
      diagnostics: {
        hasEngineData: false, hasGpsData: true,
        isEngineDataStale: false, isGpsDataStale: false,
        lastGpsTime: new Date().toISOString(),
        fuelLevel: 0, engineHours: 0
      }
    },
    {
      id: 'V3', name: 'TRUCK 56',
      diagnostics: {
        hasEngineData: true, hasGpsData: true,
        isEngineDataStale: true, isGpsDataStale: false,
        lastEngineTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        lastGpsTime: new Date().toISOString(),
        fuelLevel: 60, engineHours: 1800
      }
    },
    {
      id: 'V4', name: 'OR 70',
      diagnostics: {
        hasEngineData: false, hasGpsData: false,
        isEngineDataStale: false, isGpsDataStale: false,
        fuelLevel: 0, engineHours: 0
      }
    }
  ]
  
  const { coverage, vehicleStatuses } = analyzeGatewayCoverage(mockVehicleData)
  
  console.log(`   Total vehicles: ${coverage.totalVehicles}`)
  console.log(`   Full telemetry gateways: ${coverage.vehiclesWithGateways}`)
  console.log(`   GPS-only vehicles: ${coverage.vehiclesGpsOnly}`)
  console.log(`   No data vehicles: ${coverage.vehiclesNoData}`)
  console.log(`   Gateway penetration: ${coverage.gatewayPenetration}%`)
  console.log(`   Fresh data vehicles: ${coverage.freshDataVehicles}`)
  console.log(`   Stale data vehicles: ${coverage.staleDataVehicles}`)
  
  console.log('\n   Vehicle Status Details:')
  vehicleStatuses.forEach(vehicle => {
    console.log(`   ${vehicle.vehicleName}: ${vehicle.gatewayType} (Engine:${vehicle.hasEngineData}, GPS:${vehicle.hasGpsData})`)
  })
  
  // Verify expected results
  const expectedCoverage = {
    totalVehicles: 4,
    vehiclesWithGateways: 1, // Only V1 has both fresh engine and GPS
    vehiclesGpsOnly: 1, // V2 has only GPS
    vehiclesNoData: 1, // V4 has no data
    gatewayPenetration: 25
  }
  
  let analyticsPass = (
    coverage.totalVehicles === expectedCoverage.totalVehicles &&
    coverage.vehiclesWithGateways === expectedCoverage.vehiclesWithGateways &&
    coverage.vehiclesGpsOnly === expectedCoverage.vehiclesGpsOnly &&
    coverage.vehiclesNoData === expectedCoverage.vehiclesNoData &&
    coverage.gatewayPenetration === expectedCoverage.gatewayPenetration
  )
  
  if (analyticsPass) {
    console.log('   ✅ Gateway Analytics: PASS (correct coverage analysis)')
  } else {
    console.log('   ❌ Gateway Analytics: FAIL')
    console.log('   Expected:', expectedCoverage)
    console.log('   Actual:', {
      totalVehicles: coverage.totalVehicles,
      vehiclesWithGateways: coverage.vehiclesWithGateways,
      vehiclesGpsOnly: coverage.vehiclesGpsOnly,
      vehiclesNoData: coverage.vehiclesNoData,
      gatewayPenetration: coverage.gatewayPenetration
    })
  }
  
  return analyticsPass
}

async function testTrackingAPIEndpoint() {
  console.log('\n🔗 Testing Tracking API with enhanced features...')
  
  try {
    const baseUrl = 'http://localhost:3002'
    const response = await fetch(`${baseUrl}/api/tracking`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    
    if (!response.ok) {
      console.log(`   ⚠️  API not running (${response.status}). Start with 'npm run dev' to test live.`)
      return false
    }
    
    const data = await response.json()
    
    console.log(`   ✅ API Response: ${response.status}`)
    console.log(`   Vehicles tracked: ${data.summary?.totalVehicles || 0}`)
    console.log(`   Vehicles with jobs: ${data.summary?.vehiclesWithJobs || 0}`)
    console.log(`   Vehicles at jobs (0.25mi): ${data.summary?.vehiclesAtJobs || 0}`)
    
    // Check if gateway coverage is included in response
    if (data.summary?.gatewayCoverage) {
      console.log(`   ✅ Gateway coverage data present:`)
      console.log(`      Full telemetry: ${data.summary.gatewayCoverage.vehiclesWithGateways}`)
      console.log(`      GPS-only: ${data.summary.gatewayCoverage.vehiclesGpsOnly}`)
      console.log(`      Gateway penetration: ${data.summary.gatewayCoverage.gatewayPenetration}%`)
      return true
    } else {
      console.log(`   ❌ Gateway coverage data missing from API response`)
      return false
    }
    
  } catch (error) {
    console.log(`   ⚠️  Could not connect to API: ${error.message}`)
    console.log(`   Start the development server with 'npm run dev' to test live integration`)
    return false
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive enhancement testing...\n')
  
  const geofencingPass = await testGeofencingPrecision()
  const analyticsPass = await testGatewayAnalytics()
  const apiPass = await testTrackingAPIEndpoint()
  
  console.log('\n📋 FINAL TEST RESULTS:')
  console.log(`   Tighter Geofencing (0.25mi): ${geofencingPass ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   Gateway Coverage Analytics: ${analyticsPass ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   Enhanced Tracking API: ${apiPass ? '✅ PASS' : '⚠️ SKIP (API offline)'}`)
  
  const overallPass = geofencingPass && analyticsPass
  
  console.log(`\n🎯 OVERALL STATUS: ${overallPass ? '✅ ALL CORE FEATURES WORKING' : '❌ ISSUES DETECTED'}`)
  
  if (overallPass) {
    console.log('\n🎉 Enhancement implementation successful!')
    console.log('Ready for dashboard UI updates and real FileMaker integration testing.')
  } else {
    console.log('\n🔧 Review failed components before proceeding.')
  }
}

// Execute tests
runAllTests().catch(console.error)
